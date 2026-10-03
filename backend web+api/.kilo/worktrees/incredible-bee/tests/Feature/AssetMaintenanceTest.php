<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Branch;
use App\Models\MaintenanceRecord;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Support\CurrentBranch;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\Phase4PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetMaintenanceTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(
            ['slug' => Role::SUPER_ADMIN],
            ['name' => 'Super Admin', 'description' => 'Full access', 'is_locked' => true]
        );
        $user->assignRole($role);

        return $user;
    }

    public function test_assets_page_renders_with_its_management_props(): void
    {
        $this->actingAs($this->superAdmin())
            ->get('/maintenance/assets')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Maintenance/Assets')
                ->has('assets')
                ->has('branches')
                ->has('vendors')
                ->has('categories')
                ->has('statuses')
                ->has('summary')
            );
    }

    public function test_maintenance_logs_page_renders_with_its_management_props(): void
    {
        $this->actingAs($this->superAdmin())
            ->get('/maintenance/logs')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Maintenance/MaintenanceLogs')
                ->has('records')
                ->has('assets')
                ->has('branches')
                ->has('vendors')
                ->has('types')
                ->has('statuses')
                ->has('summary')
            );
    }

    public function test_creating_an_asset_generates_a_code_and_defaults_the_branch(): void
    {
        $user = $this->superAdmin();

        // Resolve the branch the controller will fall back to for a fresh session.
        CurrentBranch::flush();
        $expectedBranchId = CurrentBranch::id();

        $this->actingAs($user)
            ->post('/maintenance/assets', [
                'name' => 'Rational Combi Oven',
                'category' => 'kitchen_equipment',
                'maintenance_interval_days' => 30,
                'last_maintenance_date' => now()->toDateString(),
            ])
            ->assertRedirect();

        $asset = Asset::firstOrFail();
        $this->assertStringStartsWith('AST-', $asset->asset_code);
        $this->assertSame($expectedBranchId, $asset->branch_id);
        $this->assertSame('active', $asset->status);
        // Next service = last-serviced date + interval.
        $this->assertSame(
            now()->addDays(30)->toDateString(),
            $asset->next_maintenance_date?->toDateString()
        );
    }

    public function test_logging_an_in_progress_record_generates_a_number_and_downs_the_asset(): void
    {
        $user = $this->superAdmin();
        $branch = Branch::create(['name' => 'Central Kitchen', 'status' => true]);
        $vendor = Vendor::create(['name' => 'CoolTech Services', 'is_active' => true]);

        $asset = Asset::create([
            'asset_code' => Asset::generateAssetCode(),
            'name' => 'Walk-in Freezer',
            'category' => 'refrigeration',
            'branch_id' => $branch->id,
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->post('/maintenance/logs', [
                'asset_id' => $asset->id,
                'type' => 'corrective',
                'status' => 'in_progress',
                'description' => 'Compressor not cooling',
                'vendor_id' => $vendor->id,
                'cost' => 15000,
            ])
            ->assertRedirect();

        $record = MaintenanceRecord::firstOrFail();
        $this->assertStringStartsWith('MNT-', $record->maintenance_number);
        // Branch is denormalised from the asset.
        $this->assertSame($branch->id, $record->branch_id);
        $this->assertSame($user->id, $record->created_by);
        // An in-progress job takes the asset down.
        $this->assertSame('under_maintenance', $asset->fresh()->status);
    }

    public function test_completing_a_record_rolls_service_dates_and_reactivates_the_asset(): void
    {
        $user = $this->superAdmin();
        $branch = Branch::create(['name' => 'North Outlet', 'status' => true]);

        $asset = Asset::create([
            'asset_code' => Asset::generateAssetCode(),
            'name' => 'Dough Mixer',
            'category' => 'kitchen_equipment',
            'branch_id' => $branch->id,
            'status' => 'under_maintenance',
            'maintenance_interval_days' => 30,
        ]);

        $record = MaintenanceRecord::create([
            'maintenance_number' => MaintenanceRecord::generateMaintenanceNumber(),
            'asset_id' => $asset->id,
            'branch_id' => $branch->id,
            'type' => 'preventive',
            'status' => 'in_progress',
            'description' => 'Scheduled service',
        ]);

        $completedOn = now()->toDateString();

        $this->actingAs($user)
            ->put("/maintenance/logs/{$record->id}/complete", [
                'completed_date' => $completedOn,
                'cost' => 5000,
                'downtime_hours' => 3,
            ])
            ->assertRedirect();

        $record->refresh();
        $this->assertSame('completed', $record->status);
        $this->assertSame($completedOn, $record->completed_date?->toDateString());

        $asset->refresh();
        $this->assertSame('active', $asset->status);
        $this->assertSame($completedOn, $asset->last_maintenance_date?->toDateString());
        $this->assertSame(
            now()->addDays(30)->toDateString(),
            $asset->next_maintenance_date?->toDateString()
        );
    }

    public function test_service_due_kpi_and_filter_count_manually_flagged_assets(): void
    {
        $user = $this->superAdmin();
        $branch = Branch::create(['name' => 'Central Kitchen', 'status' => true]);

        // Manually flagged Service Due, yet its next service date is in the future.
        Asset::create([
            'asset_code' => Asset::generateAssetCode(),
            'name' => 'Oven',
            'category' => 'kitchen_equipment',
            'branch_id' => $branch->id,
            'status' => 'service_due',
            'next_maintenance_date' => now()->addMonths(3)->toDateString(),
        ]);

        // A healthy asset that should NOT count as due.
        Asset::create([
            'asset_code' => Asset::generateAssetCode(),
            'name' => 'Blender',
            'category' => 'kitchen_equipment',
            'branch_id' => $branch->id,
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->get('/maintenance/assets')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('summary.maintenance_due', 1));

        // The due filter returns the flagged asset only.
        $this->actingAs($user)
            ->get('/maintenance/assets?flag=due')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('assets.data', 1)
                ->where('assets.data.0.name', 'Oven'));
    }

    public function test_manager_can_open_maintenance_pages_after_permissions_are_seeded(): void
    {
        $this->seed(PermissionSeeder::class);
        $this->seed(Phase4PermissionsSeeder::class);

        $manager = User::factory()->create();
        $manager->assignRole(Role::where('slug', 'manager')->firstOrFail());

        foreach (['/maintenance/assets', '/maintenance/logs'] as $url) {
            $this->actingAs($manager->fresh())->get($url)->assertOk();
        }
    }
}
