export type Type = 'integer' | 'text';
export class Column {
  colType: Type = 'integer';
  private colName: string = '';
  private colTableName: string = '';
  pkey: boolean = false;
  autoInc: boolean = false;
  colNotNull: boolean = false;
  ref?: () => Column;

  constructor() {};

  type(type: Type): Column {
    this.colType = type;
    return this;
  }

  primarykey(): Column {
    this.pkey = true;
    return this
  }

  autoIncrement(): Column {
    this.autoInc = true;
    return this;
  }

  notNull(): Column {
    this.colNotNull = true;
    return this;
  }

  references(ref: () => any): Column {
    this.ref = ref;
    return this;
  }

  stringify(): string {
    return `${this.colName} ${this.colType} ${this.pkey ? 'primary key' : ''} ${this.autoInc ? 'autoincrement' : ''} ${this.colNotNull ? 'not null' : ''} ${this.ref !== undefined ? `${this.ref?.().colTableName}(${this.colName})` : ''}`;
  }

  set name(name: string) { this.colName = name }
  set tableName(name: string) { this.colTableName = name }
  get name() { return this.colName }
  get tableName() { return this.colTableName }
}

export function int(): Column {
  return new Column().type('integer');
}

export function text(): Column {
  return new Column().type('text');
}
