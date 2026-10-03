<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_customers(): void
    {
        Customer::factory(3)->create();

        $this->getJson('/api/customers')
            ->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_it_creates_a_customer(): void
    {
        // email is omitted on purpose: the controller validates it with
        // `email:rfc,dns`, which performs a live DNS lookup unsuitable for tests.
        $payload = [
            'name' => 'New Customer',
            'contact' => '03001234567',
            'address' => '123 Test Street',
        ];

        $this->postJson('/api/customers', $payload)
            ->assertStatus(201)
            ->assertJsonFragment(['name' => 'New Customer']);

        $this->assertDatabaseHas('customers', ['contact' => '03001234567']);
    }

    public function test_it_validates_customer_creation(): void
    {
        $this->postJson('/api/customers', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'contact', 'address']);
    }

    public function test_it_shows_a_customer(): void
    {
        $customer = Customer::factory()->create();

        $this->getJson("/api/customers/{$customer->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $customer->id]);
    }

    public function test_it_updates_a_customer(): void
    {
        $customer = Customer::factory()->create();

        $this->putJson("/api/customers/{$customer->id}", [
            'name' => 'Updated Name',
            'contact' => $customer->contact,
            'address' => 'Updated address',
        ])->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated Name']);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_it_deletes_a_customer(): void
    {
        $customer = Customer::factory()->create();

        $this->deleteJson("/api/customers/{$customer->id}")
            ->assertStatus(200)
            ->assertJson(['message' => 'Deleted successfully']);

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }
}
