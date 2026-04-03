import type { Knex } from "knex";

const SYSTEM_UNITS = [
  { name: "Gram", abbreviation: "g", type: "Weight" },
  { name: "Kilogram", abbreviation: "kg", type: "Weight" },
  { name: "Milligram", abbreviation: "mg", type: "Weight" },
  { name: "Millilitre", abbreviation: "mL", type: "Volume" },
  { name: "Litre", abbreviation: "L", type: "Volume" },
  { name: "Pieces", abbreviation: "pcs", type: "Count" },
  { name: "Box", abbreviation: "box", type: "Count" },
  { name: "Packet", abbreviation: "pkt", type: "Count" },
  { name: "Dozen", abbreviation: "dz", type: "Count" },
];

export async function seed(knex: Knex): Promise<void> {
  for (const unit of SYSTEM_UNITS) {
    const existing = await knex("units").where({ abbreviation: unit.abbreviation }).first();
    if (!existing) {
      await knex("units").insert({ ...unit, is_system: true });
    }
  }
}
