import type { Knex } from "knex";

const productionStatuses = [
  "planned",
  "in_progress",
  "partially_completed",
  "completed",
  "cancelled",
] as const;

const purchaseOrderStatuses = ["draft", "sent", "received", "billed", "cancelled"] as const;

const billPaymentStatuses = ["pending", "paid", "failed", "refunded", "partial"] as const;

const purchaseReturnStatuses = ["requested", "approved", "sent", "credited"] as const;

const materialLineStatuses = ["reserved", "consumed", "released"] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("production_orders", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("order_number", 40).notNullable().unique();
    t.string("recipe_id", 120).notNullable();
    t.string("recipe_name", 255).notNullable();
    t.integer("recipe_version").notNullable().defaultTo(1);
    t.uuid("output_variant_id").references("id").inTable("product_variants").onDelete("SET NULL");
    t.string("product_variant", 500).notNullable();
    t.double("planned_quantity").notNullable();
    t.double("actual_quantity").notNullable().defaultTo(0);
    t.string("unit", 40).notNullable();
    t.enum("status", productionStatuses).notNullable().defaultTo("planned");
    t.date("scheduled_date").notNullable();
    t.timestamp("started_at").defaultTo(null);
    t.timestamp("completed_at").defaultTo(null);
    t.string("assigned_staff_id", 120).notNullable().defaultTo("");
    t.string("assigned_staff_name", 200).notNullable().defaultTo("");
    t.string("created_by", 200).notNullable().defaultTo("");
    t.timestamps(true, true);
    t.index("status");
    t.index("scheduled_date");
  });

  await knex.schema.createTable("production_order_materials", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t
      .uuid("production_order_id")
      .notNullable()
      .references("id")
      .inTable("production_orders")
      .onDelete("CASCADE");
    t.uuid("raw_material_id").notNullable().references("id").inTable("raw_materials").onDelete("RESTRICT");
    t.string("raw_material_name", 255).notNullable();
    t.double("reserved_quantity").notNullable();
    t.double("actual_used").notNullable().defaultTo(0);
    t.string("unit", 40).notNullable();
    t.enum("status", materialLineStatuses).notNullable().defaultTo("reserved");
    t.uuid("inventory_reservation_id").defaultTo(null);
    t.timestamps(true, true);
    t.index("production_order_id");
    t.index("raw_material_id");
  });

  await knex.schema.createTable("production_order_activity_log", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t
      .uuid("production_order_id")
      .notNullable()
      .references("id")
      .inTable("production_orders")
      .onDelete("CASCADE");
    t.timestamp("logged_at").notNullable().defaultTo(knex.fn.now());
    t.text("action").notNullable();
    t.string("performed_by", 200).notNullable().defaultTo("");
    t.index("production_order_id");
  });

  await knex.schema.createTable("purchase_orders", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("po_number", 40).notNullable().unique();
    t.uuid("supplier_id").notNullable().references("id").inTable("suppliers").onDelete("RESTRICT");
    t.string("supplier_name", 255).notNullable();
    t.date("order_date").notNullable();
    t.date("expected_delivery").notNullable();
    t.enum("status", purchaseOrderStatuses).notNullable().defaultTo("draft");
    t.text("notes").notNullable().defaultTo("");
    t.bigInteger("subtotal_paisa").notNullable().defaultTo(0);
    t.bigInteger("cgst_paisa").notNullable().defaultTo(0);
    t.bigInteger("sgst_paisa").notNullable().defaultTo(0);
    t.bigInteger("total_paisa").notNullable().defaultTo(0);
    t.string("created_by", 200).notNullable().defaultTo("");
    t.timestamps(true, true);
    t.index("supplier_id");
    t.index("status");
  });

  await knex.schema.createTable("purchase_order_items", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t
      .uuid("purchase_order_id")
      .notNullable()
      .references("id")
      .inTable("purchase_orders")
      .onDelete("CASCADE");
    t.uuid("raw_material_id").notNullable().references("id").inTable("raw_materials").onDelete("RESTRICT");
    t.string("raw_material_name", 255).notNullable();
    t.double("quantity").notNullable();
    t.string("unit", 40).notNullable();
    t.bigInteger("unit_price_paisa").notNullable();
    t.string("hsn_code", 32).notNullable().defaultTo("");
    t.string("gst_slab", 32).notNullable().defaultTo("");
    t.bigInteger("taxable_paisa").notNullable();
    t.bigInteger("gst_amount_paisa").notNullable();
    t.bigInteger("total_paisa").notNullable();
    t.index("purchase_order_id");
  });

  await knex.schema.createTable("purchase_bills", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("bill_number", 40).notNullable().unique();
    t.uuid("po_id").references("id").inTable("purchase_orders").onDelete("SET NULL");
    t.string("po_number", 40).notNullable().defaultTo("");
    t.uuid("supplier_id").notNullable().references("id").inTable("suppliers").onDelete("RESTRICT");
    t.string("supplier_name", 255).notNullable();
    t.string("supplier_gstin", 20).notNullable().defaultTo("");
    t.date("bill_date").notNullable();
    t.date("due_date").notNullable();
    t.bigInteger("subtotal_paisa").notNullable().defaultTo(0);
    t.bigInteger("cgst_paisa").notNullable().defaultTo(0);
    t.bigInteger("sgst_paisa").notNullable().defaultTo(0);
    t.bigInteger("total_paisa").notNullable().defaultTo(0);
    t.enum("payment_status", billPaymentStatuses).notNullable().defaultTo("pending");
    t.bigInteger("paid_amount_paisa").notNullable().defaultTo(0);
    t.timestamps(true, true);
    t.index("supplier_id");
    t.index("po_id");
    t.index("payment_status");
  });

  await knex.schema.createTable("purchase_bill_items", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t
      .uuid("purchase_bill_id")
      .notNullable()
      .references("id")
      .inTable("purchase_bills")
      .onDelete("CASCADE");
    t.uuid("raw_material_id").references("id").inTable("raw_materials").onDelete("SET NULL");
    t.string("raw_material_name", 255).notNullable();
    t.double("quantity").notNullable();
    t.string("unit", 40).notNullable();
    t.bigInteger("unit_price_paisa").notNullable();
    t.string("hsn_code", 32).notNullable().defaultTo("");
    t.string("gst_slab", 32).notNullable().defaultTo("");
    t.bigInteger("taxable_paisa").notNullable();
    t.bigInteger("gst_amount_paisa").notNullable();
    t.bigInteger("total_paisa").notNullable();
    t.index("purchase_bill_id");
  });

  await knex.schema.createTable("purchase_bill_payments", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t
      .uuid("purchase_bill_id")
      .notNullable()
      .references("id")
      .inTable("purchase_bills")
      .onDelete("CASCADE");
    t.bigInteger("amount_paisa").notNullable();
    t.timestamp("paid_at").notNullable();
    t.string("mode", 80).notNullable().defaultTo("");
    t.string("reference", 200).notNullable().defaultTo("");
    t.timestamps(true, true);
    t.index("purchase_bill_id");
  });

  await knex.schema.createTable("purchase_returns", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("return_id", 40).notNullable().unique();
    t.uuid("bill_id").notNullable().references("id").inTable("purchase_bills").onDelete("RESTRICT");
    t.string("bill_number", 40).notNullable();
    t.uuid("supplier_id").notNullable().references("id").inTable("suppliers").onDelete("RESTRICT");
    t.string("supplier_name", 255).notNullable();
    t.timestamp("return_date").notNullable();
    t.bigInteger("total_paisa").notNullable().defaultTo(0);
    t.text("reason").notNullable().defaultTo("");
    t.enum("status", purchaseReturnStatuses).notNullable().defaultTo("requested");
    t.timestamps(true, true);
    t.index("bill_id");
    t.index("supplier_id");
    t.index("status");
  });

  await knex.schema.createTable("purchase_return_items", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t
      .uuid("purchase_return_id")
      .notNullable()
      .references("id")
      .inTable("purchase_returns")
      .onDelete("CASCADE");
    t.uuid("raw_material_id").references("id").inTable("raw_materials").onDelete("SET NULL");
    t.string("raw_material_name", 255).notNullable();
    t.double("quantity").notNullable();
    t.string("unit", 40).notNullable();
    t.bigInteger("amount_paisa").notNullable();
    t.index("purchase_return_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("purchase_return_items");
  await knex.schema.dropTableIfExists("purchase_returns");
  await knex.schema.dropTableIfExists("purchase_bill_payments");
  await knex.schema.dropTableIfExists("purchase_bill_items");
  await knex.schema.dropTableIfExists("purchase_bills");
  await knex.schema.dropTableIfExists("purchase_order_items");
  await knex.schema.dropTableIfExists("purchase_orders");
  await knex.schema.dropTableIfExists("production_order_activity_log");
  await knex.schema.dropTableIfExists("production_order_materials");
  await knex.schema.dropTableIfExists("production_orders");
}
