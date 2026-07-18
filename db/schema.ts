import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  index,
} from "drizzle-orm/mysql-core";

// ========== 用户表（本地认证） ==========
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ========== 分数据库表 ==========
export const databases = mysqlTable(
  "databases",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    description: text("description"),
    ownerId: bigint("ownerId", { mode: "number", unsigned: true }).notNull(),
    visibility: mysqlEnum("visibility", ["public", "private", "team"]).default("public").notNull(),
    termCount: int("termCount").default(0).notNull(),
    status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdx: index("db_owner_idx").on(table.ownerId),
    categoryIdx: index("db_category_idx").on(table.category),
  })
);

export type Database = typeof databases.$inferSelect;
export type InsertDatabase = typeof databases.$inferInsert;

// ========== 术语条目表 ==========
export const terms = mysqlTable(
  "terms",
  {
    id: serial("id").primaryKey(),
    dbId: bigint("dbId", { mode: "number", unsigned: true }).notNull(),
    cnTerm: varchar("cnTerm", { length: 255 }).notNull(),
    ruTerm: varchar("ruTerm", { length: 255 }).notNull(),
    enTerm: varchar("enTerm", { length: 255 }),
    definition: text("definition"),
    context: text("context"),
    cultureNote: text("cultureNote"),
    pos: varchar("pos", { length: 50 }),
    tags: varchar("tags", { length: 500 }),
    status: mysqlEnum("status", ["active", "deleted"]).default("active").notNull(),
    version: int("version").default(1).notNull(),
    createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
    updatedBy: bigint("updatedBy", { mode: "number", unsigned: true }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    dbIdx: index("term_db_idx").on(table.dbId),
    cnIdx: index("term_cn_idx").on(table.cnTerm),
    ruIdx: index("term_ru_idx").on(table.ruTerm),
    statusIdx: index("term_status_idx").on(table.status),
  })
);

export type Term = typeof terms.$inferSelect;
export type InsertTerm = typeof terms.$inferInsert;

// ========== 术语关联表 ==========
export const termRelations = mysqlTable(
  "term_relations",
  {
    id: serial("id").primaryKey(),
    termId: bigint("termId", { mode: "number", unsigned: true }).notNull(),
    relatedTermId: bigint("relatedTermId", { mode: "number", unsigned: true }).notNull(),
    relationType: varchar("relationType", { length: 50 }).default("related").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    termIdx: index("rel_term_idx").on(table.termId),
  })
);

// ========== 教学资源表 ==========
export const resources = mysqlTable(
  "resources",
  {
    id: serial("id").primaryKey(),
    dbId: bigint("dbId", { mode: "number", unsigned: true }).notNull(),
    moduleType: mysqlEnum("moduleType", [
      "dialogue",
      "reading",
      "case",
      "video",
      "quiz",
      "culture",
    ]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
    duration: int("duration"),
    creatorId: bigint("creatorId", { mode: "number", unsigned: true }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    dbIdx: index("res_db_idx").on(table.dbId),
    typeIdx: index("res_type_idx").on(table.moduleType),
  })
);

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ========== 学习记录表 ==========
export const learningRecords = mysqlTable(
  "learning_records",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    targetType: varchar("targetType", { length: 50 }).notNull(),
    targetId: bigint("targetId", { mode: "number", unsigned: true }).notNull(),
    mode: varchar("mode", { length: 50 }).notNull(),
    score: int("score"),
    duration: int("duration"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("lr_user_idx").on(table.userId),
  })
);

// ========== 收藏表 ==========
export const favorites = mysqlTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    targetType: varchar("targetType", { length: 50 }).notNull(),
    targetId: bigint("targetId", { mode: "number", unsigned: true }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("fav_user_idx").on(table.userId),
  })
);

// ========== 翻译任务表 ==========
export const translationTasks = mysqlTable(
  "translation_tasks",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    sourceLang: varchar("sourceLang", { length: 10 }).notNull(),
    targetLang: varchar("targetLang", { length: 10 }).notNull(),
    sourceText: text("sourceText").notNull(),
    resultText: text("resultText"),
    matchedTerms: text("matchedTerms"),
    status: mysqlEnum("status", ["pending", "completed", "failed"]).default("completed").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("tt_user_idx").on(table.userId),
  })
);

// ========== 用户分库角色表 ==========
export const userDatabaseRoles = mysqlTable(
  "user_database_roles",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    dbId: bigint("dbId", { mode: "number", unsigned: true }).notNull(),
    role: mysqlEnum("role", ["admin", "editor", "viewer"]).default("viewer").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userDbIdx: index("udr_user_db_idx").on(table.userId, table.dbId),
  })
);
