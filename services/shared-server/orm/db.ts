import { Query } from "./query";
import { Table } from "./table";
import Database from "better-sqlite3";

/**
 * Database wrapper providing type-safe table operations
 * @template Schema - Record mapping table names to their row types
 * @example
 * type MySchema = {
 *   users: { id: number; name: string };
 *   posts: { id: number; title: string };
 * };
 * const db = new DB<MySchema>('./database.db');
 * db.create([usersTable, postsTable]);
 * const users = db.from('users').select('*').all();
 */
export class DB<Schema extends Record<string, any>> {
  private db?: Database.Database;
  private tables: Table[] = [];

  /**
   * Creates a new DB instance
   * @param dbPath - Optional path to SQLite database file
   * @example
   * const db = new DB<MySchema>('./app.db');
   * // or
   * const db = new DB<MySchema>();
   * db.open('./app.db');
   */
  constructor(private dbPath?: string) {
    if (dbPath)
      this.db = new Database(dbPath);
  };

  /**
   * Opens a database connection
   * @param path - Path to SQLite database file
   * @example
   * db.open('./database.db');
   */
  open(path: string) {
    this.db = new Database(path);
    this.dbPath = path;
  }

  /**
   * Creates tables in the database within a transaction
   * @param newTables - Single table or array of tables to create
   * @throws Error if database is not initialized
   * @example
   * db.create([usersTable, postsTable]);
   * // or
   * db.create(usersTable);
   */
  create(newTables: Table | Table[]) {
    if (!this.db) throw new Error("No Database provided");
    let tables: Table[] = [];
    if (Array.isArray(newTables)) {
      tables = [...newTables];
    } else {
      tables = [newTables];
    }
    const tx = this.db.transaction(() => {
      for (const table of tables) {
        const query = table.stringify();
        this.db?.prepare(query).run();
        this.tables.push(table);
      }
    });
    tx();
  }

  tx(tx: () => void) {
    const transaction = this.db?.transaction(tx);
    if (transaction)
      transaction();
  }

  /**
   * Creates a type-safe query builder for a table
   * @template TableName - Name of the table (keyof Schema)
   * @param table - Table instance or table name string
   * @returns Query builder typed to the table's row type
   * @throws Error if database not initialized or table doesn't exist
   * @example
   * db.from('users').select('id', 'name').eq('age', 25).all();
   * // or
   * db.from(usersTable).select('*').all();
   */
  from<TableName extends keyof Schema & string>(table: Table | TableName): Query<Schema[TableName]> {
    if (!this.db) throw new Error("No Database provided");
    if (typeof table === 'string') {
      const t = this.tables.find(t => t.name === table);
      if (!t) throw new Error(`Table ${table} doesn't exist`);
      return new Query<Schema[TableName]>(t, this.db);
    } else {
      return new Query<Schema[TableName]>(table, this.db);
    }
  }
}
