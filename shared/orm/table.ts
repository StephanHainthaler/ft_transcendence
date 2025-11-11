import { Column } from "./column";

/** Record mapping column names to their Column definitions */
export type Schema = Record<string, Column>;

/** Logical operator for chaining CHECK constraints */
export type CheckOperator = 'AND' | 'OR' | 'and' | 'or';

/** 
 * CHECK constraint definition for table validation
 * @property col - Column name to check
 * @property notNull - Whether to enforce NOT NULL constraint
 * @property chainOp - Logical operator to chain with next check
 */
export type Check = { col: string, notNull?: boolean, chainOp?: CheckOperator}

/**
 * Represents a database table with columns and constraints
 */
export class Table {
  private tableColumns;
  private tableName;
  private checks: Check[] = [];

  /**
   * Creates a new Table instance
   * @param tableColumns - Record of column definitions
   * @param tableName - Name of the table
   * @param checks - Optional array of CHECK constraints
   */
  constructor(tableColumns: Record<string, Column>, tableName: string, checks?: Check[]) {
    this.tableColumns = tableColumns;
    this.tableName = tableName;
    if (checks) this.checks = checks;
  }

  /**
   * Generates SQL CREATE TABLE statement
   * @returns SQL string for creating the table
   */
  stringify(): string {
    return `
CREATE TABLE IF NOT EXISTS ${this.name} (
  ${Object.entries(this.columns).map(c => c[1].stringify()).join(',\n  ')}${this.checks.length > 0 ? `,\n  CHECK (${this.checks.map(c => `${c.col} ${c.notNull ? 'IS NOT NULL' : ''}${c.chainOp ? ` ${c.chainOp.toUpperCase()}` : ''}`).join(' ')})` : ''}
)`;
  }

  /**
   * Checks if table contains specified field(s)
   * @param field - Column name or array of column names to check
   * @returns true if all fields exist
   * @throws Error if any field is not found in table
   */
  has(field: string | string[]): boolean {
    let fields: string[] = [];
    if (!Array.isArray(field)) {
      fields.push(field);
    } else {
      fields = [...field];
    }
    for (const f of fields) {
      if (!Object.keys(this.tableColumns).includes(f)) {
        throw new Error(`SQL: Table ${this.name} does not include column ${f}`);
      }
    }
    return true;
  }

  /** Gets the table's column schema */
  get columns(): Schema {
    return this.tableColumns
  }

  /** Gets the table name */
  get name(): string { return this.tableName }

  /** Sets the table name */
  set name(name: string) { this.tableName = name}
}

/**
 * Factory function to define a typed table with schema
 * @template T - Schema type extending Record<string, Column>
 * @param name - Table name
 * @param schema - Column definitions using int() or text() helpers
 * @param checks - Optional CHECK constraints
 * @returns Table instance with typed fields property for type-safe column access
 * @example
 * const users = defineTable('users', {
 *   id: int().primarykey().autoIncrement(),
 *   name: text().notNull(),
 *   email: text().unique()
 * });
 * // Type-safe access: users.fields.id, users.fields.name
 * // Check columns exist: users.has('email')
 * // Generate SQL: users.stringify()
 */
export function defineTable<T extends Schema>(name: string, schema: T, ...checks: Check[]): Table & { fields: { [K in keyof T]: K } } {
  const columns = {} as Schema;
  for (const [key, def] of Object.entries(schema)) {
    def.tableName = name;
    def.name = key;
    columns[key] = def
  }
  const table = new Table(columns, name, checks);
  const fields = Object.keys(schema).reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as any);
  return Object.assign(table, { fields });
}
