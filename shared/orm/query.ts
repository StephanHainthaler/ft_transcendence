import Database from 'better-sqlite3';
import { Table } from './table';
type Argument = string | number;

type Constraint = {
  kind: 'eq' | 'ne' | 'bt' | 'lt' | 'be' | 'le',
  col: string,
  arg: string | number,
};

type Order = {
  order: 'desc' | 'asc',
  col: string,
};

export class Query {
  private constraints: Constraint[] = [];
  private params: Argument[] = [];
  private db: Database.Database;
  private table: Table;
  private order?: Order;
  private limitCount?: number;
  private queryTargets?: string[];
  private insertValues?: Record<string, Argument>;
  private type: 'select' | 'insert' | 'delete' | 'update' = 'select';

  constructor(table: Table, db: Database.Database) {
    this.table = table;
    this.db = db;
  }

  select(tableFields: string): Query {
    if (tableFields.trim().includes('*')) {
      this.queryTargets = ['*'];
    } else {
      const fields = tableFields.split(/,\s*/);
      if (this.table.has(fields)) {
        this.queryTargets = fields;
        this.type = 'select';
      }
    }
    return this;
  }

  limit(limit: number ): Query {
    this.limitCount = limit;
    return this;
  }

  eq(col: string, arg: Argument): Query {
    this.constraints.push({kind: 'eq', col, arg});
    return this;
  }
  ne(col: string, arg: Argument): Query {
    this.constraints.push({kind: 'ne', col, arg});
    return this;
  }
  bt(col: string, arg: Argument): Query {
    this.constraints.push({kind: 'bt', col, arg});
    return this;
  }
  lt(col: string, arg: Argument): Query {
    this.constraints.push({kind: 'lt', col, arg});
    return this;
  }
  be(col: string, arg: Argument): Query {
    this.constraints.push({kind: 'be', col, arg});
    return this;
  }
  le(col: string, arg: Argument): Query {
    this.constraints.push({kind: 'be', col, arg});
    return this;
  }

  insert(values: Record<string, string | number>): Query {
    let fields: string[] = Object.keys(values);
    if (this.table.has(fields)) {
      this.insertValues = values;
      this.type = 'insert';
    }
    return this;
  }

    stringify(): { sql: string; params: Argument[] } {
    const params: Argument[] = [];

    switch (this.type) {
      case 'select': {
        const cols = this.queryTargets?.includes('*') ? '*' : this.queryTargets?.join(',');
        let query = `SELECT ${cols} FROM "${this.table.name}"`;

        if (this.constraints.length > 0) {
          const constraints = this.constraints.map(c => {
            params.push(c.arg);
            return `${c.col} ${getOperator(c.kind)} ?`;
          }).join(' AND ');
          query += ` WHERE ${constraints}`;
        }

        if (this.order) {
          query += ` ORDER BY ${this.order.col} ${this.order.order.toUpperCase()}`;
        }

        if (this.limitCount) {
          query += ` LIMIT ?`;
          params.push(this.limitCount);
        }

        return { sql: query, params };
      }
      case 'insert': {
        if (!this.insertValues) throw new Error('Missing Insert Values!');

        const keys = Object.keys(this.insertValues);
        const placeholders = keys.map(() => '?').join(',');
        const values = Object.values(this.insertValues);

        return {
          sql: `INSERT INTO "${this.table.name}" (${keys.join(',')}) VALUES (${placeholders})`,
          params: values
        };
      }
      default:
        return { sql: '', params: [] };
    }
  }

  run() {
    const { sql, params } = this.stringify();
    return this.db.prepare(sql).run(...params);
  }

  get() {
    const { sql, params } = this.stringify();
    return this.db.prepare(sql).get(...params);
  }

  all() {
    const { sql, params } = this.stringify();
    return this.db.prepare(sql).all(...params);
  }
}

function getOperator(kind: Constraint['kind']): string {
  const ops = { eq: '=', ne: '!=', bt: '>', lt: '<', be: '>=', le: '<=' };
  return ops[kind];
}
