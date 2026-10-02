import type { AdminCommunityComment, AdminCommunityPostsResponse, BackendCommunity, Community, CommunityCreatePayload, CommunityPostCategory, PlatformUser, Provider, ProviderReliability, Transaction } from "../types";

const normalizeCommunityStatus = (status?: string): Community["status"] => {
  const value = (status ?? "Pending").toUpperCase();
  if (value === "APPROVED" || value === "ACTIVE") return "Active";
  if (value === "SUSPENDED") return "Suspended";
  return "Pending";
};

const normalizeCommunity = (community: Partial<BackendCommunity> | Community): Community => {
  const rawStatus = (community as Partial<BackendCommunity>).status;
  const createdBy = (community as Partial<BackendCommunity>).createdBy;
  const members =
    (community as Partial<BackendCommunity>).members ??
    (community as Partial<BackendCommunity>).membersCount ??
    (community as Partial<BackendCommunity>).memberCount ??
    (community as Community).members ??
    0;

  return {
    id: community.id ?? `community-${Date.now()}`,
    name: community.name ?? "Untitled Community",
    handle: (community as Partial<BackendCommunity>).handle ?? (community as Community).handle,
    category: (community as Partial<BackendCommunity>).category ?? (community as Community).category,
    createdBy: createdBy === "Admin" || createdBy === "ADMIN" ? "Admin" : "User",
    members: Number(members) || 0,
    status: normalizeCommunityStatus(rawStatus),
    dateCreated:
      (community as Partial<BackendCommunity>).createdAt
        ? new Date((community as Partial<BackendCommunity>).createdAt as string).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : (community as Community).dateCreated ?? "N/A",
  };
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://pay4light-backend-main.onrender.com";

export type AdminStatus = "Active" | "Inactive" | "Pending" | "Failed" | "Success";

// Backend response structure from /admin/dashboard
export interface BackendDashboardResponse {
  users: {
    total: number;
    active: number;
    verified: number;
    deleted: number;
    inactive: number;
  };
  transactions: {
    total: number;
    today: number;
    month: number;
  };
  vending: {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    successRate: string;
  };
  finance: {
    totalWalletBalance: number;
    totalRevenue: number;
    todayRevenue: number;
  };
}

// Backend user response structure
export interface BackendUserResponse {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: "ADMIN" | "USER" | "SUPPORT";
  isActive: boolean;
  isVerified: boolean;
  failedAttempts: number;
  lockedUntil: string | null;
  deletedAt: string | null;
  createdAt: string;
  discoCode: string | null;
  wallet: {
    balance: number;
    locked: boolean;
    virtualAccountNuban: string | null;
  };
  _count: {
    meters: number;
    transactions: number;
  };
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalMetersLinked: number;
  totalWalletBalance: number;
  totalRechargesToday: number;
  pendingTransactions: number;
  failedTransactions: number;
  rechargeVolume: { success: number; pending: number; failed: number };
  recentTransactions?: Array<{
    id: string;
    name: string;
    amount: number;
    status: string;
    time?: string;
    timeAgo?: string;
  }>;
}

export interface OverviewSummary {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

export interface UserRolePayload {
  role: string;
}

export interface WalletAdjustment {
  amount: number;
  reason: string;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  content?: string;
  imageUrl?: string;
  audience: "all" | "admins" | "users" | "specific";
  accountStatus: "all" | "active" | "inactive";
  verification: "all" | "verified" | "unverified";
  recipientEmails?: string[];
  sendViaEmail: boolean;
  sendViaPush: boolean;
}

export type BroadcastTarget = Pick<
  BroadcastPayload,
  "audience" | "accountStatus" | "verification" | "recipientEmails"
>;

export interface BroadcastResult {
  id: string;
  success: boolean;
  sent: boolean;
  message: string;
  totalSent: number;
  details: { emailSent: number; pushSent: number; pushFailed: number };
}

export interface ProviderStatusPayload {
  status: "Active" | "Degraded" | "Offline";
}

export interface CommunityStatusPayload {
  status: "Approved" | "Pending";
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  identifier: string; // email or phone number
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email?: string;
      phone?: string;
      name?: string;
      role?: string;
    };
  };
}

