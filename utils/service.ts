import { defineProxyService } from "@webext-core/proxy-service";
import type { ExtensionDatabase } from "./database";

export interface Service {
  getAll(): Promise<ParseResultSuccess[]>;
  find(key: string): Promise<ParseResultSuccess | undefined>;
  upsert(record: ParseResultSuccess): Promise<void>;
}

function createService(_db: Promise<ExtensionDatabase>): Service {
  return {
    async getAll() {
      const db = await _db;
      return await db.getAll("ogs");
    },

    async find(key) {
      const db = await _db;
      return await db.get("ogs", key);
    },

    async upsert(record) {
      const db = await _db;
      await db.put("ogs", record);
    },
  };
}

export const [registerService, getService] = defineProxyService(
  "ogpatrol-service",
  createService,
);
