<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Planet;
use App\Models\Resource;
use App\Models\TradeRoute;
use App\Models\Starship;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'view_resources',
            'manage_resources',
            'transfer_resources',
            'view_trade_routes',
            'manage_trade_routes',
            'view_starships',
            'manage_starships',
            'assign_routes',
            'view_agreements',
            'manage_agreements',
            'view_weather',
            'manage_weather',
            'manage_roles',
        ];

        $permissionIds = [];
        foreach ($permissions as $permission) {
            $permissionIds[] = Permission::create([
                'name' => $permission,
                'description' => 'Can ' . str_replace('_', ' ', $permission)
            ])->id;
        }

        // Create roles with their permissions
        $adminRole = Role::create([
            'name' => 'admin',
            'description' => 'Administrator with full access'
        ]);
        $adminRole->permissions()->sync($permissionIds);

        $fleetManagerRole = Role::create([
            'name' => 'fleet_manager',
            'description' => 'Fleet Operations Manager'
        ]);
        $fleetManagerRole->permissions()->sync(
            Permission::whereIn('name', [
                'view_resources',
                'view_trade_routes',
                'view_starships',
                'manage_starships',
                'assign_routes',
                'view_weather',
            ])->pluck('id')
        );

        $traderRole = Role::create([
            'name' => 'trader',
            'description' => 'Basic Trader Role'
        ]);
        $traderRole->permissions()->sync(
            Permission::whereIn('name', [
                'view_starships',
                'view_trade_routes',
                'view_resources',
                'view_agreements',
                'view_weather',
                'transfer_resources',
            ])->pluck('id')
        );

        // Create users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@galactica.test',
            'password' => bcrypt('password'),
        ]);
        $admin->roles()->attach($adminRole->id);

        $fleetManager = User::create([
            'name' => 'Fleet Manager',
            'email' => 'fleet@galactica.test',
            'password' => bcrypt('password'),
        ]);
        $fleetManager->roles()->attach($fleetManagerRole->id);

        $trader = User::create([
            'name' => 'Trader User',
            'email' => 'trader@galactica.test',
            'password' => bcrypt('password'),
        ]);
        $trader->roles()->attach($traderRole->id);

        // Create planets
        $planets = [
            ['name' => 'Earth', 'coordinates' => ['x' => 314, 'y' => 100, 'z' => 176]],
            ['name' => 'Mars', 'coordinates' => ['x' => 108, 'y' => 431, 'z' => 224]],
            ['name' => 'Venus', 'coordinates' => ['x' => -34, 'y' => 512, 'z' => 333]],
            ['name' => 'Jupiter', 'coordinates' => ['x' => 202, 'y' => 180, 'z' => 209]],
        ];

        foreach ($planets as $planetData) {
            Planet::create([
                'name' => $planetData['name'],
                'coordinates' => json_encode($planetData['coordinates']),
            ]);
        }

        // Create resources
        $resources = ['Water', 'Food', 'Minerals', 'Fuel', 'Technology'];
        foreach ($resources as $resourceName) {
            Resource::create(['name' => $resourceName]);
        }

        // Create trade routes
        $planets = Planet::all();
        $resources = Resource::all();
        
        for ($i = 0; $i < 5; $i++) {
            $start = $planets->random();
            $end = $planets->where('id', '!=', $start->id)->random();
            
            TradeRoute::create([
                'name' => "Route {$start->name} to {$end->name}",
                'starting_planet_id' => $start->id,
                'destination_planet_id' => $end->id,
                'resource_id' => $resources->random()->id,
                'travel_time' => rand(10, 100),
            ]);
        }

        // Create starships
        $tradeRoutes = TradeRoute::all();
        $statuses = ['idle', 'in_transit', 'maintenance'];

        for ($i = 0; $i < 10; $i++) {
            $route = $tradeRoutes->random();
            $status = $statuses[array_rand($statuses)];

            Starship::create([
                'name' => "Starship-" . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'description' => "Cargo vessel for route {$route->name}",
                'cargo_capacity' => rand(1000, 10000),
                'trade_route_id' => $route->id,
                'status' => $status,
                'current_location_id' => $route->starting_planet_id,
                'destination_id' => $status === 'in_transit' ? $route->destination_planet_id : null,
                'departure_time' => $status === 'in_transit' ? Carbon::now()->subHours(rand(1, 5)) : null,
                'arrival_time' => $status === 'in_transit' ? Carbon::now()->addHours(rand(1, 5)) : null,
                'maintenance_due_at' => Carbon::now()->addMonths(3),
            ]);
        }
    }
}