interface RawLoginResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  error?: string;
  statusCode?: number;
  data?: {
    token?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email?: string;
      phone?: string;
      name?: string;
      role?: string;
    };
  };
}

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "adminUser";
const AUTH_REFRESH_TOKEN_KEY = "refreshToken";

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function persistLoginSession(response: LoginResponse): void {
  if (typeof window === "undefined") return;

  const token = response?.data?.token;
  const refreshToken = response?.data?.refreshToken;
  const user = response?.data?.user;

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (refreshToken) {
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (typeof window !== "undefined") {
    const token = getStoredAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function request<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${path}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  } catch (error) {
    throw error;
  }
}

export async function login(identifier: string, password: string): Promise<LoginResponse> {
  const validationError = validateLoginInput(identifier, password);
  if (validationError) {
    throw new Error(validationError);
  }

  const payload: LoginRequest = {
    identifier: identifier.trim(),
    password: password.trim(),
  };

  try {
    const response = await request<RawLoginResponse>(
      "/auth/login",
      "POST",
      payload,
    );

    const token = response?.accessToken ?? response?.token ?? response?.data?.token;
    const refreshToken = response?.refreshToken ?? response?.data?.refreshToken;
    const normalizedResponse: LoginResponse = {
      success: response?.success ?? true,
      message: response?.message ?? "Login successful.",
      data: {
        token,
        refreshToken,
        user: response?.data?.user,
      },
    };

    if (!normalizedResponse.success) {
      throw new Error(normalizedResponse.message || "Login failed. Please check your credentials.");
    }

    if (normalizedResponse.data?.token) {
      persistLoginSession(normalizedResponse);
    }

    return normalizedResponse;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch") || error.name === "TypeError") {
        throw new Error("Unable to reach the login server. Please check the backend URL or your internet connection.");
      }
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        throw new Error("Invalid email/phone or password. Please try again.");
      }
      if (error.message.includes("404")) {
        throw new Error("User account not found. Please check your email or phone number.");
      }
      if (error.message.includes("429")) {
        throw new Error("Too many login attempts. Please try again later.");
      }
      throw error;
    }
    throw new Error("Login failed. Please check your connection and try again.");
  }
}

export async function fetchAdminDashboard(): Promise<DashboardMetrics> {
  const backendData = await request<BackendDashboardResponse>(
    "/admin/dashboard",
    "GET",
    undefined,
  );

  const transformed: DashboardMetrics = {
    totalUsers: backendData.users.total,
    activeUsers: backendData.users.active,
    inactiveUsers: backendData.users.inactive,
    totalMetersLinked: backendData.vending.total,
    totalWalletBalance: backendData.finance.totalWalletBalance,
    totalRechargesToday: backendData.transactions.today,
    pendingTransactions: backendData.vending.pending,
    failedTransactions: backendData.vending.failed,
    rechargeVolume: {
      success: backendData.vending.successful,
      pending: backendData.vending.pending,
      failed: backendData.vending.failed,
    },
    recentTransactions: (backendData as any)?.recentTransactions?.map((item: any) => ({
      id: String(item.id ?? "txn-unknown"),
      name: String(item.name ?? "Unknown User"),
      amount: Number(item.amount ?? 0),
      status: String(item.status ?? "Pending"),
      time: String(item.time ?? item.timeAgo ?? "Now"),
      timeAgo: String(item.timeAgo ?? item.time ?? "Now"),
    })) ?? [],
  };

  return transformed;
}

