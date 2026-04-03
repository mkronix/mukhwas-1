import type { MovementType, Unit } from '../shared/enums';

export interface InventoryFinished {
    id: string;
    variant_id: string;
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    updated_at: string;
}

export interface InventoryRaw {
    id: string;
    raw_material_id: string;
    quantity: number;
    unit: Unit;
    updated_at: string;
}

type InventoryMovementBase = {
    id: string;
    type: MovementType;
    quantity: number;
    reference_id: string;
    notes?: string;
    created_by: string;
    timestamp: string;
};

export type InventoryMovement = InventoryMovementBase & (
    | { item_type: 'finished_good'; variant_id: string; material_id?: never }
    | { item_type: 'raw_material'; material_id: string; variant_id?: never }
);

export interface InventoryReservation {
    id: string;
    variant_id: string;
    order_id: string;
    quantity: number;
    reserved_at: string;
    released_at?: string;
}

export interface InventoryCostLayer {
    id: string;
    variant_id?: string;
    raw_material_id?: string;
    quantity: number;
    remaining_quantity: number;
    cost_per_unit_paisa: number;
    reference_id: string;
    reference_type: 'purchase' | 'production';
    created_at: string;
}