import Database from 'better-sqlite3';
import { Table } from './table';

/** Valid argument types for SQL parameters */
export type Argument = string | number | undefined;

/**
 * Constraint definition for WHERE clauses
 * @template K - Column key type
 */
type Constraint<K> = {
  /** Comparison operator kind */
  kind: 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le' | 'in',
  /** Column to constrain */
  col: K,
  /** Value to compare against */
  arg: Argument | Argument[],
  /** AND / OR */
  chainOp?: string,
};

/** ORDER BY clause configuration */
type Order = {
  /** Sort direction */
  order: 'desc' | 'asc',
  /** Column to sort by */
  col: string,
};

/**
 * Type-safe SQL query builder with chainable methods
 * @template Row - Full row type of the table
 * @template SelectedRow - Selected columns type (defaults to Row)
 * @example
 * const query = new Query<User>(usersTable, db)
 *   .select('id', 'name')
 *   .eq('age', 25)
 *   .desc('name')
 *   .limit(10);
 * const results = query.all();
 */
export class Query<Row, SelectedRow = Row> {
  private constraints: Constraint<keyof Row>[] = [];
  private db: Database.Database;
  private table: Table;
  private order?: Order;
  private limitCount?: number;
  private offsetCount?: number;
  private queryTargets?: string[];
  private insertValues?: Record<string, Argument>;
  private type: 'select' | 'insert' | 'delete' | 'update' | '' = '';
  private hasWhereClause: boolean = false;

  /**
   * Creates a new Query instance
   * @param table - Table to query
   * @param db - better-sqlite3 database instance
   */
  constructor(table: Table, db: Database.Database) {
    this.table = table;
    this.db = db;
  }

  /**
   * Inserts a new row into the table
   * @param values - Column-value pairs to insert
   * @returns Query instance for chaining
   * @example
   * query.insert({ name: 'John', age: 30 }).run();
   */
  insert(values: Record<string, Argument>): Query<Row, SelectedRow> {
    let fields: string[] = Object.keys(values);
    if (this.table.has(fields)) {
      this.insertValues = values;
      if (this.type === '')
        this.type = 'insert';
    }
    return this;
  }

  /**
   * Updates rows matching constraints
   * @param tableFields - Column-value pairs to update
   * @returns Query instance for chaining
   * @throws Error if combined with incompatible query type
   * @example
   * query.update({ name: 'Jane' }).eq('id', 1).run();
   */
  update(tableFields: Record<string, Argument>): Query<Row, SelectedRow> {
    let fields: string[] = Object.keys(tableFields);
    if (this.table.has(fields)) {
      this.insertValues = tableFields;
      if (this.type !== '' && this.type !== 'update') throw new Error(`Update does not work combined with ${this.type}`)
      this.type = 'update';
    }
    return this;
  }

  delete(): Query<Row, SelectedRow> {
    this.type = 'delete';
    return this;
  }

  where<K extends keyof Row>(constraint: Constraint<K>): Query<Row, SelectedRow> {
    if (this.hasWhereClause) throw new Error('Only a single WHERE clause is allowed');
    this.hasWhereClause = true;
    this.constraints.push(constraint);
    return this;
  }

  and<K extends keyof Row>(constraint: Constraint<K>): Query<Row, SelectedRow> {
    constraint.chainOp = 'AND';
    this.constraints.push(constraint);
    return this;
  }

  or<K extends keyof Row>(constraint: Constraint<K>): Query<Row, SelectedRow> {
    constraint.chainOp = 'OR';
    this.constraints.push(constraint);
    return this;
  }
  /**
   * Selects specific columns from the table
   * @param tableFields - Column names to select
   * @returns Query with narrowed return type
   * @example
   * query.select('id', 'name').all(); // returns Pick<Row, 'id' | 'name'>[]
   */
  select<K extends keyof Row>(...tableFields: K[]): Query<Row, Pick<Row, K>>;

  /**
   * Selects all columns from the table
   * @param tableFields - Asterisk wildcard
   * @returns Query with full row type
   * @example
   * query.select('*').all(); // returns Row[]
   */
  select(tableFields: '*'): Query<Row, Row>;
  select<K extends keyof Row>(
    ...tableFields: (K | '*')[]
  ): Query<Row, Pick<Row, K>> | Query<Row, Row> {
    if (tableFields.length === 1 && tableFields[0] === '*') {
      this.queryTargets = ['*'];
      if (this.type === '')
        this.type = 'select';
      return this as any;
    }
    const fields = tableFields.map(f => String(f));
    if (this.table.has(fields)) {
      this.queryTargets = fields;
      if (this.type === '')
        this.type = 'select';
    }
    return this as any;
  }