export async function fetchAdminOverview(): Promise<OverviewSummary[]> {
  const dashboard = await fetchAdminDashboard();

  return [
    {
      title: "Total Users",
      value: dashboard.totalUsers.toLocaleString(),
      change: "+0%",
      positive: true,
    },
    {
      title: "Active Users",
      value: dashboard.activeUsers.toLocaleString(),
      change: "+0%",
      positive: true,
    },
    {
      title: "Total Meters Linked",
      value: dashboard.totalMetersLinked.toLocaleString(),
      change: "+0%",
      positive: true,
    },
    {
      title: "Total Wallet Balance",
      value: `₦${dashboard.totalWalletBalance.toLocaleString()}`,
      change: "+0%",
      positive: true,
    },
    {
      title: "Total Recharges Today",
      value: dashboard.totalRechargesToday.toLocaleString(),
      change: "+0%",
      positive: dashboard.totalRechargesToday > 0,
    },
    {
      title: "Pending Transactions",
      value: dashboard.pendingTransactions.toLocaleString(),
      change: "+0%",
      positive: false,
    },
    {
      title: "Failed Transactions",
      value: dashboard.failedTransactions.toLocaleString(),
      change: "+0%",
      positive: false,
    },
  ];
}

export async function fetchAdminUsers(): Promise<PlatformUser[]> {
  const backendUsers = await request<BackendUserResponse[]>(
    "/admin/users",
    "GET",
    undefined,
  );

  return backendUsers.map((user) => ({
    id: user.id,
    name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
    email: user.email,
    phone: user.phone || "",
    meterCount: user._count.meters,
    walletBalance: user.wallet.balance,
    status: user.isActive ? "Active" : "Inactive",
    dateJoined: new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    role: user.role === "ADMIN" ? "Admin" : user.role === "SUPPORT" ? "Support" : "Customer",
    walletLocked: user.wallet.locked,
    isActive: user.isActive,
  }));
}

export async function fetchAdminUserById(userId: string): Promise<PlatformUser | undefined> {
  const backendUser = await request<BackendUserResponse>(
    `/admin/users/${userId}`,
    "GET",
    undefined,
  );

  if (!backendUser) return undefined;

  return {
    id: backendUser.id,
    name: backendUser.fullName || `${backendUser.firstName || ""} ${backendUser.lastName || ""}`.trim() || "Unknown",
    email: backendUser.email,
    phone: backendUser.phone || "",
    meterCount: backendUser._count.meters,
    walletBalance: backendUser.wallet.balance,
    status: backendUser.isActive ? "Active" : "Inactive",
    dateJoined: new Date(backendUser.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    role: backendUser.role === "ADMIN" ? "Admin" : backendUser.role === "SUPPORT" ? "Support" : "Customer",
    walletLocked: backendUser.wallet.locked,
    isActive: backendUser.isActive,
  };
}

export async function deleteAdminUser(userId: string): Promise<boolean> {
  const result = await request<{ success: boolean }>(
    `/admin/users/${userId}`,
    "DELETE",
    undefined,
  );

  return Boolean(result.success);
}

export async function updateUserRole(userId: string, payload: UserRolePayload): Promise<PlatformUser | undefined> {
  return request<PlatformUser>(
    `/admin/users/${userId}/role`,
    "PATCH",
    payload,
  );
}

export async function toggleUserLock(userId: string, locked: boolean): Promise<PlatformUser | undefined> {
  return request<PlatformUser>(
    `/admin/users/${userId}/lock`,
    "PATCH",
    { locked },
  );
}

export async function toggleUserActive(userId: string, isActive: boolean): Promise<PlatformUser | undefined> {
  return request<PlatformUser>(
    `/admin/users/${userId}/active`,
    "PATCH",
    { active: isActive },
  );
}

export async function toggleWalletLock(userId: string, isLocked: boolean): Promise<PlatformUser | undefined> {
  return request<PlatformUser>(
    `/admin/users/${userId}/wallet/lock`,
    "PATCH",
    { locked: isLocked },
  );
}

export async function adjustWalletBalance(userId: string, payload: WalletAdjustment): Promise<PlatformUser | undefined> {
  return request<PlatformUser>(
    `/admin/users/${userId}/wallet/adjust`,
    "POST",
    payload,
  );
}

export async function fetchAdminTransactions(userId?: string): Promise<Transaction[]> {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";

  try {
    const raw = await request<unknown>(`/admin/transactions${query}`, "GET", undefined);
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown[] })?.data)
        ? (raw as { data: unknown[] }).data
        : [];

    return items.map((item, index) => {
      const record = (item ?? {}) as Record<string, unknown>;
      const transactionType = String(record.type ?? record.transactionType ?? "Top-Up");
      const transactionStatus = String(record.status ?? record.state ?? "Pending");
      const name = String(record.name ?? record.userName ?? record.customerName ?? record.fullName ?? "Unknown User");
      const provider = String(record.provider ?? record.disco ?? record.vendor ?? record.providerName ?? "N/A");
      const amount = Number(record.amount ?? record.total ?? record.value ?? 0);
      const dateValue = String(record.date ?? record.createdAt ?? new Date().toISOString());
      const parsedDate = new Date(dateValue);

      return {
        id: String(record.id ?? `txn-${index + 1}`),
        transactionId: String(record.transactionId ?? record.reference ?? record.ref ?? `TXN-${index + 1}`),
        name,
        amount: Number.isFinite(amount) ? amount : 0,
        type: ["Top-Up", "Purchase", "Transfer", "Refund"].includes(transactionType)
          ? (transactionType as Transaction["type"])
          : "Top-Up",
        provider,
        status: ["Success", "Failed", "Pending"].includes(transactionStatus)
          ? (transactionStatus as Transaction["status"])
          : "Pending",
        date: Number.isNaN(parsedDate.getTime())
          ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: Number.isNaN(parsedDate.getTime())
          ? "N/A"
          : parsedDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      } satisfies Transaction;
    });
  } catch (error) {
    console.error("Failed to fetch transactions from backend:", error);
    return [];
  }
}

