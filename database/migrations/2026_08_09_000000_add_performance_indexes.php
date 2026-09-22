<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds indexes to the columns that are actually used for filtering, sorting,
 * grouping and joining across the app (reports, order listing, slug uniqueness
 * checks, WhatsApp call filtering, soft-delete predicates).
 *
 * Foreign-key columns are intentionally skipped where MySQL/InnoDB already
 * auto-creates an index for the constraint (orders.customer_id,
 * order_items.order_id/fooditems_id/category_id, food_items.foodcategory_id,
 * media.order_id), as are columns that
 * already carry an explicit index/unique (customers.contact/email,
 * food_items.code, whatsapp_messages.{number,customer_id,sent_at},
 * whatsapp_calls.{number,customer_id,call_time}, users.email).
 *
 * Each index is guarded so this migration is safe to run against the existing
 * production database and is idempotent.
 */
return new class extends Migration
{
    /**
     * table => [ indexName => [columns...] ]
     */
    private function indexes(): array
    {
        return [
            'orders' => [
                // Every report filters and/or sorts orders by their datetime.
                'orders_order_datetime_index' => ['order_datetime'],
                // where('type', …) + whereBetween('order_datetime', …) in the
                // delivery / dining / on-way summary reports.
                'orders_type_order_datetime_index' => ['type', 'order_datetime'],
                // whereDate('created_at', …) in the item-quantity report.
                'orders_created_at_index' => ['created_at'],
                // Added later as an unindexed, FK-shaped column.
                'orders_place_id_index' => ['place_id'],
                // SoftDeletes adds a `deleted_at IS NULL` predicate to every query;
                // also filtered directly in the delete report.
                'orders_deleted_at_index' => ['deleted_at'],
            ],
            'order_items' => [
                // whereBetween('updated_at', …) drives two category-sales reports.
                'order_items_updated_at_index' => ['updated_at'],
                // SoftDeletes predicate.
                'order_items_deleted_at_index' => ['deleted_at'],
            ],
            'whatsapp_calls' => [
                // where('status', …) in the calls list + reject flow.
                'whatsapp_calls_status_index' => ['status'],
            ],
            'food_categories' => [
                // Uniqueness lookup on every category create/update.
                'food_categories_slug_index' => ['slug'],
            ],
        ];
    }

    public function up(): void
    {
        foreach ($this->indexes() as $table => $indexes) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) use ($table, $indexes) {
                foreach ($indexes as $name => $columns) {
                    // Skip if any target column is missing or the index already exists.
                    foreach ($columns as $column) {
                        if (! Schema::hasColumn($table, $column)) {
                            continue 2;
                        }
                    }

                    if (Schema::hasIndex($table, $name)) {
                        continue;
                    }

                    $blueprint->index($columns, $name);
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->indexes() as $table => $indexes) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) use ($table, $indexes) {
                foreach ($indexes as $name => $columns) {
                    if (Schema::hasIndex($table, $name)) {
                        $blueprint->dropIndex($name);
                    }
                }
            });
        }
    }
};
