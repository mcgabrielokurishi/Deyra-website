// ── Shared domain types for the Pay4Light admin dashboard ──────────────────

export type UserStatus = "Active" | "Inactive";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  meterCount: number;
  walletBalance: number;
  status: UserStatus;
  dateJoined: string;
  role?: "Admin" | "Support" | "Customer";
  walletLocked?: boolean;
  isActive?: boolean;
}

export type TransactionStatus = "Success" | "Failed" | "Pending";
export type TransactionType = "Top-Up" | "Purchase" | "Transfer" | "Refund";

export interface Transaction {
  id: string;
  transactionId: string;
  name: string;
  amount: number;
  type: TransactionType;
  provider: string;
  status: TransactionStatus;
  date: string;
  time: string;
}

export type ProviderStatus = "Active" | "Degraded" | "Offline";

export interface Provider {
  id: string;
  name: string;
  fullName: string;
  region: string;
  totalMeters: number;
  uptime: number;
  lastSync: string;
  status: ProviderStatus;
}

export interface ProviderReliability {
  vertical: "DATA" | "ELECTRICITY" | "TV" | "VTU" | string;
  disco_code: string;
  success_percentage: number;
  pending_percentage: number;
  failure_percentage: number;
  provider_online: boolean;
}

export type MeterStatus = "Active" | "Faulty" | "Inactive";

export interface LinkedMeter {
  id: string;
  name: string;
  meterNumber: string;
  provider: string;
  status: MeterStatus;
  lastRecharge: string;
}

export interface Community {
  id: string;
  name: string;
  handle?: string;
  category?: CommunityPostCategory | string;
  createdBy: "User" | "Admin";
  members: number;
  status: "Approved" | "Pending" | "Active" | "Suspended";
  dateCreated: string;
}

export interface BackendCommunity {
  id: string;
  name: string;
  handle?: string;
  description?: string;
  area?: string;
  state?: string;
  category?: string;
  isPublic?: boolean;
  coverImage?: string;
  avatar?: string;
  avatarColor?: string;
  status?: "Approved" | "Pending" | "Active" | "Suspended" | "APPROVED" | "PENDING" | "ACTIVE" | "SUSPENDED" | string;
  createdBy?: "User" | "Admin" | "USER" | "ADMIN" | string;
  members?: number;
  membersCount?: number;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityCreatePayload {
  name: string;
  handle?: string;
  description?: string;
  tagline?: string;
  mission?: string;
  founderName?: string;
  phone?: string;
  email?: string;
  area?: string;
  state?: string;
  category?: string;
  isPublic?: boolean;
  coverImage?: string;
  avatar?: string;
  profileImage?: string;
  avatarColor?: string;
  createdBy?: "User" | "Admin";
  members?: number;
  status?: "Approved" | "Pending" | "Active" | "Suspended";
}

export type CommunityPostCategory = "OUTAGES" | "TIPS" | "NEWS" | "GENERAL";

export interface AdminCommunityPost {
  id: string;
  content: string;
  images: string[];
  location?: string | null;
  createdAt: string;
  category: CommunityPostCategory;
  community: { id: string; name: string; category: CommunityPostCategory };
  author: { id: string; fullName: string; email: string };
  tags: string[];
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  repostsCount: number;
  viewsCount: number;
  reportCount: number;
}

export interface AdminCommunityComment {
  id: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  author: { id: string; fullName: string; username?: string | null; avatar?: string | null };
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  replies: AdminCommunityComment[];
}

export interface AdminCommunityPostsResponse {
  success: boolean;
  data: AdminCommunityPost[];
  stats: { totalPosts: number; reportedPosts: number; pendingReports: number; reportingAvailable?: boolean };
  meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean };
}

export interface AdminUser {
  name: string;
  role: string;
}
