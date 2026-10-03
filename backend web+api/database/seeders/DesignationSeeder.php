<?php

namespace Database\Seeders;

use App\Models\Designation;
use App\Models\LeaveType;
use Illuminate\Database\Seeder;

/**
 * HR reference data. Idempotent — `updateOrCreate` on the natural key means
 * re-running never stacks duplicates, and edits made in the UI to anything other
 * than the seeded defaults survive.
 */
class DesignationSeeder extends Seeder
{
    /** @var array<string, string> name => description */
    private const DESIGNATIONS = [
        'Manager' => 'Runs the outlet — staff, cash and daily reporting.',
        'Assistant Manager' => 'Deputises for the manager and covers shifts.',
        'Cashier' => 'Takes orders and handles payments at the counter.',
        'Waiter' => 'Serves dine-in tables.',
        'Chef' => 'Heads the kitchen and controls food quality.',
        'Cook' => 'Prepares food on the line.',
        'Kitchen Helper' => 'Preps ingredients and supports the line.',
        'Rider' => 'Delivers orders to customers.',
        'Cleaner' => 'Keeps the floor and kitchen clean.',
        'Security Guard' => 'Guards the premises.',
    ];

    /** @var list<array{name: string, days_per_year: int, is_paid: bool}> */
    private const LEAVE_TYPES = [
        ['name' => 'Casual Leave', 'days_per_year' => 10, 'is_paid' => true],
        ['name' => 'Sick Leave', 'days_per_year' => 8, 'is_paid' => true],
        ['name' => 'Annual Leave', 'days_per_year' => 14, 'is_paid' => true],
        // Unpaid days are deducted from pay by PayrollService, same as absence.
        ['name' => 'Unpaid Leave', 'days_per_year' => 0, 'is_paid' => false],
    ];

    public function run(): void
    {
        foreach (self::DESIGNATIONS as $name => $description) {
            Designation::updateOrCreate(['name' => $name], ['description' => $description]);
        }

        foreach (self::LEAVE_TYPES as $type) {
            LeaveType::updateOrCreate(
                ['name' => $type['name']],
                ['days_per_year' => $type['days_per_year'], 'is_paid' => $type['is_paid']],
            );
        }

        $this->command?->info('Seeded '.count(self::DESIGNATIONS).' designations and '.count(self::LEAVE_TYPES).' leave types.');
    }
}