export async function fetchAdminVendorTransactions(status?: string, userId?: string): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (userId) params.set("userId", userId);

  const query = params.toString() ? `?${params.toString()}` : "";
  return request<Transaction[]>(`/admin/vendor-transactions${query}`, "GET", undefined);
}

export async function broadcastNotification(payload: BroadcastPayload): Promise<BroadcastResult> {
  return request<BroadcastResult>(
    "/admin/broadcast",
    "POST",
    payload,
  );
}

export async function previewBroadcastRecipients(target: BroadcastTarget): Promise<{ success: boolean; recipientCount: number }> {
  return request<{ success: boolean; recipientCount: number }>(
    "/admin/broadcast/preview",
    "POST",
    target,
  );
}

export async function fetchAdminProviders(): Promise<Provider[]> {
  return request<Provider[]>("/admin/providers", "GET", undefined);
}

export async function fetchProviderReliabilityIndex(): Promise<ProviderReliability[]> {
  const response = await request<{
    status: string;
    message: string;
    data: ProviderReliability[];
  }>("/vend/providers/reliability-index", "GET", undefined);

  return Array.isArray(response?.data) ? response.data : [];
}

export async function toggleProviderStatus(providerId: string, status: ProviderStatusPayload["status"]): Promise<Provider | undefined> {
  return request<Provider>(
    `/admin/providers/${providerId}/status`,
    "PATCH",
    { status },
  );
}

export async function syncProvider(providerId: string): Promise<Provider | undefined> {
  return request<Provider>(
    `/admin/providers/${providerId}/sync`,
    "POST",
    undefined,
  );
}

export async function createProvider(payload: Omit<Provider, "id" | "lastSync">): Promise<Provider> {
  return request<Provider>(
    "/admin/providers",
    "POST",
    payload,
  );
}

