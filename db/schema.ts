import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const postTypeEnum = pgEnum("post_type", ["position", "collaborator"]);
export const positionTypeEnum = pgEnum("position_type", [
  "PhD Student",
  "Research Intern",
  "PostDoc",
  "Research Assistant",
]);
export const collaboratorDomainEnum = pgEnum("collaborator_domain", [
  "Long-term Research",
  "Short-term Project",
  "Co-author Needed",
]);
export const postSourceEnum = pgEnum("post_source", [
  "LinkedIn",
  "X",
  "RedBook",
  "Other",
]);
export const postStatusEnum = pgEnum("post_status", [
  "Open for Applications",
  "Reviewing Applications",
  "Position Filled",
  "Manuscript Draft Ready",
  "Early Stage",
  "Idea Stage",
  "Outline Ready",
  "Grant Funded",
  "Industry Partnership",
]);
export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);
export const visibilityStatusEnum = pgEnum("visibility_status", [
  "active",
  "expired",
  "hidden",
]);
export const verifiedStatusEnum = pgEnum("verified_status", [
  "unverified",
  "source_checked",
  "poster_verified",
]);
export const reportTypeEnum = pgEnum("report_type", [
  "stale",
  "duplicate",
  "suspicious",
  "wrong_metadata",
  "other",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "resolved",
  "dismissed",
]);
export const reviewerTypeEnum = pgEnum("reviewer_type", [
  "heuristic",
  "ai",
  "crowd",
  "admin",
]);
export const moderationDecisionEnum = pgEnum("moderation_decision", [
  "approve",
  "reject",
  "needs_crowd",
  "expire",
]);
export const crowdVoteEnum = pgEnum("crowd_vote", [
  "approve",
  "reject",
  "duplicate",
  "stale",
]);
export const postEventTypeEnum = pgEnum("post_event_type", [
  "detail_open",
  "source_click",
  "contact_click",
  "report_created",
  "submit_created",
  "admin_approved",
  "admin_rejected",
  "admin_expired",
  "crowd_vote_created",
  "crowd_approved",
  "crowd_rejected",
  "report_resolved",
  "search_performed",
  "zero_result_search",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  type: postTypeEnum("type").notNull(),
  positionType: positionTypeEnum("positionType"),
  domain: collaboratorDomainEnum("domain"),
  source: postSourceEnum("source").notNull(),
  institution: varchar("institution", { length: 255 }),
  location: varchar("location", { length: 255 }),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorAffiliation: varchar("authorAffiliation", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  originalText: text("originalText").notNull(),
  tags: text("tags").notNull(), // comma-separated
  originalUrl: varchar("originalUrl", { length: 500 }).notNull(),
  status: postStatusEnum("status").default("Open for Applications").notNull(),
  projectStatus: varchar("projectStatus", { length: 100 }),
  deadline: varchar("deadline", { length: 50 }),
  moderationStatus: moderationStatusEnum("moderationStatus")
    .default("pending")
    .notNull(),
  visibilityStatus: visibilityStatusEnum("visibilityStatus")
    .default("hidden")
    .notNull(),
  verifiedStatus: verifiedStatusEnum("verifiedStatus")
    .default("unverified")
    .notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: integer("approvedBy"),
  rejectedAt: timestamp("rejectedAt"),
  rejectedBy: integer("rejectedBy"),
  rejectionReason: text("rejectionReason"),
  lastReviewedAt: timestamp("lastReviewedAt"),
  lastSourceCheckedAt: timestamp("lastSourceCheckedAt"),
  sourceHash: varchar("sourceHash", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  postedBy: integer("postedBy"),
}, (table) => [
  index("posts_public_feed_idx").on(
    table.visibilityStatus,
    table.moderationStatus,
    table.createdAt,
  ),
  index("posts_review_queue_idx").on(
    table.moderationStatus,
    table.visibilityStatus,
    table.submittedAt,
  ),
  index("posts_type_idx").on(table.type),
  index("posts_source_idx").on(table.source),
  index("posts_posted_by_idx").on(table.postedBy),
]);

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const postReports = pgTable("postReports", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  reporterUserId: integer("reporterUserId"),
  type: reportTypeEnum("type").notNull(),
  message: text("message"),
  status: reportStatusEnum("status")
    .default("open")
    .notNull(),
  resolvedBy: integer("resolvedBy"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("post_reports_post_idx").on(table.postId),
  index("post_reports_status_idx").on(table.status),
]);

export type PostReport = typeof postReports.$inferSelect;
export type InsertPostReport = typeof postReports.$inferInsert;

export const moderationReviews = pgTable("moderationReviews", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  reviewerType: reviewerTypeEnum("reviewerType").notNull(),
  decision: moderationDecisionEnum("decision").notNull(),
  confidence: integer("confidence").default(0).notNull(),
  reason: text("reason"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("moderation_reviews_post_idx").on(table.postId),
  index("moderation_reviews_created_idx").on(table.createdAt),
]);

export type ModerationReview = typeof moderationReviews.$inferSelect;
export type InsertModerationReview = typeof moderationReviews.$inferInsert;

export const crowdVotes = pgTable("crowdVotes", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  userId: integer("userId").notNull(),
  vote: crowdVoteEnum("vote").notNull(),
  reason: text("reason"),
  weight: integer("weight").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("crowd_votes_post_idx").on(table.postId),
  index("crowd_votes_user_post_idx").on(table.userId, table.postId),
]);

export type CrowdVote = typeof crowdVotes.$inferSelect;
export type InsertCrowdVote = typeof crowdVotes.$inferInsert;

export const postEvents = pgTable("postEvents", {
  id: serial("id").primaryKey(),
  postId: integer("postId"),
  userId: integer("userId"),
  anonymousId: varchar("anonymousId", { length: 128 }),
  eventType: postEventTypeEnum("eventType").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("post_events_post_idx").on(table.postId),
  index("post_events_user_idx").on(table.userId),
  index("post_events_type_created_idx").on(table.eventType, table.createdAt),
]);

export type PostEvent = typeof postEvents.$inferSelect;
export type InsertPostEvent = typeof postEvents.$inferInsert;
