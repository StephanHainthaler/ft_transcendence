import { test, beforeEach } from "node:test";
import { DB, defineTable, int, text } from "../../../shared/orm";
import assert from "node:assert";


let db: DB;
let table: ReturnType<typeof defineTable>;

beforeEach(() => {
  db = new DB(':memory:');
  table = defineTable('test_table', {
    id: int().primarykey().notNull().autoIncrement(),
    name: text().notNull()
  });
  db.create(table);
});

test('fail-recreate-table', () => {
  assert.throws(() => {
    db.create(table);
  })
});

test('select-empty', () => {
  const query = db.from(table).select('*');
  try {
    query.get();
  } catch (e) {
    console.log(`QUERY: ${query.stringify()}`)
    throw e;
  }
});

test('insert', () => {
  const query = db.from(table).insert({
    name: 'peter',
  });
  try {
    query.run();
  } catch (e: any) {
    console.log(`QUERY: ${query.stringify()}`)
    throw e;
  }
})

test('insert-invalid', () => {
  assert.throws(() => {
    const query = db.from(table).insert({
      bless: 'you',
    });
    query.run();
  })
})

test('select-non-empty', () => {
  const query = db.from(table).select('*');
  try {
    query.get();
  } catch (e) {
    console.log(`QUERY: ${query.stringify()}`)
    throw e;
  }
});

test('sql-inject-select-where', () => {
  // Try to inject SQL in a WHERE clause
  const maliciousInput = "'; DROP TABLE \"test-table\"; --";
  const query = db.from(table).eq('name', maliciousInput).select('*');

  // Should treat it as a literal string, not execute DROP
  query.get(); // Should not throw or drop the table

  // Verify table still exists
  const verify = db.from(table).select('*');
  assert.doesNotThrow(() => verify.all());
});

test('sql-inject-insert-value', () => {
  const maliciousInput = "'; DELETE FROM \"test-table\"; --";

  const query = db.from(table).insert({
    name: maliciousInput
  });

  query.run(); // Should insert the string literally

  // Verify it was inserted as data, not executed
  const result: any = db.from(table).eq('name', maliciousInput).get();
  assert.strictEqual(result?.name, maliciousInput);
});

test('sql-inject-with-quotes', () => {
  const maliciousInput = "admin' OR '1'='1";
  
  db.from(table).insert({ name: 'admin' }).run();
  
  // Should find no match, not bypass authentication
  const result = db.from(table).eq('name', maliciousInput).get();
  assert.strictEqual(result, undefined);
  
  // Should only find exact match
  const valid: any = db.from(table).eq('name', 'admin').get();
  assert.strictEqual(valid?.name, 'admin');
});

test('sql-inject-union-attack', () => {
  const maliciousInput = "' UNION SELECT id, name FROM \"test-table\" --";
  
  const query = db.from(table).eq('name', maliciousInput).select('*');
  const result: any = query.get();
  
  // Should return nothing or the literal match, not union results
  assert.ok(result === undefined || result.name === maliciousInput);
});

test('sql-inject-comment-attack', () => {
  db.from(table).insert({ name: 'target' }).run();
  
  const maliciousInput = "target' --";
  
  // Should not match due to trailing comment
  const result: any = db.from(table).eq('name', maliciousInput).get();
  assert.strictEqual(result, undefined);
});

test('sql-inject-semicolon-chaining', () => {
  const maliciousInput = "test'; UPDATE \"test-table\" SET name='hacked'; --";
  
  db.from(table).insert({ name: 'original' }).run();
  db.from(table).insert({ name: maliciousInput }).run();
  
  // Verify original wasn't updated
  const result: any = db.from(table).eq('name', 'original').get();
  assert.strictEqual(result?.name, 'original');
});
