import { useDeferredValue, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Reply,
  Trash2,
  X,
} from "lucide-react";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import {
  createAdminCategoryPost,
  createAdminPostComment,
  deleteAdminCommunityPost,
  fetchAdminPostComments,
  fetchAdminCommunityPosts,
  moderateAdminCommunityPost,
  toggleAdminPostLike,
} from "../../lib/adminApi";
import type { AdminCommunityComment, AdminCommunityPost, CommunityPostCategory } from "../../types";

interface CommunitiesScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

const categories: Array<{ value: "ALL" | CommunityPostCategory; label: string }> = [
  { value: "ALL", label: "All posts" },
  { value: "OUTAGES", label: "Power outages" },
  { value: "TIPS", label: "Energy tips" },
  { value: "NEWS", label: "News" },
  { value: "GENERAL", label: "General" },
];

const categoryStyles: Record<CommunityPostCategory, string> = {
  OUTAGES: "bg-red-50 text-red-700 ring-red-100",
  TIPS: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  NEWS: "bg-blue-50 text-blue-700 ring-blue-100",
  GENERAL: "bg-neutral-100 text-neutral-700 ring-neutral-200",
};

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function postCategoryLabel(category: CommunityPostCategory) {
  return categories.find((item) => item.value === category)?.label ?? "General";
}

