CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`due_date` text NOT NULL,
	`due_time` text,
	`duration` integer DEFAULT 30 NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`category` text DEFAULT 'Pessoal' NOT NULL,
	`energy` text DEFAULT 'medium' NOT NULL,
	`repeat` text DEFAULT 'none' NOT NULL,
	`guide` text DEFAULT '' NOT NULL,
	`reminder` integer DEFAULT true NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_user_status_due` ON `tasks` (`user_id`,`done`,`due_date`,`due_time`);