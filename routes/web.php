<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResourceInventoryController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SpaceWeatherController;
use App\Http\Controllers\StarshipController;
use App\Http\Controllers\TradeAgreementController;
use App\Http\Controllers\TradeRouteController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\PlanetController;
use App\Http\Controllers\AppController;
use App\Http\Controllers\DashboardController;

Route::get('/', [AppController::class, 'index'])->name('app.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/app', [AppController::class, 'index'])->name('app.index');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::resource('trade-routes', TradeRouteController::class)->only([
        'index', 'create', 'store', 'edit', 'update', 'destroy'
    ]);
    Route::resource('planets', PlanetController::class);
    Route::resource('trade-agreements', TradeAgreementController::class);
    Route::post('trade-agreements/{tradeAgreement}/execute', [TradeAgreementController::class, 'executeAgreement'])
        ->name('trade-agreements.execute');
    Route::post('trade-agreements/process-all', [TradeAgreementController::class, 'processAllAgreements'])
        ->name('trade-agreements.process-all');

    // Resource Management
    Route::group(['prefix' => 'resources', 'as' => 'resources.'], function () {
        Route::get('/', [ResourceController::class, 'index'])->name('index');
        Route::post('/', [ResourceController::class, 'store'])->name('store');
        Route::get('/{resource}/edit', [ResourceController::class, 'edit'])->name('edit');
        Route::patch('/{resource}', [ResourceController::class, 'update'])->name('update');
        Route::delete('/{resource}', [ResourceController::class, 'destroy'])->name('destroy');
    });


    // Trade Routes
    Route::middleware('permission:view_trade_routes')->group(function () {
        Route::get('/trade-routes', [TradeRouteController::class, 'index'])->name('trade-routes.index');
        Route::get('/trade-routes/{tradeRoute}', [TradeRouteController::class, 'show'])->name('trade-routes.show');
    });

    Route::middleware('permission:manage_trade_routes')->group(function () {
        Route::post('/trade-routes', [TradeRouteController::class, 'store'])->name('trade-routes.store');
        Route::put('/trade-routes/{tradeRoute}', [TradeRouteController::class, 'update'])->name('trade-routes.update');
        Route::delete('/trade-routes/{tradeRoute}', [TradeRouteController::class, 'destroy'])->name('trade-routes.destroy');
    });

    // Add specific route for processing trade routes
    Route::post('/trade-routes/process-all', [TradeRouteController::class, 'processAll'])
        ->name('trade-routes.process-all');

    // Starships
    Route::middleware('permission:view_starships')->group(function () {
        Route::get('/starships', [StarshipController::class, 'index'])->name('starships.index');
        Route::get('/starships/{starship}', [StarshipController::class, 'show'])->name('starships.show');
    });

    Route::middleware('permission:manage_starships')->group(function () {
        Route::post('/starships', [StarshipController::class, 'store'])->name('starships.store');
        Route::put('/starships/{starship}', [StarshipController::class, 'update'])->name('starships.update');
        Route::delete('/starships/{starship}', [StarshipController::class, 'destroy'])->name('starships.destroy');
    });

    Route::post('/starships/{starship}/assign-route', [StarshipController::class, 'assignRoute'])
        ->middleware('permission:assign_routes')
        ->name('starships.assign-route');

    // Trade Agreements
    Route::middleware('permission:view_agreements')->group(function () {
        Route::get('/trade-agreements', [TradeAgreementController::class, 'index'])->name('trade-agreements.index');
        Route::get('/trade-agreements/{agreement}', [TradeAgreementController::class, 'show'])->name('trade-agreements.show');
    });

    Route::middleware('permission:manage_agreements')->group(function () {
        Route::post('/trade-agreements', [TradeAgreementController::class, 'store'])->name('trade-agreements.store');
        Route::put('/trade-agreements/{agreement}', [TradeAgreementController::class, 'update'])->name('trade-agreements.update');
        Route::delete('/trade-agreements/{agreement}', [TradeAgreementController::class, 'destroy'])->name('trade-agreements.destroy');
        Route::post('/trade-agreements/{agreement}/execute', [TradeAgreementController::class, 'executeAgreement'])
            ->name('trade-agreements.execute');
        Route::post('/trade-agreements/process-all', [TradeAgreementController::class, 'processAllAgreements'])
            ->name('trade-agreements.process-all');
    });

    // Weather System
    Route::middleware('permission:view_weather')->group(function () {
        Route::get('/weather', [SpaceWeatherController::class, 'index'])->name('weather.index');
    });

    Route::post('/weather/generate', [SpaceWeatherController::class, 'generate'])
        ->middleware('permission:manage_weather')
        ->name('weather.generate');

    // Role Management (Admin Only)
    Route::middleware('permission:manage_roles')->group(function () {
        Route::resource('roles', RoleController::class);
    });

    Route::post('/space-weather/generate', [SpaceWeatherController::class, 'generate'])
        ->name('space-weather.generate');

    Route::delete('/space-weather/{id}', [SpaceWeatherController::class, 'destroy'])
        ->name('space-weather.destroy');

    Route::resource('starships', StarshipController::class)->only([
        'index', 'create', 'store', 'edit', 'update', 'destroy'
    ]);
});

require __DIR__.'/auth.php';