export default function CommunityPostsScreen({ onNavigate, onLogout }: CommunitiesScreenProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<"ALL" | CommunityPostCategory>("ALL");
  const [composeCategory, setComposeCategory] = useState<CommunityPostCategory>("OUTAGES");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [reportedOnly, setReportedOnly] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const postsQuery = useQuery({
    queryKey: ["admin-community-posts", page, deferredSearch, category, reportedOnly],
    queryFn: () => fetchAdminCommunityPosts({
      page,
      limit: 20,
      search: deferredSearch,
      category,
      reportedOnly,
    }),
  });
  const posts = postsQuery.data?.data ?? [];
  const stats = postsQuery.data?.stats ?? { totalPosts: 0, reportedPosts: 0, pendingReports: 0 };
  const meta = postsQuery.data?.meta;
  const reportingAvailable = Boolean(postsQuery.data && stats.reportingAvailable !== false);

  const createMutation = useMutation({
    mutationFn: () => createAdminCategoryPost({
      category: composeCategory,
      content: content.trim(),
      tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      images,
      location: location.trim() || undefined,
    }),
    onSuccess: () => {
      setContent("");
      setTagsText("");
      setLocation("");
      setImages([]);
      setFormError(null);
      setPage(1);
      void queryClient.invalidateQueries({ queryKey: ["admin-community-posts"] });
    },
    onError: (error: unknown) => {
      setFormError(error instanceof Error ? error.message : "Could not publish this post.");
    },
  });

  const moderationMutation = useMutation({
    mutationFn: ({ postId, action }: { postId: string; action: "dismiss" | "remove" }) =>
      moderateAdminCommunityPost(postId, action),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-community-posts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deleteAdminCommunityPost(postId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-community-posts"] }),
  });

  function handleImagePick(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 4 - images.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((current) => [...current, String(reader.result ?? "")].slice(0, 4));
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  }

  function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) {
      setFormError("Write a post before publishing.");
      return;
    }
    createMutation.mutate();
  }

  function selectCategory(value: "ALL" | CommunityPostCategory) {
    setCategory(value);
    setPage(1);
  }

  return (
    <PageShell active="communities" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Community desk</p>
        <h1 className="text-xl font-bold text-neutral-900">Posts and reports</h1>
        <p className="text-sm text-neutral-500">Publish updates under a category and review reports from the feed.</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-xs font-medium text-neutral-500">Published posts</p><p className="mt-1 text-2xl font-bold text-neutral-900">{stats.totalPosts.toLocaleString()}</p></div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-xs font-medium text-neutral-500">Posts with reports</p><p className="mt-1 text-2xl font-bold text-amber-700">{reportingAvailable ? stats.reportedPosts.toLocaleString() : "—"}</p></div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-xs font-medium text-neutral-500">Pending reports</p><p className="mt-1 text-2xl font-bold text-red-700">{reportingAvailable ? stats.pendingReports.toLocaleString() : "—"}</p></div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[190px_minmax(0,1fr)_270px]">
        <nav aria-label="Post categories" className="flex gap-2 overflow-x-auto xl:flex-col xl:overflow-visible">
          {categories.map((item) => (
            <button key={item.value} type="button" onClick={() => selectCategory(item.value)} className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${category === item.value ? "bg-orange-600 text-white" : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"}`}>
              {item.label}
            </button>
          ))}
        </nav>

        <main className="min-w-0 space-y-4">
          <form onSubmit={handlePublish} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">P4L</div>
                <select aria-label="Post category" value={composeCategory} onChange={(event) => setComposeCategory(event.target.value as CommunityPostCategory)} className="min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800">
                  {categories.filter((item) => item.value !== "ALL").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <span className="text-xs text-neutral-400">Admin post</span>
            </div>
            <textarea value={content} onChange={(event) => { setContent(event.target.value); setFormError(null); }} rows={4} maxLength={2000} placeholder="Share an update with the community…" className="mt-3 w-full resize-y border-0 px-1 py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400" />
            {images.length > 0 && <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{images.map((image, index) => <div key={`${index}-${image.slice(0, 20)}`} className="relative overflow-hidden rounded-lg border border-neutral-200"><img src={image} alt="Post attachment preview" className="h-24 w-full object-cover" /><button type="button" aria-label="Remove image" onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"><X size={13} /></button></div>)}</div>}
            {formError && <p role="alert" className="mb-3 text-xs text-red-600">{formError}</p>}
            <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={images.length >= 4} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-40"><ImagePlus size={15} /> Image</button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagePick} />
                <div className="flex min-w-[150px] flex-1 items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1.5"><Plus size={13} className="shrink-0 text-neutral-400" /><input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="Tags, comma separated" className="w-full min-w-0 text-xs outline-none" /></div>
                <div className="flex min-w-[120px] flex-1 items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1.5"><MapPin size={13} className="shrink-0 text-neutral-400" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" className="w-full min-w-0 text-xs outline-none" /></div>
              </div>
              <button type="submit" disabled={!content.trim() || createMutation.isPending} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"><Send size={14} />{createMutation.isPending ? "Publishing…" : "Publish"}</button>
            </div>
          </form>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search posts or authors" className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" /></div>
            <button type="button" aria-pressed={reportedOnly} disabled={!reportingAvailable} onClick={() => { setReportedOnly((current) => !current); setPage(1); }} className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${reportedOnly ? "border-red-200 bg-red-50 text-red-700" : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"}`}><AlertTriangle size={15} />Reported only</button>
          </div>

          {postsQuery.isPending ? <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-400">Loading posts…</div> : postsQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center"><p className="text-sm font-semibold text-neutral-800">Posts could not be loaded</p><button type="button" onClick={() => void postsQuery.refetch()} className="mt-3 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white">Retry</button></div>
          ) : posts.length ? posts.map((post) => <PostRow key={post.id} post={post} expanded={expandedPostId === post.id} onToggleComments={() => setExpandedPostId((current) => current === post.id ? null : post.id)} busy={(moderationMutation.isPending && moderationMutation.variables?.postId === post.id) || (deleteMutation.isPending && deleteMutation.variables === post.id)} onModerate={(action) => moderationMutation.mutate({ postId: post.id, action })} onDelete={() => { if (window.confirm("Delete this post? It will be hidden from the feed.")) deleteMutation.mutate(post.id); }} />) : (
            <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"><MessageCircle size={20} /></div><p className="mt-3 text-sm font-semibold text-neutral-800">No posts to show</p><p className="mt-1 text-xs text-neutral-500">Try another category or search term.</p></div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-500">
            <span>{meta ? `${meta.total.toLocaleString()} posts` : ""}</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={!meta || page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page" className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 disabled:opacity-40"><ChevronLeft size={15} /></button>
              <span>{page}{meta?.totalPages ? ` / ${meta.totalPages}` : ""}</span>
              <button type="button" disabled={!meta?.hasNextPage} onClick={() => setPage((value) => value + 1)} aria-label="Next page" className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 disabled:opacity-40"><ChevronRight size={15} /></button>
            </div>
          </div>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-orange-600" /><h2 className="text-sm font-semibold text-neutral-900">Report queue</h2></div>
            <p className="mt-3 text-3xl font-bold text-neutral-900">{reportingAvailable ? stats.pendingReports.toLocaleString() : "—"}</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">{reportingAvailable ? `Pending reports across ${stats.reportedPosts.toLocaleString()} posts.` : "Report totals require the updated backend service."}</p>
            <button type="button" disabled={!reportingAvailable} onClick={() => { setReportedOnly(true); setPage(1); }} className="mt-4 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50">Review reported posts</button>
          </section>
          <section className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-neutral-900">Categories</h2>
            <div className="mt-3 space-y-2">{categories.filter((item) => item.value !== "ALL").map((item) => <button key={item.value} type="button" onClick={() => selectCategory(item.value)} className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs text-neutral-600 hover:bg-neutral-50"><span>{item.label}</span><span className="text-neutral-400">{category === item.value ? "Selected" : ""}</span></button>)}</div>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}

function PostRow({ post, busy, expanded, onToggleComments, onModerate, onDelete }: { post: AdminCommunityPost; busy: boolean; expanded: boolean; onToggleComments: () => void; onModerate: (action: "dismiss" | "remove") => void; onDelete: () => void }) {
  const queryClient = useQueryClient();
  const [commentDraft, setCommentDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState<AdminCommunityComment | null>(null);
  const commentsQuery = useQuery({
    queryKey: ["admin-community-comments", post.id],
    queryFn: () => fetchAdminPostComments(post.id),
    enabled: expanded,
  });
  const commentMutation = useMutation({
    mutationFn: () => createAdminPostComment(post.id, {
      content: commentDraft.trim(),
      parentId: replyTarget?.id,
    }),
    onSuccess: () => {
      setCommentDraft("");
      setReplyTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-community-comments", post.id] });
      void queryClient.invalidateQueries({ queryKey: ["admin-community-posts"] });
    },
  });
  const postLikeMutation = useMutation({
    mutationFn: () => toggleAdminPostLike(post.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-community-posts"] }),
  });
  const commentLikeMutation = useMutation({
    mutationFn: (commentId: string) => toggleAdminPostLike(commentId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-community-comments", post.id] }),
  });

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (commentDraft.trim()) commentMutation.mutate();
  }

  return (
    <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${categoryStyles[post.category]}`}>{postCategoryLabel(post.category)}</span><span className="text-xs text-neutral-400">{timeLabel(post.createdAt)}</span>{post.location && <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500"><MapPin size={11} />{post.location}</span>}</div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">{post.content}</p>
            {post.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{post.tags.map((tag) => <span key={tag} className="text-xs font-medium text-orange-700">#{tag}</span>)}</div>}
            {!!post.images.length && <div className={`mt-3 grid gap-2 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>{post.images.slice(0, 4).map((image, index) => <img key={`${index}-${image.slice(0, 24)}`} src={image} alt="Post attachment" className="max-h-72 w-full rounded-lg border border-neutral-100 object-cover" />)}</div>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <button type="button" aria-expanded={expanded} onClick={onToggleComments} className="inline-flex items-center gap-1.5 rounded px-1 py-1 hover:bg-neutral-100"><MessageCircle size={14} />{post.commentsCount} comments</button>
          <span className="inline-flex items-center gap-1.5"><Eye size={14} />{post.viewsCount} views</span>
          <span>{post.likesCount} likes</span><span>{post.repostsCount} reposts</span>
          <button type="button" aria-pressed={post.likedByMe} disabled={postLikeMutation.isPending} onClick={() => postLikeMutation.mutate()} className={`inline-flex items-center gap-1.5 rounded px-1 py-1 disabled:opacity-50 ${post.likedByMe ? "font-semibold text-rose-600" : "hover:bg-neutral-100"}`}><Heart size={14} fill={post.likedByMe ? "currentColor" : "none"} />Like</button>
          <span className={`ml-auto inline-flex items-center gap-1.5 font-semibold ${post.reportCount ? "text-red-700" : "text-neutral-400"}`}><AlertTriangle size={14} />{post.reportCount} reports</span>
        </div>
      </div>
      {expanded && <section className="border-t border-neutral-200 bg-neutral-50/70 px-4 py-3" aria-label="Post comments">
        {commentsQuery.isPending ? <p className="py-3 text-center text-xs text-neutral-500">Loading comments…</p> : commentsQuery.isError ? <button type="button" onClick={() => void commentsQuery.refetch()} className="py-3 text-xs font-medium text-red-700">Could not load comments. Retry</button> : commentsQuery.data?.length ? <div className="mb-3 space-y-3">{commentsQuery.data.map((comment) => <AdminCommentRow key={comment.id} comment={comment} onReply={() => setReplyTarget(comment)} onLike={(commentId) => commentLikeMutation.mutate(commentId)} likingId={commentLikeMutation.variables} />)}</div> : <p className="py-3 text-center text-xs text-neutral-500">No comments yet. Start the conversation.</p>}
        <form onSubmit={submitComment} className="rounded-lg border border-neutral-200 bg-white p-2.5">
          {replyTarget && <div className="mb-2 flex items-center justify-between text-xs text-neutral-500"><span>Replying to <strong className="text-neutral-800">{replyTarget.author.fullName}</strong></span><button type="button" onClick={() => setReplyTarget(null)} className="font-semibold text-orange-700">Cancel</button></div>}
          <div className="flex items-end gap-2"><textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} maxLength={280} rows={2} placeholder={replyTarget ? "Write a reply…" : "Write a comment…"} className="min-h-10 flex-1 resize-y rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" /><button type="submit" disabled={!commentDraft.trim() || commentMutation.isPending} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-orange-600 px-3 text-xs font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"><Send size={13} />{commentMutation.isPending ? "Sending…" : replyTarget ? "Reply" : "Comment"}</button></div>
          {commentMutation.isError && <p role="alert" className="mt-2 text-xs text-red-600">{commentMutation.error.message || "Could not add comment."}</p>}
        </form>
      </section>}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 ${post.reportCount > 0 ? "border-red-100 bg-red-50/60" : "border-neutral-100 bg-neutral-50/70"}`}>
        <span className="text-xs font-medium text-neutral-600">{post.reportCount > 0 ? `${post.reportCount} pending ${post.reportCount === 1 ? "report" : "reports"}` : "Post actions"}</span>
        <div className="flex gap-2">
          {post.reportCount > 0 && <><button type="button" disabled={busy} onClick={() => onModerate("dismiss")} className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">Dismiss reports</button><button type="button" disabled={busy} onClick={() => { if (window.confirm("Remove this post and close its pending reports?")) onModerate("remove"); }} className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"><Trash2 size={13} />Remove & review</button></>}
          <button type="button" disabled={busy} onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={13} />Delete post</button>
        </div>
      </div>
    </article>
  );
}

function AdminCommentRow({ comment, onReply, onLike, likingId }: { comment: AdminCommunityComment; onReply: () => void; onLike: (commentId: string) => void; likingId?: string }) {
  return <div className="border-l-2 border-neutral-200 pl-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-neutral-900">{comment.author.fullName}<span className="ml-2 font-normal text-neutral-400">{timeLabel(comment.createdAt)}</span></p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-700">{comment.content}</p>
        <div className="mt-1.5 flex items-center gap-3"><button type="button" disabled={likingId === comment.id} onClick={() => onLike(comment.id)} aria-pressed={comment.likedByMe} className={`inline-flex items-center gap-1 text-[11px] disabled:opacity-50 ${comment.likedByMe ? "font-semibold text-rose-600" : "text-neutral-500 hover:text-rose-600"}`}><Heart size={12} fill={comment.likedByMe ? "currentColor" : "none"} />{comment.likesCount}</button><button type="button" onClick={onReply} className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-orange-700"><Reply size={12} />Reply</button></div>
      </div>
    </div>
    {comment.replies.map((reply) => <div key={reply.id} className="ml-3 mt-3 border-l-2 border-neutral-100 pl-3"><p className="text-xs font-semibold text-neutral-900">{reply.author.fullName}<span className="ml-2 font-normal text-neutral-400">{timeLabel(reply.createdAt)}</span></p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-700">{reply.content}</p><div className="mt-1.5 flex items-center gap-3"><button type="button" disabled={likingId === reply.id} onClick={() => onLike(reply.id)} aria-pressed={reply.likedByMe} className={`inline-flex items-center gap-1 text-[11px] disabled:opacity-50 ${reply.likedByMe ? "font-semibold text-rose-600" : "text-neutral-500 hover:text-rose-600"}`}><Heart size={12} fill={reply.likedByMe ? "currentColor" : "none"} />{reply.likesCount}</button></div></div>)}
  </div>;
}