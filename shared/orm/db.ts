import { Query } from "./query";
import { Table } from "./table";
import Database from "better-sqlite3";

export class DB {
  private db: Database.Database;

  constructor(private dbPath: string) {
    this.db = new Database(dbPath);
  };

  create(table: Table) {
    const query = table.stringify();
    this.db.prepare(query).run();
  }

  from(table: Table): Query {
    return new Query(table, this.db);
  }
}
