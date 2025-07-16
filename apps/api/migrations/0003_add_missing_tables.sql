-- Add missing tables that weren't in the original migration

-- Create tasks table
CREATE TABLE IF NOT EXISTS `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`deadline` integer,
	`completed` integer DEFAULT false NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`external_id` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Create recurring_tasks table
CREATE TABLE IF NOT EXISTS `recurring_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_template` text NOT NULL,
	`recurrence_type` text NOT NULL,
	`recurrence_data` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`last_generated` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Create game_masters table
CREATE TABLE IF NOT EXISTS `game_masters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`platform` text NOT NULL,
	`daily_tasks` text NOT NULL,
	`icon_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

-- Create user_games table
CREATE TABLE IF NOT EXISTS `user_games` (
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`settings` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`game_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `game_masters`(`id`) ON UPDATE no action ON DELETE no action
);

-- Create indexes
CREATE INDEX IF NOT EXISTS `idx_tasks_user_date` ON `tasks` (`user_id`,`created_at`);
CREATE INDEX IF NOT EXISTS `idx_tasks_type` ON `tasks` (`type`);
CREATE INDEX IF NOT EXISTS `idx_tasks_completed` ON `tasks` (`completed`);
CREATE INDEX IF NOT EXISTS `idx_recurring_tasks_user` ON `recurring_tasks` (`user_id`);