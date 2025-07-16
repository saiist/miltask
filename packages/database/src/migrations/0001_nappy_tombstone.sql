CREATE TABLE `anime` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`mal_id` integer,
	`image_url` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`current_episode` integer DEFAULT 0 NOT NULL,
	`total_episodes` integer,
	`rating` integer,
	`notes` text,
	`metadata` text,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `anime_user_id_idx` ON `anime` (`user_id`);--> statement-breakpoint
CREATE INDEX `anime_status_idx` ON `anime` (`status`);--> statement-breakpoint
CREATE INDEX `anime_user_status_idx` ON `anime` (`user_id`,`status`);