export async function fetchAdminCommunities(): Promise<Community[]> {
  const response = await request<{
    success: boolean;
    data?: any[];
    stats?: any;
    meta?: any;
  }>("/admin/communities", "GET", undefined);

  const communities = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

  return communities.map((community) => normalizeCommunity(community));
}

export async function fetchAdminCommunityPosts(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: CommunityPostCategory | "ALL";
  reportedOnly?: boolean;
} = {}): Promise<AdminCommunityPostsResponse> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 1));
  params.set("limit", String(options.limit ?? 20));
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.category && options.category !== "ALL") params.set("category", options.category);
  if (options.reportedOnly) params.set("reportedOnly", "true");
  try {
    return await request<AdminCommunityPostsResponse>(`/admin/community-posts?${params.toString()}`, "GET", undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/404|Cannot GET \/admin\/community-posts|Not Found/i.test(message)) throw error;

    const legacyParams = new URLSearchParams();
    legacyParams.set("page", String(options.page ?? 1));
    legacyParams.set("limit", String(options.limit ?? 20));
    if (options.search?.trim()) legacyParams.set("search", options.search.trim());
    if (options.category && options.category !== "ALL") legacyParams.set("category", options.category);
    const legacy = await request<{
      data?: Array<Record<string, any>>;
      meta?: AdminCommunityPostsResponse["meta"];
    }>(`/community/feed?${legacyParams.toString()}`, "GET", undefined);
    const legacyPosts = Array.isArray(legacy.data) ? legacy.data : [];
    const posts = options.reportedOnly ? [] : legacyPosts.map((post) => {
      const postCategory = String(post.community?.category ?? "GENERAL").toUpperCase() as CommunityPostCategory;
      return {
        id: String(post.id ?? ""),
        content: String(post.content ?? ""),
        images: Array.isArray(post.images) ? post.images.map(String) : [],
        location: post.location ?? null,
        createdAt: String(post.createdAt ?? new Date().toISOString()),
        category: postCategory,
        community: {
          id: String(post.community?.id ?? ""),
          name: String(post.community?.name ?? "Community"),
          category: postCategory,
        },
        author: {
          id: String(post.author?.id ?? ""),
          fullName: String(post.author?.fullName ?? "User"),
          email: String(post.author?.email ?? ""),
        },
        tags: Array.isArray(post.tags) ? post.tags.map(String) : [],
        commentsCount: Number(post.commentsCount ?? post.comments ?? 0),
        likesCount: Number(post.likesCount ?? post.likes ?? 0),
        likedByMe: Boolean(post.likedByMe ?? post.isLiked),
        repostsCount: Number(post.repostsCount ?? post.reposts ?? 0),
        viewsCount: Number(post.viewsCount ?? post.views ?? 0),
        reportCount: 0,
      } satisfies AdminCommunityPostsResponse["data"][number];
    });
    const meta = legacy.meta ?? {
      total: posts.length,
      page: options.page ?? 1,
      limit: options.limit ?? 20,
      totalPages: 1,
      hasNextPage: false,
    };
    return {
      success: true,
      data: posts,
      stats: {
        totalPosts: meta.total,
        reportedPosts: 0,
        pendingReports: 0,
        reportingAvailable: false,
      },
      meta,
    };
  }
}

export async function fetchAdminPostComments(postId: string): Promise<AdminCommunityComment[]> {
  const response = await request<{
    success: boolean;
    data?: { items?: Array<Record<string, any>> };
  }>(`/community/posts/${encodeURIComponent(postId)}/comments?limit=50`, "GET", undefined);
  const mapComment = (comment: Record<string, any>): AdminCommunityComment => ({
    id: String(comment.id ?? ""),
    parentId: comment.parentId ? String(comment.parentId) : null,
    content: String(comment.content ?? ""),
    createdAt: String(comment.createdAt ?? new Date().toISOString()),
    author: {
      id: String(comment.author?.id ?? ""),
      fullName: String(comment.author?.fullName ?? "User"),
      username: comment.author?.username ?? null,
      avatar: comment.author?.avatar ?? null,
    },
    commentsCount: Number(comment.commentsCount ?? comment.comments ?? 0),
    likesCount: Number(comment.likesCount ?? comment.likes ?? 0),
    likedByMe: Boolean(comment.likedByMe ?? comment.isLiked),
    replies: Array.isArray(comment.replies) ? comment.replies.map(mapComment) : [],
  });
  return Array.isArray(response.data?.items) ? response.data.items.map(mapComment) : [];
}

