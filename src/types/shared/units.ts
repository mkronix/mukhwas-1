import type { Unit } from './enums';

export interface UnitConversion {
    id: string;
    from_unit: Unit;
    to_unit: Unit;
    factor: number;
}