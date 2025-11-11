/** SQL column data types */
export type Type = 'integer' | 'text';

/** Valid default value types for columns */
export type DefaultValue = number | string | 'CURRENT_TIME' | 'CURRENT_DATE' | 'CURRENT_TIMESTAMP';

/**
 * Represents a database column with chainable constraint methods
 */
export class Column {
  private colType: Type = 'integer';
  private colName: string = '';
  private colTableName: string = '';
  private pkey: boolean = false;
  private autoInc: boolean = false;
  private colNotNull: boolean = false;
  private colUnique: boolean = false;
  private ref?: () => Column;
  private colDefault?: DefaultValue;

  constructor() {};

  /**
   * Sets the column data type
   * @param type - SQL data type
   * @returns Column instance for chaining
   */
  type(type: Type): Column {
    this.colType = type;
    return this;
  }

  /**
   * Marks column as primary key
   * @returns Column instance for chaining
   */
  primarykey(): Column {
    this.pkey = true;
    return this
  }

  /**
   * Adds UNIQUE constraint
   * @returns Column instance for chaining
   */
  unique(): Column {
    this.colUnique = true;
    return this
  }

  /**
   * Enables auto-increment (SQLite AUTOINCREMENT)
   * @returns Column instance for chaining
   */
  autoIncrement(): Column {
    this.autoInc = true;
    return this;
  }

  /**
   * Sets default value for column
   * @param defValue - Default value (number, string, or SQL function)
   * @returns Column instance for chaining
   */
  default(defValue: DefaultValue): Column {
    this.colDefault = defValue;
    return this;
  }

  /**
   * Adds NOT NULL constraint
   * @returns Column instance for chaining
   */
  notNull(): Column {
    this.colNotNull = true;
    return this;
  }

  /**
   * Creates foreign key reference to another column
   * @param ref - Function returning the referenced Column
   * @returns Column instance for chaining
   */
  references(ref: () => any): Column {
    this.ref = ref;
    return this;
  }

  /**
   * Generates SQL column definition
   * @returns SQL string for column definition
   */
  stringify(): string {
    return `${this.colName} ${this.colType.toUpperCase()}${this.pkey ? ' PRIMARY KEY' : ''}${this.colUnique ? ' UNIQUE' : ''}${this.autoInc ? ' AUTOINCREMENT' : ''}${this.colNotNull ? ' NOT NULL' : ''}${this.ref !== undefined ? ` REFERENCES ${this.ref?.().colTableName}(${this.ref?.().colName})` : ''}${this.colDefault ? ` DEFAULT ${String(this.colDefault)}` : ''}`;
  }

  /** Sets the column name */
  set name(name: string) { this.colName = name }

  /** Sets the table name this column belongs to */
  set tableName(name: string) { this.colTableName = name }

  /** Gets the column name */
  get name() { return this.colName }

  /** Gets the table name */
  get tableName() { return this.colTableName }
}

/**
 * Creates an INTEGER column
 * @returns Column instance configured as integer type
 * @example
 * int().primarykey().autoIncrement()
 */
export function int(): Column {
  return new Column().type('integer');
}

/**
 * Creates a TEXT column
 * @returns Column instance configured as text type
 * @example
 * text().notNull().unique()
 */
export function text(): Column {
  return new Column().type('text');
}