export async function createAdminPostComment(
  postId: string,
  payload: { content: string; parentId?: string },
): Promise<{ success: boolean; data?: unknown }> {
  return request(`/community/posts/${encodeURIComponent(postId)}/comments`, "POST", {
    ...payload,
    images: [],
  });
}

export async function toggleAdminPostLike(postId: string): Promise<{ success: boolean; liked: boolean; message?: string }> {
  return request(`/community/posts/${encodeURIComponent(postId)}/like`, "POST", undefined);
}

export async function createAdminCategoryPost(payload: {
  category: CommunityPostCategory;
  content: string;
  tags?: string[];
  images?: string[];
  location?: string;
}): Promise<{ success: boolean; data: AdminCommunityPostsResponse["data"][number] }> {
  try {
    return await request("/admin/community-posts", "POST", payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/404|Cannot POST \/admin\/community-posts|Not Found/i.test(message)) throw error;

    const communities = await fetchAdminCommunities();
    const categoryBuckets: Record<CommunityPostCategory, { handle: string; name: string }> = {
      OUTAGES: { handle: "power-outage", name: "Power outages" },
      TIPS: { handle: "energy-saving-tips", name: "Energy saving tips" },
      NEWS: { handle: "electricity-news", name: "Energy news" },
      GENERAL: { handle: "general", name: "General" },
    };
    let community = communities.find((item) =>
      item.category?.toUpperCase() === payload.category || item.handle === categoryBuckets[payload.category].handle,
    );
    if (!community) {
      community = await createCommunity({
        name: categoryBuckets[payload.category].name,
        handle: categoryBuckets[payload.category].handle,
        description: `${categoryBuckets[payload.category].name} posts`,
        area: "Nigeria",
        state: "National",
        category: payload.category,
        isPublic: true,
        createdBy: "Admin",
        status: "Active",
      });
    }

    return createAdminCommunityPost(community.id, {
      content: payload.content,
      tags: payload.tags,
      images: payload.images,
      location: payload.location,
      isDraft: false,
    }) as Promise<{ success: boolean; data: AdminCommunityPostsResponse["data"][number] }>;
  }
}

export async function deleteAdminCommunityPost(postId: string): Promise<{ success: boolean; message?: string }> {
  try {
    return await request(`/admin/community-posts/${encodeURIComponent(postId)}`, "DELETE", undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/404|Cannot DELETE \/admin\/community-posts|Not Found/i.test(message)) throw error;
    return request(`/community/posts/${encodeURIComponent(postId)}`, "DELETE", undefined);
  }
}

export async function moderateAdminCommunityPost(
  postId: string,
  action: "dismiss" | "remove",
): Promise<{ success: boolean; action: string; reportsUpdated?: number; message?: string }> {
  return request(`/admin/community-posts/${encodeURIComponent(postId)}/reports`, "PATCH", { action });
}

