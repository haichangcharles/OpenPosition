CREATE TABLE `crowdVotes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`postId` bigint unsigned NOT NULL,
	`userId` bigint unsigned NOT NULL,
	`vote` enum('approve','reject','duplicate','stale') NOT NULL,
	`reason` text,
	`weight` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crowdVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderationReviews` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`postId` bigint unsigned NOT NULL,
	`reviewerType` enum('heuristic','ai','crowd','admin') NOT NULL,
	`decision` enum('approve','reject','needs_crowd','expire') NOT NULL,
	`confidence` int NOT NULL DEFAULT 0,
	`reason` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderationReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `postEvents` MODIFY COLUMN `eventType` enum('detail_open','source_click','contact_click','report_created','submit_created','admin_approved','admin_rejected','admin_expired','crowd_vote_created','crowd_approved','crowd_rejected','report_resolved','search_performed','zero_result_search') NOT NULL;