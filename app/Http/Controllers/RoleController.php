<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('Roles/Index', [
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'description' => 'nullable|string',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
        ]);

        $role->permissions()->attach($validated['permissions']);

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    public function update(Request $request, Role $role)
    {
        if ($role->name === 'admin') {
            return redirect()->back()->withErrors(['error' => 'Cannot modify admin role.']);
        }

        $validated = $request->validate([
            'description' => 'nullable|string',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update(['description' => $validated['description']]);
        $role->permissions()->sync($validated['permissions']);

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin') {
            return redirect()->back()->withErrors(['error' => 'Cannot delete admin role.']);
        }

        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
} 