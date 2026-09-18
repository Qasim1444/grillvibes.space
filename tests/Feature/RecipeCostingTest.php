<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\FoodItem;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\PurchaseOrder;
use App\Models\RecipeItem;
use App\Models\StockLevel;
use App\Models\StockMovement;
use App\Models\Vendor;
use App\Services\GoodsReceiptService;
use App\Services\PurchaseOrderService;
use App\Services\RecipeCostService;
use App\Services\StockConsumptionService;
use App\Services\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The procurement -> stock -> recipe -> sale chain.
 *
 * PROCUREMENT -> PURCHASE ORDER -> GOODS RECEIPT -> STOCK
 *   -> ORDER -> ORDER ITEM -> FOOD ITEM -> RECIPE -> INGREDIENTS -> STOCK DEDUCTION
 *
 * The invariants these tests defend:
 *
 *  1. Only a goods receipt changes `average_cost` — issuing stock consumes value,
 *     it never re-prices what is left.
 *  2. `stock_movements` always explains `stock_levels`: replaying the ledger must
 *     reproduce the balance exactly.
 *  3. Consumption is idempotent. A retried checkout must not drain the store room
 *     twice, because that error is invisible until a stock take months later.
 *  4. A sale's COGS is snapshotted, so history survives later price moves.
 */
class RecipeCostingTest extends TestCase
{
    use RefreshDatabase;

    private Branch $branch;

