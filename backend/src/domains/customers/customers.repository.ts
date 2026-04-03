import { db } from "../../database/knex";
import type {
  CustomerListQuery,
  UpdateCustomerInput,
  StorefrontUpdateProfileInput,
  CreateAddressInput,
  UpdateAddressInput,
  CustomerOrdersQuery,
} from "./customers.schema";

export class CustomerRepository {
  static async findAll(query: CustomerListQuery) {
    const base = db("customers as c");

    if (query.search) {
      base.where(function () {
        this.where("c.name", "ilike", `%${query.search}%`)
          .orWhere("c.email", "ilike", `%${query.search}%`)
          .orWhere("c.phone", "ilike", `%${query.search}%`);
      });
    }
    if (query.is_verified !== undefined) base.where("c.is_verified", query.is_verified === "true");
    if (query.is_from_pos !== undefined) base.where("c.is_from_pos", query.is_from_pos === "true");
    if (query.created_from) base.where("c.created_at", ">=", query.created_from);
    if (query.created_to) base.where("c.created_at", "<=", query.created_to);

    const countResult = await base.clone().count("c.id as count").first();
    const total = Number(countResult?.count ?? 0);

    const offset = (query.page - 1) * query.limit;

    const hasOrders = await db.schema.hasTable("orders");

    let rows;
    if (hasOrders) {
      rows = await base
        .clone()
        .select(
          "c.*",
          db.raw("COALESCE(o.total_orders, 0)::int as total_orders"),
          db.raw("COALESCE(o.total_spend, 0)::bigint as total_spend")
        )
        .leftJoin(
          db.raw(
            `(SELECT customer_id, COUNT(id)::int as total_orders, SUM(total_paisa)::bigint as total_spend FROM orders GROUP BY customer_id) as o ON o.customer_id = c.id`
          )
        )
        .orderBy("c.created_at", "desc")
        .limit(query.limit)
        .offset(offset);
    } else {
      rows = await base
        .clone()
        .select("c.*", db.raw("0 as total_orders"), db.raw("0 as total_spend"))
        .orderBy("c.created_at", "desc")
        .limit(query.limit)
        .offset(offset);
    }

    return { rows, total };
  }

  static async findById(id: string) {
    return db("customers").where({ id }).first();
  }

  static async findByEmail(email: string) {
    return db("customers").where({ email }).first();
  }

  static async insertPosCustomer(data: {
    name: string;
    email: string;
    phone: string;
    password_hash: string;
  }) {
    const [row] = await db("customers")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password_hash: data.password_hash,
        is_verified: true,
        is_from_pos: true,
      })
      .returning("*");
    return row;
  }

  static async findByIdWithAddresses(id: string) {
    const customer = await db("customers").where({ id }).first();
    if (!customer) return null;
    const addresses = await db("customer_addresses").where({ customer_id: id }).orderBy("is_default", "desc");
    return { ...customer, addresses };
  }

  static async update(id: string, data: UpdateCustomerInput | StorefrontUpdateProfileInput) {
    const [row] = await db("customers").where({ id }).update({ ...data, updated_at: db.fn.now() }).returning("*");
    return row;
  }

  static async toggleActive(id: string, isActive: boolean) {
    const [row] = await db("customers").where({ id }).update({ is_active: isActive, updated_at: db.fn.now() }).returning("*");
    return row;
  }

  static async getOrders(customerId: string, query: CustomerOrdersQuery) {
    const hasOrders = await db.schema.hasTable("orders");
    if (!hasOrders) return { rows: [], total: 0 };

    const base = db("orders").where({ customer_id: customerId });
    const countResult = await base.clone().count("id as count").first();
    const total = Number(countResult?.count ?? 0);

    const offset = (query.page - 1) * query.limit;
    const rows = await base.clone().orderBy("created_at", "desc").limit(query.limit).offset(offset);

    return { rows, total };
  }

  static async getAddresses(customerId: string) {
    return db("customer_addresses").where({ customer_id: customerId }).orderBy("is_default", "desc");
  }

  static async findAddress(id: string) {
    return db("customer_addresses").where({ id }).first();
  }

  static async createAddress(customerId: string, data: CreateAddressInput) {
    if (data.is_default) {
      await db.transaction(async (trx) => {
        await trx("customer_addresses").where({ customer_id: customerId }).update({ is_default: false });
      });
    }
    const [row] = await db("customer_addresses").insert({ ...data, customer_id: customerId }).returning("*");
    return row;
  }

  static async updateAddress(id: string, customerId: string, data: UpdateAddressInput) {
    if (data.is_default) {
      await db.transaction(async (trx) => {
        await trx("customer_addresses").where({ customer_id: customerId }).update({ is_default: false });
      });
    }
    const [row] = await db("customer_addresses").where({ id, customer_id: customerId }).update({ ...data, updated_at: db.fn.now() }).returning("*");
    return row;
  }

  static async deleteAddress(id: string, customerId: string) {
    await db("customer_addresses").where({ id, customer_id: customerId }).del();
  }

  static async setDefaultAddress(id: string, customerId: string) {
    await db.transaction(async (trx) => {
      await trx("customer_addresses").where({ customer_id: customerId }).update({ is_default: false });
      await trx("customer_addresses").where({ id, customer_id: customerId }).update({ is_default: true, updated_at: trx.fn.now() });
    });
    return db("customer_addresses").where({ id }).first();
  }
}
