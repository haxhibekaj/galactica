import { ReactNode } from "react";

export interface Coordinates {
    x: number;
    y: number;
    z: number;
}

export interface Planet {
    id: number;
    name: string;
    description: string | null;
    type: string;
    size: string;
    coordinates: Coordinates;
    color?: string;
    created_at: string;
    updated_at: string;
}

export interface Resource {
    id: number;
    name: string;
    description: string | null;
    base_price: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    weight_per_unit: number | string;
    unit: 'kg' | 'ton' | 'piece' | 'liter' | 'barrel';
    created_at?: string;
    updated_at?: string;
}

export interface TradeRoute {
    id: number;
    name: string;
    starting_planet_id: number;
    destination_planet_id: number;
    resource_id: number;
    travel_time: number;
    status: 'active' | 'delayed' | 'dangerous';
    created_at: string;
    updated_at: string;
    starting_planet: {
        id: number;
        name: string;
    };
    destination_planet: {
        id: number;
        name: string;
    };
    resource: {
        id: number;
        name: string;
    };
    starships?: Starship[];
}

export interface Starship {
    id: number;
    name: string;
    description: string | null;
    cargo_capacity: number;
    trade_route_id: number | null;
    status: 'idle' | 'in_transit' | 'maintenance';
    current_location_id: number | null;
    destination_id: number | null;
    departure_time: string | null;
    arrival_time: string | null;
    maintenance_due_at: string | null;
    created_at: string;
    updated_at: string;
    
    // Relationships
    tradeRoute?: TradeRoute;
    currentLocation?: Planet;
    destination?: Planet;
    
    // Virtual/computed properties
    needsMaintenance: boolean;
    progress?: number;
}

export interface ResourceInventory {
    id: number;
    planet_id: number;
    resource_id: number;
    quantity: number;
    current_price: number;
    demand_factor: number;
    production_rate: number;
    consumption_rate: number;
    created_at: string;
    updated_at: string;
    planet: Planet;
    resource: Resource;
}

export interface MarketStats {
    mostTraded: {
        resource: Resource;
        transaction_count: number;
    }[];
    highestDemand: {
        resource: Resource;
        avg_demand: number;
    }[];
    priceVolatility: {
        resource: Resource;
        price_volatility: number;
    }[];
}

export interface TradeAgreement {
    id: number;
    name: string;
    source_planet_id: number;
    destination_planet_id: number;
    resource_id: number;
    quantity_per_cycle: number;
    price_per_unit: number;
    cycle_period: 'daily' | 'weekly' | 'monthly';
    start_date: string;
    end_date: string | null;
    terms: string | null;
    status: 'active' | 'pending' | 'suspended' | 'terminated';
    last_execution: string | null;
    created_at: string;
    updated_at: string;
    source_planet: {
        id: number;
        name: string;
    };
    destination_planet: {
        id: number;
        name: string;
    };
    resource: {
        id: number;
        name: string;
        base_price?: number | string;
    };
}

export interface SpaceWeather {
    id: number;
    name: string;
    type: string;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    affected_region_start: {
        x: number;
        y: number;
        z: number;
    };
    affected_region_end: {
        x: number;
        y: number;
        z: number;
    };
    start_time: string;
    end_time: string;
    delay_factor: number;
    created_at: string;
    updated_at: string;
    affected_routes: {
        id: number;
        name: string;
        starting_planet: {
            name: string;
        };
        destination_planet: {
            name: string;
        };
    }[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    roles?: Role[];
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    description: string | null;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

// For Inertia.js page props
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};
