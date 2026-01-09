import { DB, defineTable, int, text } from "@server/orm";

interface Schema {
  auth_users: AuthUser,
  sessions: Session,
}

export type Session = {
  auth_id: number,
  user_id: number,
  token: string,
  expires_in: number,
  created_at: number,
}

export type AuthUser = { id: number, user_id: number, user_name?: string, email?: string, passwd: string, oauth_id: number};

export const db = new DB<Schema>();

const authUsers = defineTable(
  'auth_users', {
    id: int().notNull().primarykey().autoIncrement(),
    user_id: int().notNull().unique(),
    user_name: text().unique(),
    email: text().unique(),
    passwd: text().notNull(),
    oauth_id: int().unique(), // null fo rnormal signup
  },
  { col: 'user_name', notNull: true, chainOp: 'or' },
  { col: 'email', notNull: true }
);

const sessions = defineTable(
  'sessions', {
    auth_id: int().notNull().notNull().references(() => authUsers.columns.id),
    user_id: int().unique().notNull().references(() => authUsers.columns.user_id),
    token: text().notNull(),
    expires_in: int().notNull(),
    created_at: int().notNull()
  }
)

function initTables() {
  return { authUsers, sessions };
}

export function initDB(dbPath: string) {
  db.open(dbPath)
  const { authUsers, sessions } = initTables();

  db.create(authUsers);
  db.create(sessions);
}
