<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class DefaultRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create all permissions
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

        $permissionModels = [];
        foreach ($permissions as $permission) {
            $permissionModels[] = Permission::firstOrCreate(
                ['name' => $permission],
                ['description' => 'Can ' . str_replace('_', ' ', $permission)]
            )->id;
        }

        // Create admin role with all permissions
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrator with full access']
        );
        $adminRole->permissions()->sync($permissionModels);

        // Create trader role with basic permissions
        $traderRole = Role::firstOrCreate(
            ['name' => 'trader'],
            ['description' => 'Basic Trader Role']
        );

        $basicPermissions = Permission::whereIn('name', [
            'view_starships',
            'view_trade_routes',
            'view_resources',
            'view_agreements',
            'view_weather',
            'transfer_resources',
        ])->pluck('id');

        $traderRole->permissions()->sync($basicPermissions);

        // Assign admin role to the first user (or create one if none exists)
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@galactica.test'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
            ]
        );
        $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);

        // Assign trader role to all other users who don't have a role
        $usersWithoutRoles = User::where('id', '!=', $adminUser->id)
            ->whereDoesntHave('roles')
            ->get();
            
        foreach ($usersWithoutRoles as $user) {
            $user->roles()->syncWithoutDetaching([$traderRole->id]);
        }
    }
} 