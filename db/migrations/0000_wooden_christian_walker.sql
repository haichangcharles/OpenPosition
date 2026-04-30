CREATE TABLE `postEvents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`postId` bigint unsigned,
	`userId` bigint unsigned,
	`anonymousId` varchar(128),
	`eventType` enum('detail_open','source_click','contact_click','report_created','submit_created','admin_approved','admin_rejected','admin_expired','report_resolved','search_performed','zero_result_search') NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postReports` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`postId` bigint unsigned NOT NULL,
	`reporterUserId` bigint unsigned,
	`type` enum('stale','duplicate','suspicious','wrong_metadata','other') NOT NULL,
	`message` text,
	`status` enum('open','resolved','dismissed') NOT NULL DEFAULT 'open',
	`resolvedBy` bigint unsigned,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`type` enum('position','collaborator') NOT NULL,
	`positionType` enum('PhD Student','Research Intern','PostDoc','Research Assistant'),
	`domain` enum('Long-term Research','Short-term Project','Co-author Needed'),
	`source` enum('LinkedIn','X','RedBook','Other') NOT NULL,
	`institution` varchar(255),
	`location` varchar(255),
	`authorName` varchar(255) NOT NULL,
	`authorAffiliation` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`originalText` text NOT NULL,
	`tags` text NOT NULL,
	`originalUrl` varchar(500) NOT NULL,
	`status` enum('Open for Applications','Reviewing Applications','Position Filled','Manuscript Draft Ready','Early Stage','Idea Stage','Outline Ready','Grant Funded','Industry Partnership') NOT NULL DEFAULT 'Open for Applications',
	`projectStatus` varchar(100),
	`deadline` varchar(50),
	`moderationStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`visibilityStatus` enum('active','expired','hidden') NOT NULL DEFAULT 'hidden',
	`verifiedStatus` enum('unverified','source_checked','poster_verified') NOT NULL DEFAULT 'unverified',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	`approvedBy` bigint unsigned,
	`rejectedAt` timestamp,
	`rejectedBy` bigint unsigned,
	`rejectionReason` text,
	`lastReviewedAt` timestamp,
	`lastSourceCheckedAt` timestamp,
	`sourceHash` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`postedBy` bigint unsigned,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`unionId` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`avatar` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSignInAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_unionId_unique` UNIQUE(`unionId`)
);
