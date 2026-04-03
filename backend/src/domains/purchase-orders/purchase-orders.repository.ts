import type { Knex } from "knex";
import { db } from "../../database/knex";

export const PurchaseOrderRepository = {
  knex(): Knex {
    return db;
  },
};