export async function createCommunity(payload: CommunityCreatePayload): Promise<Community> {
  const requestBody = {
    name: payload.name,
    handle: payload.handle ?? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: payload.description ?? `${payload.name} community`,
    tagline: payload.tagline ?? "",
    mission: payload.mission ?? "",
    founderName: payload.founderName ?? "",
    phone: payload.phone ?? "",
    email: payload.email ?? "",
    area: payload.area ?? "N/A",
    state: payload.state ?? "N/A",
    category: payload.category ?? "GENERAL",
    isPublic: payload.isPublic ?? true,
    coverImage: payload.coverImage ?? payload.profileImage ?? "",
    avatar: payload.avatar ?? payload.profileImage ?? "",
    avatarColor: payload.avatarColor ?? "#FF7A00",
    createdBy: payload.createdBy ?? "User",
    members: payload.members ?? 0,
    status: payload.status ?? "Pending",
  };

  const result = await request<{
    success: boolean;
    message: string;
    data?: BackendCommunity;
  }>(
    "/admin/communities",
    "POST",
    requestBody,
  );

  return normalizeCommunity(result?.data ?? { ...requestBody, id: `c${Date.now()}`, createdAt: new Date().toISOString() });
}

export async function updateCommunityStatus(communityId: string, status: string): Promise<Community | undefined> {
  // Map frontend status to backend status
  const backendStatus = status === 'Approved' ? 'Active' : status === 'Pending' ? 'Pending' : 'Suspended';
  
  const result = await request<{ success: boolean; data?: BackendCommunity }>(
    `/admin/communities/${communityId}/status`,
    "PATCH",
    { status: backendStatus },
  );

  return normalizeCommunity(result?.data ?? { id: communityId, name: "Community", status: backendStatus, createdBy: "User", members: 0, createdAt: new Date().toISOString() });
}

export async function deleteCommunity(communityId: string): Promise<boolean> {
  try {
    const result = await request<{ success: boolean; message?: string }>(
      `/admin/communities/${communityId}`,
      "DELETE",
      undefined,
    );

    return Boolean(result?.success);
  } catch (error) {
    console.error('Error deleting community:', error);
    throw error;
  }
}

export async function updateAdminPassword(payload: PasswordChangePayload): Promise<{ success: true }> {
  return request<{ success: true }>(
    "/admin/settings/password",
    "PATCH",
    payload,
  );
}

