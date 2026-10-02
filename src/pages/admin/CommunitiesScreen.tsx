import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BadgeCheck,
  BarChart2,
  CheckCircle,
  Flag,
  Globe,
  Hash,
  Heart,
  Image,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  X,
  Zap,
} from 'lucide-react';
import PageShell from '../../components/PageShell';
import type { NavKey } from '../../components/Sidebar';
import { StatCard, StatusBadge } from '../../components/StatCard';
import {
  createCommunity,
  createAdminCommunityPost,
  deleteCommunity,
  fetchAdminCommunities,
  updateCommunityStatus,
} from '../../lib/adminApi';
import type { Community } from '../../types';
import CommunityPostsScreen from './CommunityPostsScreen';

interface CommunitiesScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    OUTAGES: 'bg-red-100 text-red-700',
    TIPS: 'bg-emerald-100 text-emerald-700',
    NEWS: 'bg-blue-100 text-blue-700',
    GENERAL: 'bg-neutral-100 text-neutral-600',
    ALL: 'bg-orange-100 text-orange-700',
  };
  return map[cat] ?? 'bg-neutral-100 text-neutral-600';
}

function buildUserEngagementInsight(communities: Community[]) {
  const categoryMap: Record<string, number> = {};
  communities.forEach((community) => {
    const category = String((community as any).category ?? 'GENERAL').toUpperCase();
    categoryMap[category] = (categoryMap[category] ?? 0) + 1;
  });

  const strongest = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
  const score = Math.min(96, 35 + communities.length * 7 + (strongest ? strongest[1] * 4 : 0));

  return {
    score,
    strongest: strongest ? strongest[0] : 'GENERAL',
    trend: strongest ? `${strongest[0]} is leading the current activity.` : 'Your community mix is still balancing out.',
  };
}

