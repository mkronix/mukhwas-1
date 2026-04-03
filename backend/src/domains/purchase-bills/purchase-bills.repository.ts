import type { Knex } from "knex";
import { db } from "../../database/knex";

export const PurchaseBillRepository = {
  knex(): Knex {
    return db;
  },
};