    private Vendor $vendor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::create(['name' => 'Main Kitchen', 'status' => true]);
        $this->vendor = Vendor::create(['name' => 'Metro Wholesale', 'is_active' => true]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function receipts(): GoodsReceiptService
    {
        return app(GoodsReceiptService::class);
    }

    private function costing(): RecipeCostService
    {
        return app(RecipeCostService::class);
    }

    private function consumption(): StockConsumptionService
    {
        return app(StockConsumptionService::class);
    }

    /** Book a delivery of one ingredient at a known price. */
    private function receive(Ingredient $ingredient, float $qty, float $unitCost): void
    {
        $this->receipts()->post(
            ['branch_id' => $this->branch->id, 'vendor_id' => $this->vendor->id],
            [['ingredient_id' => $ingredient->id, 'quantity' => $qty, 'unit_cost' => $unitCost]],
        );
    }

    private function stockOf(Ingredient $ingredient): StockLevel
    {
        return StockLevel::where('branch_id', $this->branch->id)
            ->where('ingredient_id', $ingredient->id)
            ->firstOrFail();
    }

    /** A dish priced at `$price` that consumes `$qty` of `$ingredient` per portion. */
    private function dish(Ingredient $ingredient, float $qty, float $price): FoodItem
    {
        $dish = FoodItem::factory()->create(['price' => $price, 'status' => true]);

        RecipeItem::create([
            'food_item_id' => $dish->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => $qty,
        ]);

        return $dish->refresh();
    }

    /** An order for `$portions` of `$dish` at this branch. */
    private function sell(FoodItem $dish, int $portions): Order
    {
        $order = Order::factory()->create([
            'branch_id' => $this->branch->id,
            'qty' => $portions,
            'grand_total' => (float) $dish->price * $portions,
        ]);

        $order->orderItems()->create([
            'fooditems_id' => $dish->id,
            'category_id' => $dish->foodcategory_id,
            'quantity' => $portions,
            'sub_total' => (float) $dish->price * $portions,
        ]);

        return $order;
    }

    // ── Procurement -> stock ─────────────────────────────────────────────────

    public function test_a_goods_receipt_raises_stock_and_sets_its_cost(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();

        $this->receive($flour, 10, 100);

        $stock = $this->stockOf($flour);

        $this->assertEquals(10, (float) $stock->quantity);
        $this->assertEquals(100, (float) $stock->average_cost);
        $this->assertEquals(1000, $stock->value());
    }

    public function test_a_second_delivery_blends_the_moving_average(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();

        $this->receive($flour, 10, 100); // 10 kg worth 1000
        $this->receive($flour, 10, 200); // 10 kg worth 2000

        $stock = $this->stockOf($flour);

        // (10*100 + 10*200) / 20 = 150
        $this->assertEquals(20, (float) $stock->quantity);
        $this->assertEquals(150, (float) $stock->average_cost);
        $this->assertEquals(3000, $stock->value());
    }

    public function test_the_ledger_explains_the_balance(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();

        $this->receive($flour, 10, 100);
        $this->receive($flour, 5, 120);

        $movements = StockMovement::where('ingredient_id', $flour->id)->orderBy('id')->get();

        $this->assertCount(2, $movements);
        $this->assertSame(StockMovement::TYPE_PURCHASE, $movements->first()->type);

        // Replaying the ledger reproduces the balance, and the last balance_after
        // snapshot agrees with the live stock row.
        $replayed = (float) $movements->sum('quantity');

        $this->assertEquals(15, $replayed);
        $this->assertEquals($replayed, (float) $this->stockOf($flour)->quantity);
        $this->assertEquals(15, (float) $movements->last()->balance_after);
    }

    public function test_a_receipt_against_a_purchase_order_tallies_it_and_closes_it(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();

        $po = app(PurchaseOrderService::class)->create(
            ['branch_id' => $this->branch->id, 'vendor_id' => $this->vendor->id],
            [['ingredient_id' => $flour->id, 'quantity' => 20, 'unit_cost' => 50]],
        );

        $this->assertEquals(1000, (float) $po->total);
        $this->assertSame(PurchaseOrder::STATUS_DRAFT, $po->status);

        app(PurchaseOrderService::class)->markOrdered($po);
        $this->receipts()->receiveInFull($po->refresh());

        $po->refresh();

        $this->assertSame(PurchaseOrder::STATUS_RECEIVED, $po->status);
        $this->assertEquals(20, (float) $po->items()->first()->received_qty);
        $this->assertEquals(0, $po->items()->first()->outstandingQty());
        $this->assertEquals(20, (float) $this->stockOf($flour)->quantity);
    }

    public function test_a_purchase_order_alone_moves_no_stock(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();

        app(PurchaseOrderService::class)->create(
            ['branch_id' => $this->branch->id, 'vendor_id' => $this->vendor->id],
            [['ingredient_id' => $flour->id, 'quantity' => 20, 'unit_cost' => 50]],
        );

        // Ordering is a commitment, not a delivery.
        $this->assertDatabaseCount('stock_movements', 0);
        $this->assertSame(0, StockLevel::count());
    }

    // ── Recipe costing ───────────────────────────────────────────────────────

    public function test_dish_cost_and_food_cost_percent_derive_from_stock_valuation(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();

        $this->receive($flour, 10, 100);
        $this->receive($flour, 10, 200); // average settles at 150

        $dish = $this->dish($flour, 0.25, 100); // 0.25 kg per portion, sells for 100

        // 0.25 * 150 = 37.50 -> 37.5% of the 100 selling price
        $this->assertEquals(37.5, $this->costing()->dishCost($dish, $this->branch->id));
        $this->assertEquals(37.5, $this->costing()->foodCostPercent($dish, $this->branch->id));
        $this->assertEquals(62.5, $this->costing()->contributionMargin($dish, $this->branch->id));
    }

    public function test_food_cost_percent_tracks_a_price_rise_with_no_recalculation_job(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();

        $this->receive($flour, 10, 100);
        $dish = $this->dish($flour, 0.5, 100);

        $this->assertEquals(50.0, $this->costing()->foodCostPercent($dish, $this->branch->id));

        // The supplier doubles their price and a delivery is booked in.
        $this->receive($flour, 10, 300); // average -> 200

        $this->assertEquals(100.0, $this->costing()->foodCostPercent($dish, $this->branch->id));
    }

    public function test_an_uncosted_dish_reports_null_rather_than_zero(): void
    {
        $dish = FoodItem::factory()->create(['price' => 100]);

        // No recipe: "unknown", which must not be charted as a 0% food cost.
        $this->assertNull($this->costing()->foodCostPercent($dish, $this->branch->id));
        $this->assertNull($this->costing()->contributionMargin($dish, $this->branch->id));
        $this->assertSame([], $this->costing()->breakdown($dish, $this->branch->id));
    }

    public function test_portions_available_is_set_by_the_limiting_ingredient(): void
    {
        $patty = Ingredient::factory()->unit('kg')->create();
        $bun = Ingredient::factory()->unit('pcs')->create();

        $this->receive($patty, 3, 500);  // 3 kg / 0.15 = 20 portions
        $this->receive($bun, 8, 20);     // 8 pcs / 1    =  8 portions

        $dish = FoodItem::factory()->create(['price' => 500]);
        RecipeItem::create(['food_item_id' => $dish->id, 'ingredient_id' => $patty->id, 'quantity' => 0.15]);
        RecipeItem::create(['food_item_id' => $dish->id, 'ingredient_id' => $bun->id, 'quantity' => 1]);

        $this->assertSame(8, $this->costing()->portionsAvailable($dish->refresh(), $this->branch->id));
    }

    public function test_cost_is_scoped_per_branch(): void
    {
        $other = Branch::create(['name' => 'Airport Counter', 'status' => true]);

        $flour = Ingredient::factory()->unit('kg')->create();

        $this->receive($flour, 10, 100); // main kitchen buys at 100
        app(StockService::class)->receive($other->id, $flour->id, 10, 400); // other outlet pays 400

        $dish = $this->dish($flour, 1, 1000);

        $this->assertEquals(100, $this->costing()->dishCost($dish, $this->branch->id));
        $this->assertEquals(400, $this->costing()->dishCost($dish, $other->id));
    }

    // ── Sale -> stock deduction ──────────────────────────────────────────────

    public function test_selling_a_dish_deducts_its_ingredients_and_records_cogs(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();

        $this->receive($flour, 10, 100);
        $this->receive($flour, 10, 200); // average 150, 20 kg on hand

        $dish = $this->dish($flour, 0.25, 100);
        $order = $this->sell($dish, 2);

        $this->consumption()->consumeForOrder($order);

        // 2 portions * 0.25 kg = 0.5 kg drawn down
        $this->assertEquals(19.5, (float) $this->stockOf($flour)->quantity);

        // 0.5 kg * 150 = 75.00
        $this->assertEquals(75, (float) $order->orderItems()->first()->cost_price);
        $this->assertEquals(75, (float) $order->refresh()->cogs_total);
        $this->assertNotNull($order->stock_consumed_at);

        // Issuing consumes value; it must not re-price the remaining stock.
        $this->assertEquals(150, (float) $this->stockOf($flour)->average_cost);
    }

    public function test_the_sale_is_traceable_back_to_the_order(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $this->receive($flour, 10, 100);

        $order = $this->sell($this->dish($flour, 1, 500), 3);
        $this->consumption()->consumeForOrder($order);

        $movement = StockMovement::where('type', StockMovement::TYPE_SALE)->firstOrFail();

        $this->assertSame(Order::class, $movement->reference_type);
        $this->assertEquals($order->id, $movement->reference_id);
        $this->assertEquals(-3, (float) $movement->quantity); // out is negative
        $this->assertEquals(7, (float) $movement->balance_after);
    }

    public function test_consuming_twice_does_not_deduct_twice(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $this->receive($flour, 10, 100);

        $order = $this->sell($this->dish($flour, 1, 500), 2);

        $this->consumption()->consumeForOrder($order);
        $this->consumption()->consumeForOrder($order); // retried checkout
        $this->consumption()->consumeForOrder($order->refresh());

        $this->assertEquals(8, (float) $this->stockOf($flour)->quantity);
        $this->assertSame(1, StockMovement::where('type', StockMovement::TYPE_SALE)->count());
    }

    public function test_a_dish_without_a_recipe_still_sells(): void
    {
        $dish = FoodItem::factory()->create(['price' => 100]);
        $order = $this->sell($dish, 2);

        $this->consumption()->consumeForOrder($order);

        // Costed as zero and deducting nothing, but the sale is not blocked.
        $this->assertEquals(0, (float) $order->refresh()->cogs_total);
        $this->assertNull($order->orderItems()->first()->cost_price);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_stock_may_go_negative_rather_than_block_a_sale(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $this->receive($flour, 1, 100);

        $order = $this->sell($this->dish($flour, 1, 500), 4);
        $this->consumption()->consumeForOrder($order);

        // The sale already happened at the till; a negative balance is the signal
        // that a delivery or a stock take is missing.
        $this->assertEquals(-3, (float) $this->stockOf($flour)->quantity);
        $this->assertEquals(400, (float) $order->refresh()->cogs_total);
    }

    public function test_reversing_a_sale_returns_the_ingredients(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $this->receive($flour, 10, 100);

        $order = $this->sell($this->dish($flour, 1, 500), 3);

        $this->consumption()->consumeForOrder($order);
        $this->assertEquals(7, (float) $this->stockOf($flour)->quantity);

        $this->consumption()->reverseForOrder($order);

        $stock = $this->stockOf($flour);

        $this->assertEquals(10, (float) $stock->quantity);
        $this->assertEquals(100, (float) $stock->average_cost); // returned at the cost it left at
        $this->assertNull($order->refresh()->cogs_total);
        $this->assertNull($order->stock_consumed_at);
        $this->assertNull($order->orderItems()->first()->cost_price);
    }

    public function test_a_reversal_replays_the_ledger_not_the_current_recipe(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $this->receive($flour, 10, 100);

        $dish = $this->dish($flour, 1, 500);
        $order = $this->sell($dish, 2);

        $this->consumption()->consumeForOrder($order); // took 2 kg
        $this->assertEquals(8, (float) $this->stockOf($flour)->quantity);

        // The chef re-writes the recipe AFTER the sale.
        RecipeItem::where('food_item_id', $dish->id)->update(['quantity' => 5]);

        $this->consumption()->reverseForOrder($order->refresh());

        // Exactly the 2 kg that left is returned — not the 10 kg the new recipe implies.
        $this->assertEquals(10, (float) $this->stockOf($flour)->quantity);
    }

    public function test_reversing_an_uncosted_order_is_a_no_op(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $this->receive($flour, 10, 100);

        $order = $this->sell($this->dish($flour, 1, 500), 2);

        $this->consumption()->reverseForOrder($order); // never consumed

        $this->assertEquals(10, (float) $this->stockOf($flour)->quantity);
        $this->assertSame(0, StockMovement::where('type', StockMovement::TYPE_SALE_REVERSAL)->count());
    }

    public function test_cogs_is_snapshotted_and_survives_a_later_price_move(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $this->receive($flour, 10, 100);

        $order = $this->sell($this->dish($flour, 1, 500), 2);
        $this->consumption()->consumeForOrder($order);

        $this->assertEquals(200, (float) $order->refresh()->cogs_total);
        // Sold for 1000, cost 200 to make.
        $this->assertEquals(800, $order->grossProfit());

        // Prices triple afterwards.
        $this->receive($flour, 100, 300);

        // History must not be rewritten by today's cost.
        $order->refresh();

        $this->assertEquals(200, (float) $order->cogs_total);
        $this->assertEquals(800, $order->grossProfit());
    }

    // ── Wastage / stock take ─────────────────────────────────────────────────

    public function test_wastage_and_stock_takes_are_logged(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $this->receive($flour, 10, 100);

        app(StockService::class)->writeOff($this->branch->id, $flour->id, 2, 'Spoiled');
        $this->assertEquals(8, (float) $this->stockOf($flour)->quantity);

        $delta = app(StockService::class)->adjustTo($this->branch->id, $flour->id, 7.5, note: 'Monthly count');

        $this->assertEquals(-0.5, $delta);
        $this->assertEquals(7.5, (float) $this->stockOf($flour)->quantity);
        $this->assertSame(1, StockMovement::where('type', StockMovement::TYPE_WASTAGE)->count());
        $this->assertSame(1, StockMovement::where('type', StockMovement::TYPE_ADJUSTMENT)->count());
    }

    // ── Purchase-order lifecycle guards ──────────────────────────────────────

    private function purchaseOrders(): PurchaseOrderService
    {
        return app(PurchaseOrderService::class);
    }

    private function draftPo(Ingredient $ingredient, float $qty = 10, float $cost = 50): PurchaseOrder
    {
        return $this->purchaseOrders()->create(
            ['branch_id' => $this->branch->id, 'vendor_id' => $this->vendor->id],
            [['ingredient_id' => $ingredient->id, 'quantity' => $qty, 'unit_cost' => $cost]],
        );
    }

    public function test_a_draft_can_be_relined_and_its_total_recalculated(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $oil = Ingredient::factory()->unit('litre')->create();

        $po = $this->draftPo($flour, 10, 50); // 500

        $po = $this->purchaseOrders()->updateLines($po, [
            ['ingredient_id' => $flour->id, 'quantity' => 4, 'unit_cost' => 50],  // 200
            ['ingredient_id' => $oil->id, 'quantity' => 2, 'unit_cost' => 125],   // 250
        ]);

        $this->assertSame(2, $po->items()->count());
        $this->assertEquals(450, (float) $po->total);
    }

    public function test_a_sent_purchase_order_cannot_be_relined(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $po = $this->purchaseOrders()->markOrdered($this->draftPo($flour));

        // Goods may already be arriving against the agreed lines.
        $this->expectException(\RuntimeException::class);

        $this->purchaseOrders()->updateLines($po, [
            ['ingredient_id' => $flour->id, 'quantity' => 999, 'unit_cost' => 1],
        ]);
    }

    public function test_a_purchase_order_cannot_be_sent_twice(): void
    {
        $po = $this->purchaseOrders()->markOrdered($this->draftPo(Ingredient::factory()->create()));

        $this->expectException(\RuntimeException::class);

        $this->purchaseOrders()->markOrdered($po);
    }

    public function test_cancelling_a_part_delivered_order_keeps_what_arrived(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $po = $this->purchaseOrders()->markOrdered($this->draftPo($flour, 10, 50));

        // Only 4 of the 10 kg turn up.
        $this->receipts()->post(
            [
                'branch_id' => $this->branch->id,
                'vendor_id' => $this->vendor->id,
                'purchase_order_id' => $po->id,
            ],
            [[
                'ingredient_id' => $flour->id,
                'purchase_order_item_id' => $po->items()->first()->id,
                'quantity' => 4,
                'unit_cost' => 50,
            ]],
        );

        $this->assertSame(PurchaseOrder::STATUS_PARTIALLY_RECEIVED, $po->refresh()->status);
        $this->assertEquals(6, $po->items()->first()->outstandingQty());

        $this->purchaseOrders()->cancel($po, 'Vendor out of stock');

        // The delivered 4 kg keeps its stock and its ledger row; only the
        // outstanding balance is abandoned.
        $this->assertSame(PurchaseOrder::STATUS_CANCELLED, $po->refresh()->status);
        $this->assertEquals(4, (float) $this->stockOf($flour)->quantity);
        $this->assertStringContainsString('Vendor out of stock', $po->notes);
    }

    public function test_a_fully_received_order_cannot_be_cancelled(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $po = $this->purchaseOrders()->markOrdered($this->draftPo($flour));

        $this->receipts()->receiveInFull($po->refresh());

        $this->expectException(\RuntimeException::class);

        $this->purchaseOrders()->cancel($po->refresh());
    }

    public function test_receiving_a_settled_order_again_is_refused(): void
    {
        $flour = Ingredient::factory()->unit('kg')->create();
        $po = $this->purchaseOrders()->markOrdered($this->draftPo($flour));

        $this->receipts()->receiveInFull($po->refresh());

        $this->expectException(\InvalidArgumentException::class);

        $this->receipts()->receiveInFull($po->refresh());
    }

    public function test_an_ad_hoc_delivery_needs_no_purchase_order(): void
    {
        $milk = Ingredient::factory()->unit('litre')->create();

        // The emergency corner-shop run.
        $grn = $this->receipts()->post(
            ['branch_id' => $this->branch->id, 'vendor_id' => $this->vendor->id],
            [['ingredient_id' => $milk->id, 'quantity' => 6, 'unit_cost' => 90]],
        );

        $this->assertNull($grn->purchase_order_id);
        $this->assertEquals(540, (float) $grn->total);
        $this->assertEquals(6, (float) $this->stockOf($milk)->quantity);
        $this->assertMatchesRegularExpression('/^GRN-\d{6}$/', $grn->grn_number);
    }

    public function test_an_empty_delivery_is_refused(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->receipts()->post(
            ['branch_id' => $this->branch->id, 'vendor_id' => $this->vendor->id],
            [],
        );
    }
}
