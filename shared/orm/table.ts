import { Column } from "./column";

export type Schema = Record<string, Column>;

export class Table {
  constructor(private columns: Record<string, Column>, private tableName: string){}

  stringify(): string {
    return `create table ${this.name} (${Object.entries(this.columns).map(c => c[1].stringify()).join(',')});`;
  }

  has(field: string | string[]): boolean {
    let fields: string[] = [];
    if (!Array.isArray(field)) {
      fields.push(field);
    } else {
      fields = [...field];
    }
    for (const f of fields) {
      if (!Object.keys(this.columns).includes(f)) {
        throw new Error(`SQL: Table ${this.name} does not include column ${f}`);
      }
    }
    return true;
  }

  get name(): string { return this.tableName }
}

export function defineTable<T extends Schema>(name: string, schema: T): Table {
  const columns = {} as Schema;

  for (const [key, def] of Object.entries(schema)) {
    def.tableName = name;
    def.name = key;
    columns[key] = def
  }
  const table = new Table(columns, name);
  return table;
}
