CREATE TYPE "public"."collaborator_domain" AS ENUM('Long-term Research', 'Short-term Project', 'Co-author Needed');--> statement-breakpoint
CREATE TYPE "public"."crowd_vote" AS ENUM('approve', 'reject', 'duplicate', 'stale');--> statement-breakpoint
CREATE TYPE "public"."moderation_decision" AS ENUM('approve', 'reject', 'needs_crowd', 'expire');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."position_type" AS ENUM('PhD Student', 'Research Intern', 'PostDoc', 'Research Assistant');--> statement-breakpoint
CREATE TYPE "public"."post_event_type" AS ENUM('detail_open', 'source_click', 'contact_click', 'report_created', 'submit_created', 'admin_approved', 'admin_rejected', 'admin_expired', 'crowd_vote_created', 'crowd_approved', 'crowd_rejected', 'report_resolved', 'search_performed', 'zero_result_search');--> statement-breakpoint
CREATE TYPE "public"."post_source" AS ENUM('LinkedIn', 'X', 'RedBook', 'Other');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('Open for Applications', 'Reviewing Applications', 'Position Filled', 'Manuscript Draft Ready', 'Early Stage', 'Idea Stage', 'Outline Ready', 'Grant Funded', 'Industry Partnership');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('position', 'collaborator');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('stale', 'duplicate', 'suspicious', 'wrong_metadata', 'other');--> statement-breakpoint
CREATE TYPE "public"."reviewer_type" AS ENUM('heuristic', 'ai', 'crowd', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verified_status" AS ENUM('unverified', 'source_checked', 'poster_verified');--> statement-breakpoint
CREATE TYPE "public"."visibility_status" AS ENUM('active', 'expired', 'hidden');--> statement-breakpoint
CREATE TABLE "crowdVotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"vote" "crowd_vote" NOT NULL,
	"reason" text,
	"weight" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderationReviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"reviewerType" "reviewer_type" NOT NULL,
	"decision" "moderation_decision" NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"reason" text,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer,
	"userId" integer,
	"anonymousId" varchar(128),
	"eventType" "post_event_type" NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postReports" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"reporterUserId" integer,
	"type" "report_type" NOT NULL,
	"message" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"resolvedBy" integer,
	"resolvedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"type" "post_type" NOT NULL,
	"positionType" "position_type",
	"domain" "collaborator_domain",
	"source" "post_source" NOT NULL,
	"institution" varchar(255),
	"location" varchar(255),
	"authorName" varchar(255) NOT NULL,
	"authorAffiliation" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"originalText" text NOT NULL,
	"tags" text NOT NULL,
	"originalUrl" varchar(500) NOT NULL,
	"status" "post_status" DEFAULT 'Open for Applications' NOT NULL,
	"projectStatus" varchar(100),
	"deadline" varchar(50),
	"moderationStatus" "moderation_status" DEFAULT 'pending' NOT NULL,
	"visibilityStatus" "visibility_status" DEFAULT 'hidden' NOT NULL,
	"verifiedStatus" "verified_status" DEFAULT 'unverified' NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL,
	"approvedAt" timestamp,
	"approvedBy" integer,
	"rejectedAt" timestamp,
	"rejectedBy" integer,
	"rejectionReason" text,
	"lastReviewedAt" timestamp,
	"lastSourceCheckedAt" timestamp,
	"sourceHash" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"postedBy" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"unionId" varchar(255) NOT NULL,
	"name" varchar(255),
	"email" varchar(320),
	"avatar" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignInAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_unionId_unique" UNIQUE("unionId")
);
--> statement-breakpoint
CREATE INDEX "crowd_votes_post_idx" ON "crowdVotes" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "crowd_votes_user_post_idx" ON "crowdVotes" USING btree ("userId","postId");--> statement-breakpoint
CREATE INDEX "moderation_reviews_post_idx" ON "moderationReviews" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "moderation_reviews_created_idx" ON "moderationReviews" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "post_events_post_idx" ON "postEvents" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "post_events_user_idx" ON "postEvents" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "post_events_type_created_idx" ON "postEvents" USING btree ("eventType","createdAt");--> statement-breakpoint
CREATE INDEX "post_reports_post_idx" ON "postReports" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "post_reports_status_idx" ON "postReports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_public_feed_idx" ON "posts" USING btree ("visibilityStatus","moderationStatus","createdAt");--> statement-breakpoint
CREATE INDEX "posts_review_queue_idx" ON "posts" USING btree ("moderationStatus","visibilityStatus","submittedAt");--> statement-breakpoint
CREATE INDEX "posts_type_idx" ON "posts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "posts_source_idx" ON "posts" USING btree ("source");--> statement-breakpoint
CREATE INDEX "posts_posted_by_idx" ON "posts" USING btree ("postedBy");