  /**
   * Sorts results in descending order
   * @param col - Column to sort by
   * @returns Query instance for chaining
   */
  desc<K extends keyof Row>(col: K): Query<Row, SelectedRow> {
    this.order = { order: 'desc', col: String(col) };
    return this;
  }
  /**
   * Sorts results in ascending order
   * @param col - Column to sort by
   * @returns Query instance for chaining
   */
  asc<K extends keyof Row>(col: K): Query<Row, SelectedRow> {
    this.order = { order: 'asc', col: String(col) };
    return this;
  }

  /**
   * Limits number of results returned
   * @param limit - Maximum number of rows
   * @returns Query instance for chaining
   */
  limit(limit: number): Query<Row, SelectedRow> {
    this.limitCount = limit;
    return this;
  }

  /**
   * Skips a specified number of rows before returning results (pagination)
   * @param offset - Number of rows to skip
   * @returns Query instance for chaining
   * @example
   * query.offset(10); // Skip first 10 rows
   */
  offset(offset: number): Query<Row, SelectedRow> {
    this.offsetCount = offset;
    return this;
  }

  /**
   * Adds equality constraint (=)
   * @param col - Column name
   * @param arg - Value to match
   * @returns Query instance for chaining
   */
  eq<K extends keyof Row>(col: K, arg: Argument): Query<Row, SelectedRow> {
    this.constraints.push({kind: 'eq', col, arg});
    return this;
  }

  /**
   * Adds not-equal constraint (!=)
   * @param col - Column name
   * @param arg - Value to exclude
   * @returns Query instance for chaining
   */
  ne<K extends keyof Row>(col: K, arg: Argument): Query<Row, SelectedRow> {
    this.constraints.push({kind: 'ne', col, arg});
    return this;
  }

  /**
   * Adds greater-than constraint (>)
   * @param col - Column name
   * @param arg - Minimum value (exclusive)
   * @returns Query instance for chaining
   */
  gt<K extends keyof Row>(col: K, arg: Argument): Query<Row, SelectedRow> {
    this.constraints.push({kind: 'gt', col, arg});
    return this;
  }

  /**
   * Adds less-than constraint (<)
   * @param col - Column name
   * @param arg - Maximum value (exclusive)
   * @returns Query instance for chaining
   */
  lt<K extends keyof Row>(col: K, arg: Argument): Query<Row, SelectedRow> {
    this.constraints.push({kind: 'lt', col, arg});
    return this;
  }

  /**
   * Adds greater-than-or-equal constraint (>=)
   * @param col - Column name
   * @param arg - Minimum value (inclusive)
   * @returns Query instance for chaining
   */
  ge<K extends keyof Row>(col: K, arg: Argument): Query<Row, SelectedRow> {
    this.constraints.push({kind: 'ge', col, arg});
    return this;
  }

  /**
   * Adds less-than-or-equal constraint (<=)
   * @param col - Column name
   * @param arg - Maximum value (inclusive)
   * @returns Query instance for chaining
   */
  le<K extends keyof Row>(col: K, arg: Argument): Query<Row, SelectedRow> {
    this.constraints.push({kind: 'le', col, arg});
    return this;
  }

  /**
   * Generates SQL string and parameters
   * @returns Object containing SQL query and parameter array
   */
  stringify(): { sql: string; params: Argument[] } {
    const params: Argument[] = [];

    switch (this.type) {
      case 'select': {
        const cols = this.queryTargets?.includes('*') ? '*' : this.queryTargets?.join(',');
        let query = `SELECT ${cols} FROM "${this.table.name}"`;

        if (this.constraints.length > 0) {
          query += stringifyContraints(this.constraints);
          const newParams = this.constraints.map(c => Array.isArray(c.arg) ? c.arg : [c.arg]).flat();
          params.push(...newParams);
        }

        if (this.order) {
          query += ` ORDER BY ${this.order.col} ${this.order.order.toUpperCase()}`;
        }

        if (this.limitCount !== undefined) {
          query += ` LIMIT ?`;
          params.push(this.limitCount);
        }

        if (this.offsetCount !== undefined) {
          query += ` OFFSET ?`;
          params.push(this.offsetCount);
        }

        return { sql: query, params };
      }
      case 'insert': {
        if (!this.insertValues) throw new Error('Missing Insert Values!');

        const keys = Object.keys(this.insertValues);
        const placeholders = keys.map(() => '?').join(',');
        let values = Object.values(this.insertValues);
        return {
          sql: `
INSERT INTO "${this.table.name}" (${keys.join(',')})
  VALUES (${placeholders})
  ${this.queryTargets ? `RETURNING ${this.queryTargets.join(',')}` : ''}
`,
          params: values
        };
      }
      case 'update': {
        if (!this.insertValues) throw new Error('Missing Insert Values!');
        if (this.constraints.length === 0) throw new Error('Missing constraint for update!');
        const keys = Object.keys(this.insertValues);
        const values = Object.values(this.insertValues);
        return {
          sql: `
UPDATE "${this.table.name}"
  SET ${keys.map(k => `${k} = ?`).join(', ')}
  ${this.constraints.length > 0 ? stringifyContraints(this.constraints) : ''}
  ${this.queryTargets ? `RETURNING ${this.queryTargets.join(',')}` : ''}`,
          params: [...values, ...this.constraints.map(c => (Array.isArray(c.arg) ? c.arg : [c.arg])).flat()]
        };
      }
      case 'delete': {
        if (this.constraints.length === 0) throw new Error('Missing constraint for update!');
        const params = this.constraints.flatMap(p => p.arg);
        return {
          sql: `
DELETE FROM "${this.table.name}"
  ${stringifyContraints(this.constraints)}
`,
          params,
        }
      }
      default:
        return { sql: '', params: [] };
    }
  }

