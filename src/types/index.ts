export type Source = 'LinkedIn' | 'X' | 'RedBook' | 'Other';

export type PositionType = 'PhD Student' | 'Research Intern' | 'PostDoc' | 'Research Assistant';

export type CollaboratorDomain = 'Long-term Research' | 'Short-term Project' | 'Co-author Needed';

export type PostType = 'position' | 'collaborator';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type VisibilityStatus = 'active' | 'expired' | 'hidden';

export type VerifiedStatus = 'unverified' | 'source_checked' | 'poster_verified';

export type PostStatus =
  | 'Open for Applications'
  | 'Reviewing Applications'
  | 'Position Filled'
  | 'Manuscript Draft Ready'
  | 'Early Stage'
  | 'Idea Stage'
  | 'Outline Ready'
  | 'Grant Funded'
  | 'Industry Partnership';

export interface Post {
  id: number;
  title: string;
  type: PostType;
  positionType: PositionType | null;
  domain: CollaboratorDomain | null;
  source: Source;
  institution: string | null;
  location: string | null;
  authorName: string;
  authorAffiliation: string;
  summary: string;
  originalText: string;
  tags: string;
  originalUrl: string;
  status: PostStatus;
  projectStatus: string | null;
  deadline: string | null;
  moderationStatus: ModerationStatus;
  visibilityStatus: VisibilityStatus;
  verifiedStatus: VerifiedStatus;
  submittedAt: Date;
  approvedAt: Date | null;
  approvedBy: number | null;
  rejectedAt: Date | null;
  rejectedBy: number | null;
  rejectionReason: string | null;
  lastReviewedAt: Date | null;
  lastSourceCheckedAt: Date | null;
  sourceHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  postedBy: number | null;
}

export interface Filters {
  keywords: string[];
  sources: Source[];
  positionTypes: PositionType[];
  collaboratorDomains: CollaboratorDomain[];
  sortBy: 'newest' | 'closingSoon';
  searchQuery: string;
}

export type View = 'positions' | 'collaborators';
