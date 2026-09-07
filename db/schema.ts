import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  dueDate: text("due_date").notNull(),
  dueTime: text("due_time"),
  duration: integer("duration").notNull().default(30),
  priority: text("priority").notNull().default("normal"),
  category: text("category").notNull().default("Pessoal"),
  energy: text("energy").notNull().default("medium"),
  repeat: text("repeat").notNull().default("none"),
  guide: text("guide").notNull().default(""),
  reminder: integer("reminder", { mode: "boolean" }).notNull().default(true),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_tasks_user_status_due").on(table.userId, table.done, table.dueDate, table.dueTime),
]);
