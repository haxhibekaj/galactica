<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Resource Management
            'view_resources' => 'Can view resource inventories',
            'manage_resources' => 'Can manage resource inventories',
            'transfer_resources' => 'Can transfer resources between planets',
            
            // Trade Routes
            'view_trade_routes' => 'Can view trade routes',
            'manage_trade_routes' => 'Can create and modify trade routes',
            
            // Starships
            'view_starships' => 'Can view starship fleet',
            'manage_starships' => 'Can manage starship operations',
            'assign_routes' => 'Can assign trade routes to starships',
            
            // Trade Agreements
            'view_agreements' => 'Can view trade agreements',
            'manage_agreements' => 'Can create and modify trade agreements',
            
            // Weather System
            'view_weather' => 'Can view space weather',
            'manage_weather' => 'Can generate and manage weather events',
            
            // System Administration
            'manage_users' => 'Can manage user accounts',
            'manage_roles' => 'Can manage roles and permissions',
        ];

        foreach ($permissions as $name => $description) {
            Permission::create(compact('name', 'description'));
        }

        // Create roles
        $roles = [
            'admin' => [
                'description' => 'System Administrator',
                'permissions' => array_keys($permissions),
            ],
            'fleet_manager' => [
                'description' => 'Fleet Operations Manager',
                'permissions' => [
                    'view_resources',
                    'view_trade_routes',
                    'view_starships',
                    'manage_starships',
                    'assign_routes',
                    'view_weather',
                ],
            ],
            'trade_officer' => [
                'description' => 'Trade and Commerce Officer',
                'permissions' => [
                    'view_resources',
                    'manage_resources',
                    'transfer_resources',
                    'view_trade_routes',
                    'manage_trade_routes',
                    'view_agreements',
                    'manage_agreements',
                    'view_weather',
                ],
            ],
            'weather_analyst' => [
                'description' => 'Space Weather Analyst',
                'permissions' => [
                    'view_weather',
                    'manage_weather',
                    'view_trade_routes',
                    'view_starships',
                ],
            ],
            'trader' => [
                'description' => 'Basic Trader',
                'permissions' => [
                    'view_resources',
                    'view_trade_routes',
                    'view_agreements',
                    'view_weather',
                ],
            ],
        ];

        foreach ($roles as $name => $data) {
            $role = Role::create([
                'name' => $name,
                'description' => $data['description'],
            ]);

            $permissions = Permission::whereIn('name', $data['permissions'])->get();
            $role->permissions()->attach($permissions);
        }

        // Assign admin role to first user if exists
        if ($user = User::first()) {
            $adminRole = Role::where('name', 'admin')->first();
            $user->roles()->attach($adminRole);
        }
    }
} 