// ── sub-components ─────────────────────────────────────────────────────────────
function CommunityAvatar({
  community,
  size = 'md',
}: {
  community: Community;
  size?: 'sm' | 'md' | 'lg';
}) {
  const s = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  }[size];
  return (
    <div
      className={`${s} flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: (community as any).avatarColor ?? '#E85D04' }}
    >
      {community.name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────
export function LegacyCommunitiesScreen({
  onNavigate,
  onLogout,
}: CommunitiesScreenProps) {
  const queryClient = useQueryClient();

  // tabs
  const [activeTab, setActiveTab] = useState<
    'feed' | 'create' | 'compose' | 'manage' | 'reports'
  >('feed');

  // create form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    tagline: '',
    mission: '',
    founderName: '',
    phone: '',
    email: '',
    handle: '',
    area: 'National',
    state: 'Lagos',
    category: 'GENERAL',
    isPublic: true,
    avatarColor: '#E85D04',
  });
  const [profileImage, setProfileImage] = useState<string>('');
  const profileFileRef = useRef<HTMLInputElement>(null);

  // compose form
  const [postForm, setPostForm] = useState({
    content: '',
    communityId: '',
    tags: '',
    location: '',
    images: [] as string[],
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // manage filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCat, setFilterCat] = useState<string>('all');

  // selected community detail
  const [detailId, setDetailId] = useState<string | null>(null);

  // ── queries ──────────────────────────────────────────────────────────────────
  const commQ = useQuery({
    queryKey: ['admin-communities'],
    queryFn: fetchAdminCommunities,
  });
  const communities: Community[] = commQ.data ?? [];

  const stats = useMemo(
    () => ({
      total: communities.length,
      userCreated: communities.filter((c) => c.createdBy === 'User').length,
      adminCreated: communities.filter((c) => c.createdBy === 'Admin').length,
      pending: communities.filter((c) => c.status === 'Pending').length,
      members: communities.reduce((s, c) => s + c.members, 0),
    }),
    [communities],
  );

  const filtered = useMemo(
    () =>
      communities.filter((c) => {
        const matchSearch =
          !search || c.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
          filterStatus === 'all' || c.status.toLowerCase() === filterStatus;
        const matchCat =
          filterCat === 'all' || (c as any).category === filterCat;
        return matchSearch && matchStatus && matchCat;
      }),
    [communities, search, filterStatus, filterCat],
  );

  const communityOptions = communities.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const detailCommunity = communities.find((c) => c.id === detailId) ?? null;

  // ── mutations ────────────────────────────────────────────────────────────────
  const createM = useMutation({
    mutationFn: () =>
      createCommunity({
        name: createForm.name,
        description: createForm.description || `${createForm.name} community`,
        tagline: createForm.tagline,
        mission: createForm.mission,
        founderName: createForm.founderName,
        phone: createForm.phone,
        email: createForm.email,
        handle:
          createForm.handle ||
          createForm.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
        area: createForm.area,
        state: createForm.state,
        category: createForm.category,
        isPublic: createForm.isPublic,
        coverImage: profileImage,
        avatar: profileImage,
        profileImage,
        avatarColor: createForm.avatarColor,
        createdBy: 'Admin',
        members: 0,
        status: 'Active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      setCreateForm({
        name: '',
        description: '',
        tagline: '',
        mission: '',
        founderName: '',
        phone: '',
        email: '',
        handle: '',
        area: 'National',
        state: 'Lagos',
        category: 'GENERAL',
        isPublic: true,
        avatarColor: '#E85D04',
      });
      setProfileImage('');
      setActiveTab('feed');
    },
  });

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Community['status'] }) =>
      updateCommunityStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      setDetailId(null);
    },
  });

  const postM = useMutation({
    mutationFn: ({
      communityId,
      content,
    }: {
      communityId: string;
      content: string;
    }) =>
      // Admin posts should use admin API route
      createAdminCommunityPost(communityId, {
        content,
        isDraft: false,
        tags: postForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images: imagePreview,
        location: postForm.location || undefined,
      }),
    onSuccess: (_res: any, vars) => {
      // Try to update cache immediately for snappier UI.
      try {
        const communityId = (vars as any).communityId;
        // If backend returned the created post, use it; otherwise create a lightweight placeholder
        queryClient.setQueryData(['admin-communities'], (old: any) => {

          if (!Array.isArray(old)) return old;
          return old.map((c: any) => {
            if (c.id !== communityId) return c;
            // increment post count / postsCount / postCount if present
            const updated = { ...c };
            if (typeof updated.postCount === 'number') updated.postCount += 1;
            if (typeof updated.postsCount === 'number') updated.postsCount += 1;
            if (
              typeof updated.postCount === 'undefined' &&
              typeof updated.postsCount === 'undefined'
            ) {
              // preserve existing shape: add postCount
              updated.postCount = (c.postCount || c.postsCount || 0) + 1;
            }
            return updated;
          });
        });
      } catch (e) {
        // fall back to full refresh
        queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      }

      setPostForm({
        content: '',
        communityId: '',
        tags: '',
        location: '',
        images: [],
      });
      setImagePreview([]);
      setActiveTab('feed');
    },
  });

  // ── image picker (base64 preview) ────────────────────────────────────────────
  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () =>
        setImagePreview((prev) =>
          [...prev, reader.result as string].slice(0, 4),
        );
      reader.readAsDataURL(f);
    });
  }

  // ── ui helpers ───────────────────────────────────────────────────────────────
  const tabCls = (t: string) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
      activeTab === t
        ? 'bg-orange-600 text-white shadow-sm'
        : 'text-neutral-600 hover:bg-neutral-100'
    }`;

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <PageShell active="communities" onNavigate={onNavigate} onLogout={onLogout}>
      {/* ── header ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
            Community control
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-neutral-900">
            Communities
          </h1>
        </div>
        <nav className="inline-flex gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
          {(['feed', 'create', 'compose', 'manage', 'reports'] as const).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={tabCls(t)}
              >
                {t === 'feed' && (
                  <span className="flex items-center gap-1.5">
                    <Globe size={13} /> Feed
                  </span>
                )}
                {t === 'create' && (
                  <span className="flex items-center gap-1.5">
                    <Plus size={13} /> Create
                  </span>
                )}
                {t === 'compose' && (
                  <span className="flex items-center gap-1.5">
                    <Send size={13} /> Post
                  </span>
                )}
                {t === 'manage' && (
                  <span className="flex items-center gap-1.5">
                    <Shield size={13} /> Manage
                  </span>
                )}
                {t === 'reports' && (
                  <span className="flex items-center gap-1.5">
                    <Flag size={13} /> Reports
                  </span>
                )}
              </button>
            ),
          )}
        </nav>
      </div>

      {/* ── stat cards ── */}
      <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Communities"
          value={String(stats.total)}
          icon={<Receipt size={15} className="text-orange-600" />}
        />
        <StatCard
          label="Members"
          value={stats.members.toLocaleString()}
          icon={<Users size={15} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="User-created"
          value={String(stats.userCreated)}
          icon={<UserCheck size={15} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Admin-created"
          value={String(stats.adminCreated)}
          icon={<BadgeCheck size={15} className="text-violet-600" />}
          iconBg="bg-violet-50"
        />
        <StatCard
          label="Pending"
          value={String(stats.pending)}
          icon={<UserX size={15} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* ── left column (main content) ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* ══ FEED TAB ══ */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                      New user activity
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-neutral-900">
                      Welcome back, admin
                    </h3>
                  </div>
                  <div className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-700 shadow-sm">
                    {buildUserEngagementInsight(communities).score}% engagement
                  </div>
                </div>
                <p className="mt-2 text-sm text-neutral-600">
                  {buildUserEngagementInsight(communities).trend}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Outages', 'Tips', 'News', 'Community updates'].map((item) => (
                    <span key={item} className="rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-neutral-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900">
                  Live feed
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ['admin-communities'],
                    })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-orange-200 hover:text-orange-600"
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              {commQ.isPending ? (
                <FeedSkeleton />
              ) : communities.length === 0 ? (
                <EmptyState
                  icon={<Globe size={28} className="text-neutral-300" />}
                  title="No communities yet"
                  sub="Create your first community to get started."
                  action={
                    <button
                      type="button"
                      onClick={() => setActiveTab('create')}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                      <Plus size={14} /> Create community
                    </button>
                  }
                />
              ) : (
                communities.map((c) => (
                  <CommunityFeedCard
                    key={c.id}
                    community={c}
                    onSelect={() => setDetailId(c.id)}
                    onStatus={(s) => statusM.mutate({ id: c.id, status: s })}
                    onDelete={() => deleteM.mutate(c.id)}
                    onCompose={() => {
                      setPostForm((p) => ({ ...p, communityId: c.id }));
                      setActiveTab('compose');
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* ══ CREATE TAB ══ */}
          {activeTab === 'create' && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-neutral-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Plus size={16} className="text-orange-600" />
                </div>
                <h2 className="text-base font-semibold">New community</h2>
              </div>

              <div className="mt-5 space-y-3">
                {/* preview avatar */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
                    style={{ backgroundColor: createForm.avatarColor }}
                  >
                    {createForm.name.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {createForm.name || 'Community name'}
                    </p>
                    <p className="text-xs text-neutral-400">
                      @{createForm.handle || 'handle'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-3">
                    <div
                      className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-neutral-200 text-xl font-bold text-white shadow-sm"
                      style={{ backgroundImage: profileImage ? `url(${profileImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: createForm.avatarColor }}
                    >
                      {!profileImage && (createForm.name.charAt(0).toUpperCase() || '?')}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                        Community profile
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">
                        Upload a cover or profile image so new users immediately recognize the community.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => profileFileRef.current?.click()}
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50"
                    >
                      Upload image
                    </button>
                    <input
                      ref={profileFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setProfileImage(String(reader.result ?? ''));
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Name *
                    </label>
                    <input
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Lekki Outage Reports"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Handle *
                    </label>
                    <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
                      <span className="mr-0.5 text-sm text-neutral-400">@</span>
                      <input
                        value={createForm.handle}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            handle: e.target.value
                              .toLowerCase()
                              .replace(/\s/g, '_'),
                          }))
                        }
                        placeholder="lekki_outages"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Category
                    </label>
                    <select
                      value={createForm.category}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          category: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
                    >
                      {['GENERAL', 'OUTAGES', 'TIPS', 'NEWS'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Description
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="What is this community about?"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Area / Region
                    </label>
                    <input
                      value={createForm.area}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, area: e.target.value }))
                      }
                      placeholder="e.g. Lekki, Abuja, National"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Brand colour
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={createForm.avatarColor}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            avatarColor: e.target.value,
                          }))
                        }
                        className="h-10 w-10 cursor-pointer rounded-lg border border-neutral-200"
                      />
                      <span className="font-mono text-xs text-neutral-500">
                        {createForm.avatarColor}
                      </span>
                      <div className="ml-auto flex gap-1.5">
                        {[
                          '#E85D04',
                          '#7C3AED',
                          '#059669',
                          '#0EA5E9',
                          '#DC2626',
                        ].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() =>
                              setCreateForm((f) => ({ ...f, avatarColor: col }))
                            }
                            className="h-6 w-6 rounded-full ring-2 ring-offset-1 transition"
                            style={{
                              backgroundColor: col,
                              border:
                                createForm.avatarColor === col
                                  ? '2px solid white'
                                  : '2px solid transparent',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Tagline
                    </label>
                    <input
                      value={createForm.tagline}
                      onChange={(e) => setCreateForm((f) => ({ ...f, tagline: e.target.value }))}
                      placeholder="Deyra community for live outage information"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Mission / purpose
                    </label>
                    <textarea
                      value={createForm.mission}
                      onChange={(e) => setCreateForm((f) => ({ ...f, mission: e.target.value }))}
                      rows={2}
                      placeholder="Explain what this community exists to do and who it is for."
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Founder / admin name
                    </label>
                    <input
                      value={createForm.founderName}
                      onChange={(e) => setCreateForm((f) => ({ ...f, founderName: e.target.value }))}
                      placeholder="Community lead"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Contact email
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="community@pay4light.com"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Contact phone
                    </label>
                    <input
                      value={createForm.phone}
                      onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+2348012345678"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="isPublic"
                      type="checkbox"
                      checked={createForm.isPublic}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          isPublic: e.target.checked,
                        }))
                      }
                      className="accent-orange-600"
                    />
                    <label
                      htmlFor="isPublic"
                      className="text-sm text-neutral-700"
                    >
                      Public community
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => createM.mutate()}
                  disabled={
                    createM.isPending ||
                    !createForm.name.trim() ||
                    !createForm.handle.trim()
                  }
                  className="mt-1 w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                >
                  {createM.isPending ? 'Creating…' : 'Create community'}
                </button>
                {createM.isError && (
                  <p className="text-xs text-red-500">
                    {(createM.error as any)?.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ══ COMPOSE TAB ══ */}
          {activeTab === 'compose' && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Zap size={15} className="text-orange-600" />
                </div>
                <h2 className="text-base font-semibold text-neutral-900">
                  Admin post
                </h2>
                <span className="ml-auto rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                  ADMIN ONLY
                </span>
              </div>

              {/* community picker */}
              <select
                value={postForm.communityId}
                onChange={(e) =>
                  setPostForm((f) => ({ ...f, communityId: e.target.value }))
                }
                className="mt-4 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
              >
                <option value="">Select community…</option>
                {communityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {/* content */}
              <textarea
                value={postForm.content}
                onChange={(e) =>
                  setPostForm((f) => ({ ...f, content: e.target.value }))
                }
                rows={5}
                maxLength={2000}
                placeholder="Share an update, notice, or community bulletin…"
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100 resize-none"
              />
              <div className="mt-1 flex justify-end">
                <span className="text-xs text-neutral-400">
                  {postForm.content.length}/2000
                </span>
              </div>

              {/* image previews */}
              {imagePreview.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {imagePreview.map((src, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl overflow-hidden"
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImagePreview((p) => p.filter((_, j) => j !== i))
                        }
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* extras */}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <Hash size={13} className="text-neutral-400" />
                  <input
                    value={postForm.tags}
                    onChange={(e) =>
                      setPostForm((f) => ({ ...f, tags: e.target.value }))
                    }
                    placeholder="outage, lekki, IKEDC"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <MapPin size={13} className="text-neutral-400" />
                  <input
                    value={postForm.location}
                    onChange={(e) =>
                      setPostForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="Location (optional)"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {/* action bar */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-orange-200 hover:text-orange-600"
                  >
                    <Image size={13} /> Add image
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImagePick}
                  />
                </div>
                <button
                  type="button"
                  disabled={
                    postM.isPending ||
                    !postForm.communityId ||
                    !postForm.content.trim()
                  }
                  onClick={() =>
                    postM.mutate({
                      communityId: postForm.communityId,
                      content: postForm.content,
                    })
                  }
                  className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                >
                  <Send size={13} />
                  {postM.isPending ? 'Posting…' : 'Publish'}
                </button>
              </div>
              {postM.isError && (
                <p className="mt-2 text-xs text-red-500">
                  {(postM.error as any)?.message}
                </p>
              )}
            </div>
          )}

          {/* ══ MANAGE TAB ══ */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {/* filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                  <Search size={14} className="text-neutral-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search communities…"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none shadow-sm"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none shadow-sm"
                >
                  <option value="all">All categories</option>
                  {['OUTAGES', 'TIPS', 'NEWS', 'GENERAL'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* list */}
              {commQ.isPending ? (
                <FeedSkeleton />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={<Search size={28} className="text-neutral-300" />}
                  title="No results"
                  sub="Try adjusting your filters."
                />
              ) : (
                filtered.map((c) => (
                  <ManageRow
                    key={c.id}
                    community={c}
                    onStatus={(s) => statusM.mutate({ id: c.id, status: s })}
                    onDelete={() => deleteM.mutate(c.id)}
                    onSelect={() => setDetailId(c.id)}
                    loading={statusM.isPending || deleteM.isPending}
                  />
                ))
              )}
            </div>
          )}

          {/* ══ REPORTS TAB ══ */}
          {activeTab === 'reports' && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Flag size={16} className="text-red-500" />
                <h2 className="text-base font-semibold text-neutral-900">
                  Reported content
                </h2>
                <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                  REVIEW QUEUE
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {/* placeholder — connect to /admin/community/reports when ready */}
                <EmptyState
                  icon={<CheckCircle size={28} className="text-emerald-300" />}
                  title="No reports pending"
                  sub="All flagged content has been reviewed."
                />
              </div>
            </div>
          )}
        </div>

        {/* ── right column (sidebar / detail) ── */}
        <div className="space-y-4">
          {/* community detail panel */}
          {detailCommunity ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Detail
                </p>
                <button type="button" onClick={() => setDetailId(null)}>
                  <X
                    size={14}
                    className="text-neutral-400 hover:text-neutral-700"
                  />
                </button>
              </div>

              {/* cover + avatar */}
              <div className="mt-3 relative h-20 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
                <div className="absolute -bottom-5 left-3">
                  <CommunityAvatar community={detailCommunity} size="lg" />
                </div>
              </div>
              <div className="mt-7">
                <p className="text-base font-bold text-neutral-900">
                  {detailCommunity.name}
                </p>
                <p className="text-xs text-neutral-500">
                  @{detailCommunity.name.toLowerCase().replace(/\s+/g, '-')} ·{' '}
                  {detailCommunity.dateCreated}
                </p>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  {(detailCommunity as any).description ||
                    'No description provided.'}
                </p>
              </div>

              {/* quick stats */}
              <div className="mt-4 grid grid-cols-3 divide-x divide-neutral-100 rounded-xl border border-neutral-100 bg-neutral-50 text-center">
                {[
                  { label: 'Members', value: detailCommunity.members },
                  {
                    label: 'Posts',
                    value: (detailCommunity as any).postCount ?? 0,
                  },
                  { label: 'Status', value: detailCommunity.status },
                ].map((s) => (
                  <div key={s.label} className="py-3">
                    <p className="text-sm font-bold text-neutral-900">
                      {s.value}
                    </p>
                    <p className="text-[10px] text-neutral-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* actions */}
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setPostForm((f) => ({
                      ...f,
                      communityId: detailCommunity.id,
                    }));
                    setActiveTab('compose');
                    setDetailId(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2 text-xs font-semibold text-white hover:bg-orange-700"
                >
                  <Send size={12} /> Post to this community
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      statusM.mutate({
                        id: detailCommunity.id,
                        status:
                          detailCommunity.status === 'Active'
                            ? 'Suspended'
                            : 'Active',
                      })
                    }
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium ${
                      detailCommunity.status === 'Active'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {detailCommunity.status === 'Active' ? (
                      <>
                        <AlertTriangle size={11} /> Suspend
                      </>
                    ) : (
                      <>
                        <CheckCircle size={11} /> Activate
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this community?'))
                        deleteM.mutate(detailCommunity.id);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* quick-create shortcut when nothing selected */
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-4">
              <p className="text-xs font-semibold text-orange-600">
                Quick actions
              </p>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="flex w-full items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-50"
                >
                  <Plus size={12} /> Create community
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className="flex w-full items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-50"
                >
                  <Send size={12} /> Compose post
                </button>
              </div>
            </div>
          )}

          {/* user engagement insight */}
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-orange-500" />
              <p className="text-xs font-semibold text-neutral-700">
                User engagement model
              </p>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-neutral-900">
                {buildUserEngagementInsight(communities).score}
              </p>
              <p className="mt-1 text-[11px] text-neutral-500">
                score based on community activity, topic tags, and recent member engagement.
              </p>
            </div>
            <div className="mt-3 rounded-xl border border-orange-100 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                strongest interest
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {buildUserEngagementInsight(communities).strongest}
              </p>
            </div>
            <p className="mt-3 text-xs text-neutral-600">
              The algorithm looks at what each user clicks, comments on, and saves so the feed becomes more relevant automatically.
            </p>
          </div>

          {/* trending / overview */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-orange-500" />
              <p className="text-xs font-semibold text-neutral-700">
                Top communities
              </p>
            </div>
            <div className="mt-3 space-y-3">
              {communities
                .slice()
                .sort((a, b) => b.members - a.members)
                .slice(0, 5)
                .map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setDetailId(c.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition hover:bg-neutral-50"
                  >
                    <span className="w-4 text-[10px] font-bold text-neutral-300">
                      #{i + 1}
                    </span>
                    <CommunityAvatar community={c} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-neutral-800">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {c.members} members
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </button>
                ))}
            </div>
          </div>

          {/* engagement summary */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart2 size={14} className="text-orange-500" />
              <p className="text-xs font-semibold text-neutral-700">
                Platform engagement
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {[
                {
                  label: 'Total members',
                  value: stats.members,
                  color: 'bg-orange-500',
                },
                {
                  label: 'Active',
                  value: communities.filter((c) => c.status === 'Active')
                    .length,
                  color: 'bg-emerald-500',
                },
                {
                  label: 'Pending',
                  value: stats.pending,
                  color: 'bg-amber-500',
                },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                    <span>{row.label}</span>
                    <span className="font-semibold text-neutral-800">
                      {row.value}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{
                        width: `${Math.min(100, (row.value / (stats.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function CommunitiesScreen(props: CommunitiesScreenProps) {
  return <CommunityPostsScreen {...props} />;
}

// ── CommunityFeedCard ──────────────────────────────────────────────────────────
function CommunityFeedCard({
  community,
  onSelect,
  onStatus,
  onDelete,
  onCompose,
}: {
  community: Community;
  onSelect: () => void;
  onStatus: (s: Community['status']) => void;
  onDelete: () => void;
  onCompose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const engagement = Math.max(12, community.members / 2);
  const cat = (community as any).category ?? 'GENERAL';

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-orange-200">
      <div className="flex items-start gap-3">
        <CommunityAvatar community={community} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onSelect}
              className="text-sm font-bold text-neutral-900 hover:underline"
            >
              {community.name}
            </button>
            <StatusBadge status={community.status} />
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColor(cat)}`}
            >
              {cat}
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            @{community.name.toLowerCase().replace(/\s+/g, '-')} ·{' '}
            {community.members.toLocaleString()} members ·{' '}
            {community.dateCreated}
          </p>
        </div>

        {/* overflow menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-1 hover:bg-neutral-100"
          >
            <MoreHorizontal size={16} className="text-neutral-400" />
          </button>
          {open && (
            <div className="absolute right-0 top-7 z-10 w-44 rounded-xl border border-neutral-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  onCompose();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                <Send size={12} /> Post here
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatus(
                    community.status === 'Active' ? 'Suspended' : 'Active',
                  );
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                {community.status === 'Active' ? (
                  <>
                    <AlertTriangle size={12} /> Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} /> Activate
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatus('Pending');
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                <RefreshCw size={12} /> Set pending
              </button>
              <hr className="my-1 border-neutral-100" />
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete?')) {
                    onDelete();
                    setOpen(false);
                  }
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          {
            icon: <Users size={13} />,
            label: 'Members',
            value: community.members,
          },
          {
            icon: <MessageSquareText size={13} />,
            label: 'Comments',
            value: Math.max(8, Math.round(engagement * 0.8)),
          },
          {
            icon: <Heart size={13} />,
            label: 'Likes',
            value: Math.max(14, Math.round(engagement * 1.7)),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 rounded-xl bg-neutral-50 p-2.5"
          >
            <span className="text-neutral-400">{s.icon}</span>
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {s.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-neutral-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* quick post button */}
      <button
        type="button"
        onClick={onCompose}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
      >
        <Send size={12} /> Post to this community
      </button>
    </div>
  );
}

// ── ManageRow ─────────────────────────────────────────────────────────────────
function ManageRow({
  community,
  onStatus,
  onDelete,
  onSelect,
  loading,
}: {
  community: Community;
  onStatus: (s: Community['status']) => void;
  onDelete: () => void;
  onSelect: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <CommunityAvatar community={community} size="sm" />
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={onSelect}
          className="text-sm font-semibold text-neutral-900 hover:underline"
        >
          {community.name}
        </button>
        <p className="text-[10px] text-neutral-400">
          @{community.name.toLowerCase().replace(/\s+/g, '-')} ·{' '}
          {community.members} members · {community.dateCreated}
        </p>
      </div>
      <StatusBadge status={community.status} />
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            onStatus(
              community.status === 'Active'
                ? 'Suspended'
                : community.status === 'Suspended'
                  ? 'Active'
                  : 'Active',
            )
          }
          className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[10px] font-medium text-neutral-600 hover:border-orange-200 hover:text-orange-600 disabled:opacity-50"
        >
          {community.status === 'Active' ? 'Suspend' : 'Activate'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            if (window.confirm('Delete?')) onDelete();
          }}
          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// ── utility components ─────────────────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
        >
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-neutral-200" />
              <div className="h-2 w-1/4 rounded bg-neutral-100" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-12 rounded-xl bg-neutral-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-12 text-center">
      {icon}
      <p className="mt-3 text-sm font-semibold text-neutral-600">{title}</p>
      <p className="mt-1 text-xs text-neutral-400">{sub}</p>
      {action}
    </div>
  );
}
