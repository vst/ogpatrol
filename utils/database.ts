import { DBSchema, IDBPDatabase, openDB } from "idb";

interface ExtensionDatabaseSchema extends DBSchema {
  ogs: {
    key: string;
    value: ParseResultSuccess;
  };
}

export type ExtensionDatabase = IDBPDatabase<ExtensionDatabaseSchema>;

export function openExtensionDatabase(): Promise<ExtensionDatabase> {
  return openDB<ExtensionDatabaseSchema>("ogpatrol-service", 1, {
    upgrade(database) {
      database.createObjectStore("ogs", { keyPath: "source" });
    },
  });
}