  /**
   * Executes the query without returning results
   * @returns better-sqlite3 RunResult
   */
  run(): Database.RunResult {
    const { sql, params } = this.stringify();
    return this.db.prepare(sql).run(...params);
  }

  /**
   * Executes query and returns first result or null
   * @returns First matching row or null if none found
   */
  get(): SelectedRow[] | null {
    const { sql, params } = this.stringify();
    const ret = this.db.prepare<Argument[], SelectedRow[]>(sql).get(...params);
    return ret || null;
  }

  /**
   * Executes query and returns single row or null
   * @returns Single row or null if none found
   */
  single(): SelectedRow | null {
    const { sql, params } = this.stringify();
    const ret = this.db.prepare<Argument[], SelectedRow[]>(sql).get(...params);
    if (ret && Array.isArray(ret))
      return [...ret][0]
    return ret || null;
  }

  /**
   * Executes query and returns all matching rows
   * @returns Array of all matching rows
   */
  all(): SelectedRow[] {
    this.limitCount = undefined;
    const { sql, params } = this.stringify();
    console.log(sql);
    return this.db.prepare<Argument[], SelectedRow>(sql).all(...params);
  }
}


const stringifyContraints = <K>(constraints: Constraint<K>[]): string => {
  return ` WHERE ${constraints.map(c =>
    `${c.chainOp ? c.chainOp + ' ' : ''}${String(c.col)} ${
      getOperator(c.kind) === 'IN'
        ? `IN (${(c.arg as Argument[]).map(() => '?').join(',')})`
        : getOperator(c.kind) + ' ?'
    }`
  ).join(' ')}`;
}
/**
 * Converts constraint kind to SQL operator
 * @param kind - Constraint type
 * @returns SQL comparison operator
 */
function getOperator(kind: Constraint<string>['kind']): string {
  const ops = { eq: '=', ne: '!=', gt: '>', lt: '<', ge: '>=', le: '<=', in: 'IN' };
  return ops[kind];
}

/**
 * Adds equality constraint (=)
 * @param col - Column name
 * @param arg - Value to match
 * @returns Query instance for chaining
 */
export const eq = <K>(col: K, arg: Argument): Constraint<K> => {
  return ({kind: 'eq', col, arg});
}

/**
 * Adds not-equal constraint (!=)
 * @param col - Column name
 * @param arg - Value to exclude
 * @returns Query instance for chaining
 */
export const ne = <K>(col: K, arg: Argument): Constraint<K> => {
  return ({kind: 'ne', col, arg});
}

/**
 * Adds greater-than constraint (>)
 * @param col - Column name
 * @param arg - Minimum value (exclusive)
 * @returns Query instance for chaining
 */
export const gt = <K>(col: K, arg: Argument): Constraint<K> => {
  return ({kind: 'gt', col, arg});
}

/**
 * Adds less-than constraint (<)
 * @param col - Column name
 * @param arg - Maximum value (exclusive)
 * @returns Query instance for chaining
 */
export const lt = <K>(col: K, arg: Argument): Constraint<K> => {
  return ({kind: 'lt', col, arg});
}

/**
 * Adds greater-than-or-equal constraint (>=)
 * @param col - Column name
 * @param arg - Minimum value (inclusive)
 * @returns Query instance for chaining
 */
export const ge = <K>(col: K, arg: Argument): Constraint<K> => {
  return ({kind: 'ge', col, arg});
}

/**
 * Adds less-than-or-equal constraint (<=)
 * @param col - Column name
 * @param arg - Maximum value (inclusive)
 * @returns Query instance for chaining
 */
export const le = <K>(col: K, arg: Argument): Constraint<K> => {
  return ({kind: 'le', col, arg});
}

export const IN = <K>(col: K, arg: Argument[]): Constraint<K> => {
  return ({ kind: 'in', col, arg });
}
