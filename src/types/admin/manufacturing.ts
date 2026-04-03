import type { ProductionStatus, Unit } from '../shared/enums';

export interface Recipe {
    id: string;
    product_id: string;
    variant_id: string;
    version: number;
    is_active: boolean;
    yield_quantity: number;
    ingredients: RecipeIngredient[];
    created_at: string;
    updated_at: string;
}

export interface RecipeIngredient {
    id: string;
    recipe_id: string;
    raw_material_id: string;
    quantity: number;
    unit: Unit;
}

export interface ProductionOrder {
    id: string;
    recipe_id: string;
    product_id: string;
    variant_id: string;
    status: ProductionStatus;
    planned_quantity: number;
    completed_quantity: number;
    materials: ProductionOrderMaterial[];
    started_at?: string;
    completed_at?: string;
    created_by: string;
    created_at: string;
}

export interface ProductionOrderMaterial {
    id: string;
    production_order_id: string;
    raw_material_id: string;
    required_quantity: number;
    consumed_quantity: number;
    unit: Unit;
}