import type { Knex } from "knex";
import { db } from "../../database/knex";

export const PurchaseReturnRepository = {
  knex(): Knex {
    return db;
  },
};
