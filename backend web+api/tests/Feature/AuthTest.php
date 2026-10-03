<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertStatus(201)
            ->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
    }

    public function test_registration_requires_matching_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422);
    }

    public function test_registering_a_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'dupe@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Someone',
            'email' => 'dupe@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'failed']);
    }

    public function test_a_user_can_log_in_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'bob@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bob@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success'])
            ->assertJsonStructure(['token', 'message', 'status']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'bob@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bob@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['status' => 'failed']);
    }

    public function test_protected_route_requires_authentication(): void
    {
        $this->getJson('/api/logged-user')->assertStatus(401);
    }

    public function test_authenticated_user_can_reach_protected_route(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/logged-user')
            ->assertStatus(200)
            ->assertJson(['status' => 'success']);
    }

    public function test_authenticated_user_can_update_profile_email(): void
    {
        $user = User::factory()->create(['email' => 'old@example.com']);

        $this->actingAs($user)
            ->put('/profile', [
                'name' => $user->name,
                'email' => 'new@example.com',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'new@example.com',
        ]);
    }

    public function test_profile_email_must_be_unique(): void
    {
        $user = User::factory()->create(['email' => 'user@example.com']);
        User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($user)
            ->from('/profile')
            ->put('/profile', [
                'name' => $user->name,
                'email' => 'taken@example.com',
            ])
            ->assertRedirect('/profile')
            ->assertSessionHasErrors('email');
    }
}
