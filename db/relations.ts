import { relations } from "drizzle-orm";
import {
  users,
  databases,
  terms,
  termRelations,
  resources,
  learningRecords,
  favorites,
  translationTasks,
  userDatabaseRoles,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  databases: many(databases),
  learningRecords: many(learningRecords),
  favorites: many(favorites),
  translationTasks: many(translationTasks),
  userDatabaseRoles: many(userDatabaseRoles),
}));

export const databasesRelations = relations(databases, ({ one, many }) => ({
  owner: one(users, { fields: [databases.ownerId], references: [users.id] }),
  terms: many(terms),
  resources: many(resources),
  userDatabaseRoles: many(userDatabaseRoles),
}));

export const termsRelations = relations(terms, ({ one, many }) => ({
  database: one(databases, { fields: [terms.dbId], references: [databases.id] }),
  relations: many(termRelations),
}));

export const termRelationsRelations = relations(termRelations, ({ one }) => ({
  term: one(terms, { fields: [termRelations.termId], references: [terms.id] }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  database: one(databases, { fields: [resources.dbId], references: [databases.id] }),
}));

export const learningRecordsRelations = relations(learningRecords, ({ one }) => ({
  user: one(users, { fields: [learningRecords.userId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
}));

export const translationTasksRelations = relations(translationTasks, ({ one }) => ({
  user: one(users, { fields: [translationTasks.userId], references: [users.id] }),
}));

export const userDatabaseRolesRelations = relations(userDatabaseRoles, ({ one }) => ({
  user: one(users, { fields: [userDatabaseRoles.userId], references: [users.id] }),
  database: one(databases, { fields: [userDatabaseRoles.dbId], references: [databases.id] }),
}));