export function validateLoginInput(identifier: string, password: string): string | null {
  identifier = identifier.trim();
  password = password.trim();

  if (!identifier) {
    return "Email or phone number is required";
  }

  if (!password) {
    return "Password is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const isValidIdentifier = emailRegex.test(identifier) || phoneRegex.test(identifier);

  if (!isValidIdentifier) {
    return "Please enter a valid email address or phone number (e.g., example@email.com or +2347012345678)";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  return null;
}

export interface InformationItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  category: string;
  isPublished: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface AdminTicket {
  id: string;
  ticketNo: string;
  title: string;
  description: string;
  category: string;
  status: "OPEN" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  messages?: Array<{
    id: string;
    message: string;
    senderRole: string;
    createdAt: string;
  }>;
  _count?: {
    messages: number;
  };
}

export async function fetchAdminInformation(category?: string): Promise<InformationItem[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);

  const query = params.toString() ? `?${params.toString()}` : "";
  const raw = await request<{ data?: unknown[]; success?: boolean }>(
    `/information/admin/all${query}`,
    "GET",
    undefined,
  );

  const items = Array.isArray(raw?.data) ? raw.data : [];
  return (items as Record<string, unknown>[]).map((item) => ({
    id: String(item.id ?? ""),
    title: String(item.title ?? "Untitled"),
    content: String(item.content ?? ""),
    imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
    videoUrl: item.videoUrl ? String(item.videoUrl) : undefined,
    category: String(item.category ?? "GENERAL"),
    isPublished: Boolean(item.isPublished ?? true),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    createdBy: item.createdBy ? String(item.createdBy) : undefined,
  }));
}

export async function createAdminInformation(payload: {
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  category?: string;
  isPublished?: boolean;
}): Promise<InformationItem> {
  const result = await request<{ data?: InformationItem }>(
    "/information/admin",
    "POST",
    payload,
  );

  return result?.data ?? {
    id: `info-${Date.now()}`,
    title: payload.title,
    content: payload.content,
    imageUrl: payload.imageUrl,
    videoUrl: payload.videoUrl,
    category: payload.category ?? "GENERAL",
    isPublished: payload.isPublished ?? true,
    createdAt: new Date().toISOString(),
  };
}

export async function updateAdminInformation(
  id: string,
  payload: Partial<{ title: string; content: string; imageUrl: string; videoUrl: string; category: string; isPublished: boolean }>,
): Promise<InformationItem> {
  const result = await request<{ data?: InformationItem }>(
    `/information/admin/${id}`,
    "PATCH",
    payload,
  );

  return result?.data ?? {
    id,
    title: payload.title ?? "Updated information",
    content: payload.content ?? "",
    imageUrl: payload.imageUrl,
    videoUrl: payload.videoUrl,
    category: payload.category ?? "GENERAL",
    isPublished: payload.isPublished ?? true,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteAdminInformation(id: string): Promise<boolean> {
  const result = await request<{ success?: boolean }>(
    `/information/admin/${id}`,
    "DELETE",
    undefined,
  );

  return Boolean(result?.success);
}

export async function fetchAdminTickets(status?: string, category?: string): Promise<AdminTicket[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (category) params.set("category", category);

  const query = params.toString() ? `?${params.toString()}` : "";
  const raw = await request<{ data?: unknown[]; success?: boolean }>(
    `/tickets/admin/all${query}`,
    "GET",
    undefined,
  );

  const items = Array.isArray(raw?.data) ? raw.data : [];
  return (items as Record<string, unknown>[]).map((item) => ({
    id: String(item.id ?? ""),
    ticketNo: String(item.ticketNo ?? "TKT-000000"),
    title: String(item.title ?? "Ticket"),
    description: String(item.description ?? ""),
    category: String(item.category ?? "GENERAL"),
    status: (String(item.status ?? "OPEN") as AdminTicket["status"]),
    priority: (String(item.priority ?? "MEDIUM") as AdminTicket["priority"]),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(item.updatedAt ?? new Date().toISOString()),
    user: item.user as AdminTicket["user"],
    messages: (item.messages as AdminTicket["messages"]) ?? [],
    _count: (item._count as AdminTicket["_count"]) ?? { messages: 0 },
  }));
}

export async function updateAdminTicketStatus(
  ticketId: string,
  status: AdminTicket["status"],
): Promise<AdminTicket> {
  const result = await request<{ data?: AdminTicket }>(
    `/tickets/admin/${ticketId}/status`,
    "PATCH",
    { status },
  );

  return result?.data ?? {
    id: ticketId,
    ticketNo: "TKT-000000",
    title: "Ticket",
    description: "",
    category: "GENERAL",
    status,
    priority: "MEDIUM",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function replyToAdminTicket(
  ticketId: string,
  message: string,
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(
    `/tickets/admin/${ticketId}/reply`,
    "POST",
    { message },
  );
}

export async function createCommunityPost(
  communityId: string,
  payload: {
    content: string;
    location?: string;
    images?: string[];
    videos?: string[];
    tags?: string[];
    isDraft?: boolean;
  },
): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const result = await request<{ success: boolean; data?: unknown; message?: string }>(
      `/community/${communityId}/posts`,
      "POST",
      payload,
    );
    return result;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
}

export async function createAdminCommunityPost(
  communityId: string,
  payload: {
    content: string;
    location?: string;
    images?: string[];
    videos?: string[];
    tags?: string[];
    isDraft?: boolean;
  },
): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const result = await request<{ success: boolean; data?: unknown; message?: string }>(
      `/admin/communities/${communityId}/posts`,
      "POST",
      payload,
    );
    return result;
  } catch (error) {
    console.error('Error creating admin community post:', error);
    throw error;
  }
}

export async function fetchCommunityFeed(): Promise<any[]> {
  const raw = await request<{ data?: unknown[] }>("/community/feed?limit=10", "GET", undefined);
  return Array.isArray(raw?.data) ? (raw.data as any[]) : [];
}
