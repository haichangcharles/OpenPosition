import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["position", "collaborator"]).notNull(),
  positionType: mysqlEnum("positionType", [
    "PhD Student",
    "Research Intern",
    "PostDoc",
    "Research Assistant",
  ]),
  domain: mysqlEnum("domain", [
    "Long-term Research",
    "Short-term Project",
    "Co-author Needed",
  ]),
  source: mysqlEnum("source", ["LinkedIn", "X", "RedBook", "Other"]).notNull(),
  institution: varchar("institution", { length: 255 }),
  location: varchar("location", { length: 255 }),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorAffiliation: varchar("authorAffiliation", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  originalText: text("originalText").notNull(),
  tags: text("tags").notNull(), // comma-separated
  originalUrl: varchar("originalUrl", { length: 500 }).notNull(),
  status: mysqlEnum("status", [
    "Open for Applications",
    "Reviewing Applications",
    "Position Filled",
    "Manuscript Draft Ready",
    "Early Stage",
    "Idea Stage",
    "Outline Ready",
    "Grant Funded",
    "Industry Partnership",
  ]).default("Open for Applications").notNull(),
  projectStatus: varchar("projectStatus", { length: 100 }),
  deadline: varchar("deadline", { length: 50 }),
  moderationStatus: mysqlEnum("moderationStatus", [
    "pending",
    "approved",
    "rejected",
  ]).default("pending").notNull(),
  visibilityStatus: mysqlEnum("visibilityStatus", [
    "active",
    "expired",
    "hidden",
  ]).default("hidden").notNull(),
  verifiedStatus: mysqlEnum("verifiedStatus", [
    "unverified",
    "source_checked",
    "poster_verified",
  ]).default("unverified").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: bigint("approvedBy", { mode: "number", unsigned: true }),
  rejectedAt: timestamp("rejectedAt"),
  rejectedBy: bigint("rejectedBy", { mode: "number", unsigned: true }),
  rejectionReason: text("rejectionReason"),
  lastReviewedAt: timestamp("lastReviewedAt"),
  lastSourceCheckedAt: timestamp("lastSourceCheckedAt"),
  sourceHash: varchar("sourceHash", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  postedBy: bigint("postedBy", { mode: "number", unsigned: true }),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const postReports = mysqlTable("postReports", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  reporterUserId: bigint("reporterUserId", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", [
    "stale",
    "duplicate",
    "suspicious",
    "wrong_metadata",
    "other",
  ]).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["open", "resolved", "dismissed"])
    .default("open")
    .notNull(),
  resolvedBy: bigint("resolvedBy", { mode: "number", unsigned: true }),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PostReport = typeof postReports.$inferSelect;
export type InsertPostReport = typeof postReports.$inferInsert;

export const moderationReviews = mysqlTable("moderationReviews", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  reviewerType: mysqlEnum("reviewerType", [
    "heuristic",
    "ai",
    "crowd",
    "admin",
  ]).notNull(),
  decision: mysqlEnum("decision", [
    "approve",
    "reject",
    "needs_crowd",
    "expire",
  ]).notNull(),
  confidence: int("confidence").default(0).notNull(),
  reason: text("reason"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ModerationReview = typeof moderationReviews.$inferSelect;
export type InsertModerationReview = typeof moderationReviews.$inferInsert;

export const crowdVotes = mysqlTable("crowdVotes", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  vote: mysqlEnum("vote", ["approve", "reject", "duplicate", "stale"]).notNull(),
  reason: text("reason"),
  weight: int("weight").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrowdVote = typeof crowdVotes.$inferSelect;
export type InsertCrowdVote = typeof crowdVotes.$inferInsert;

export const postEvents = mysqlTable("postEvents", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  anonymousId: varchar("anonymousId", { length: 128 }),
  eventType: mysqlEnum("eventType", [
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
  ]).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostEvent = typeof postEvents.$inferSelect;
export type InsertPostEvent = typeof postEvents.$inferInsert;
