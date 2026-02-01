import { beforeEach, test } from "node:test";
import { DB, defineTable, eq, int, text } from "../../shared-server/orm";
import assert from "node:assert";

interface Schema {
  test_table: { id: number, name: string }
}

let db: DB<Schema>;
let table = defineTable('test_table', {
  id: int().primarykey().notNull().autoIncrement(),
  name: text().notNull()
});

beforeEach(() => {
  db = new DB<Schema>();
  db.open(':memory:');
  db.create(table);
  db.from(table).insert({name: 'first-test-user'}).run();
  db.from(table).insert({name: 'second-test-user'}).run();
})

test('select-empty', () => {
  assert.throws(() => {
    const query = db.from(table).select('*' as any);
    try {
      const res = query.get();
      if (res) throw new Error("Query not empty")
    } catch (e) {
      console.error(`FAILED_QUERY: ${query.stringify().sql}`)
      throw e;
    }
  })
});

test('insert', () => {
  const query = db.from(table).insert({
    name: 'peter',
  });
  try {
    query.run();
  } catch (e: any) {
    console.error(`FAILED_QUERY: ${query.stringify().sql}`)
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

test('insert-return', () => {
  const query = db.from(table)
    .insert({
      name: 'test-user',
    })
    .select('id');
  try {
    const id = query.single();
    assert.ok(id && id.id)
  } catch (e: any) {
    console.error(`FAILED_QUERY: ${query.stringify().sql}`)
    throw e;
  }
})

test('select-non-empty', () => {
  const query = db.from(table).select('*' as any);
  try {
    const ret = query.get();
    console.error(ret);
    assert.ok(ret)
  } catch (e) {
    console.error(`FAILED_QUERY: ${query.stringify().sql}`)
    throw e;
  }
});

test('insert-sql-injection-attempt', () => {
  const maliciousInput = "'; DROP TABLE test_table; --";
  const query = db.from(table).insert({
    name: maliciousInput,
  });

  // Should not throw - the ORM should handle this safely
  query.run();

  // Verify table still exists by querying it
  const checkQuery = db.from(table).select('*' as any);
  assert.doesNotThrow(() => checkQuery.all());
});

test('select-sql-injection-where', () => {
  const maliciousInput = "' OR '1'='1";
  const query = db.from(table).select('*' as any).where(eq('name', maliciousInput));

  try {
    const results = query.all();
    // Should return 0 or 1 result matching the literal string, not all rows
    assert.ok(results.length <= 1);
  } catch (e) {
    console.error(`FAILED_QUERY: ${query.stringify().sql}`);
    throw e;
  }
});

test('update-sql-injection', () => {
  const maliciousInput = "test'; DELETE FROM test_table WHERE '1'='1";
  const query = db.from(table)
    .update({ name: maliciousInput })
    .where(eq('id', 1));

  query.run();

  // Verify all rows still exist
  const count = db.from(table).select('*' as any).all().length;
  assert.ok(count > 0);
});
