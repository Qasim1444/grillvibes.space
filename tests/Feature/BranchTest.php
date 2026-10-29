<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Place;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BranchTest extends TestCase
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

    public function test_main_branch_is_created_by_the_branch_migration(): void
    {
        $this->assertDatabaseHas('branches', [
            'name' => 'Main Branch',
            'status' => true,
        ]);
    }

    public function test_branches_page_renders_paginated_branch_data(): void
    {
        $this->actingAs($this->superAdmin())
            ->get('/branches')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Branches')
                ->has('branches.data')
                ->where('branches.data.0.name', 'Main Branch')
                ->has('filters')
            );
    }

    public function test_branch_can_be_created_updated_and_deleted(): void
    {
        $admin = $this->superAdmin();
        $payload = [
            'name' => 'North Branch',
            'address' => '12 High Street',
            'phone' => '+1 555 0100',
            'manager_name' => 'Jordan Lee',
            'status' => true,
            'latitude' => '40.7128',
            'longitude' => '-74.0060',
            'attendance_radius_meters' => 250,
            'attendance_start_time' => '08:30',
        ];

        $this->actingAs($admin)
            ->post('/branches', $payload)
            ->assertRedirect();

        $branch = Branch::where('name', 'North Branch')->firstOrFail();
        $this->assertDatabaseHas('branches', [
            'id' => $branch->id,
            'attendance_radius_meters' => 250,
        ]);

        $this->actingAs($admin)
            ->put("/branches/{$branch->id}", [...$payload, 'name' => 'North Kitchen'])
            ->assertRedirect();

        $this->assertDatabaseHas('branches', [
            'id' => $branch->id,
            'name' => 'North Kitchen',
        ]);

        $this->actingAs($admin)
            ->delete("/branches/{$branch->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('branches', ['id' => $branch->id]);
    }

    public function test_last_branch_cannot_be_deleted(): void
    {
        $branch = Branch::query()->firstOrFail();

        $this->actingAs($this->superAdmin())
            ->delete("/branches/{$branch->id}")
            ->assertSessionHasErrors('branch');

        $this->assertDatabaseHas('branches', ['id' => $branch->id]);
    }

    public function test_branch_with_associated_records_cannot_be_deleted(): void
    {
        $branch = Branch::create(['name' => 'North Branch']);
        Place::factory()->create(['branch_id' => $branch->id]);

        $this->actingAs($this->superAdmin())
            ->delete("/branches/{$branch->id}")
            ->assertSessionHasErrors('branch');

        $this->assertDatabaseHas('branches', ['id' => $branch->id]);
    }

    public function test_branch_management_requires_permission(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/branches')
            ->assertForbidden();
    }

    public function test_permission_seeder_grants_branch_management_to_manager(): void
    {
        $this->seed(PermissionSeeder::class);

        $manager = Role::where('slug', 'manager')->firstOrFail();

        foreach (['view', 'create', 'update', 'delete'] as $action) {
            $this->assertDatabaseHas('permissions', ['key' => "branches.{$action}"]);
            $this->assertTrue(
                $manager->permissions()->where('key', "branches.{$action}")->exists()
            );
        }
    }
}
