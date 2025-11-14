import { DB, defineTable, int, text } from "@shared/orm";

interface Schema {
  auth_users: AuthUser,
}

export type AuthUser = { id: number, user_id: number, user_name?: string, email?: string, passwd: string};

export const db = new DB<Schema>();

const authUsers = defineTable(
  'auth_users',
  {
    id: int().notNull().primarykey().autoIncrement(),
    user_id: int().notNull().unique(),
    user_name: text().unique(),
    email: text().unique(),
    passwd: text().notNull(),
  },
  { col: 'user_name', notNull: true, chainOp: 'or' },
  { col: 'email', notNull: true }
);

function initTables() {
  return { authUsers };
}

export function initDB(dbPath: string) {
  db.open(dbPath)
  const { authUsers } = initTables();

  console.log(authUsers.stringify())

  db.create(authUsers);
}
