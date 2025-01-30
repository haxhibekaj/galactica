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
        // 1. First, create permissions
        $permissions = [
            'view_resources' => 'Can view resource inventories',
            'manage_resources' => 'Can manage resource inventories',
            'transfer_resources' => 'Can transfer resources between planets',
            'view_trade_routes' => 'Can view trade routes',
            'manage_trade_routes' => 'Can create and modify trade routes',
            'view_starships' => 'Can view starship fleet',
            'manage_starships' => 'Can manage starship operations',
            'assign_routes' => 'Can assign trade routes to starships',
            'view_agreements' => 'Can view trade agreements',
            'manage_agreements' => 'Can create and modify trade agreements',
            'view_weather' => 'Can view space weather',
            'manage_weather' => 'Can manage weather events',
            'manage_roles' => 'Can manage roles and permissions',
        ];

        $permissionIds = [];
        foreach ($permissions as $name => $description) {
            $permissionIds[] = Permission::firstOrCreate(
                ['name' => $name],
                ['description' => $description]
            )->id;
        }

        // 2. Create roles with their permissions
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

        // 3. Create users and assign roles
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

        // 4. Create planets first (needed for trade routes)
        $planets = [
            ['name' => 'Earth', 'coordinates' => ['x' => 513, 'y' => 217, 'z' => 337]],
            ['name' => 'Mars', 'coordinates' => ['x' => 105, 'y' => 270, 'z' => 37]],
            ['name' => 'Venus', 'coordinates' => ['x' => -421, 'y' => -247, 'z' => 364]],
            ['name' => 'Jupiter', 'coordinates' => ['x' => 200, 'y' => 180, 'z' => 444]],
        ];

        foreach ($planets as $planetData) {
            Planet::create([
                'name' => $planetData['name'],
                'coordinates' => $planetData['coordinates']
            ]);
        }

        // 5. Create resources (needed for trade routes)
        $resources = [
            [
                'name' => 'Water',
                'base_price' => 100.00,
                'unit' => 'ton',
                'rarity' => 'common',
                'weight_per_unit' => 1.00
            ],
            [
                'name' => 'Food',
                'base_price' => 200.00,
                'unit' => 'ton',
                'rarity' => 'common',
                'weight_per_unit' => 1.00
            ],
            [
                'name' => 'Minerals',
                'base_price' => 500.00,
                'unit' => 'ton',
                'rarity' => 'uncommon',
                'weight_per_unit' => 2.00
            ],
            [
                'name' => 'Fuel',
                'base_price' => 1000.00,
                'unit' => 'barrel',
                'rarity' => 'rare',
                'weight_per_unit' => 0.50
            ],
            [
                'name' => 'Technology',
                'base_price' => 2000.00,
                'unit' => 'piece',
                'rarity' => 'epic',
                'weight_per_unit' => 0.25
            ]
        ];

        foreach ($resources as $resourceData) {
            Resource::create($resourceData);
        }

        // 6. Create trade routes (needs planets and resources)
        $planetsCollection = Planet::all();
        $resourcesCollection = Resource::all();
        
        for ($i = 0; $i < 5; $i++) {
            $start = $planetsCollection->random();
            $end = $planetsCollection->where('id', '!=', $start->id)->random();
            
            TradeRoute::create([
                'name' => "Route {$start->name} to {$end->name}",
                'starting_planet_id' => $start->id,
                'destination_planet_id' => $end->id,
                'resource_id' => $resourcesCollection->random()->id,
                'travel_time' => rand(10, 100) // in seconds for testing
            ]);
        }

        // 7. Finally, create starships (needs trade routes and planets)
        $tradeRoutes = TradeRoute::all();
        $statuses = ['idle', 'in_transit', 'maintenance'];

        for ($i = 0; $i < 10; $i++) {
            $route = $tradeRoutes->random();
            $status = $statuses[array_rand($statuses)];
            $currentLocation = $route->startingPlanet;
            $destination = $status === 'in_transit' ? $route->destinationPlanet : null;

            Starship::create([
                'name' => "Starship-" . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'description' => "Cargo vessel for route {$route->name}",
                'cargo_capacity' => rand(1000, 10000),
                'trade_route_id' => $route->id,
                'status' => $status,
                'current_location_id' => $currentLocation->id,
                'destination_id' => $destination?->id,
                'departure_time' => $status === 'in_transit' ? Carbon::now()->subSeconds(rand(1, 30)) : null,
                'arrival_time' => $status === 'in_transit' ? Carbon::now()->addSeconds(rand(30, 60)) : null,
                'maintenance_due_at' => Carbon::now()->addMonths(3),
            ]);
        }
    }
}
