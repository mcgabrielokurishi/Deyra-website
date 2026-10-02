import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing, Eye, EyeOff, FileText, Pencil, Trash2 } from 'lucide-react';
import PageShell from '../../components/PageShell';
import { StatCard } from '../../components/StatCard';
import type { NavKey } from '../../components/Sidebar';
import {
  createAdminInformation,
  deleteAdminInformation,
  fetchAdminInformation,
  updateAdminInformation,
} from '../../lib/adminApi';

interface InformationScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

const categories = [
  'GENERAL',
  'ELECTRICITY',
  'BILLING',
  'SAFETY',
  'FAQ',
  'TIP',
];

export default function InformationScreen({
  onNavigate,
  onLogout,
}: InformationScreenProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    category: 'GENERAL',
    isPublished: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const infoQuery = useQuery({
    queryKey: ['admin-information'],
    queryFn: () => fetchAdminInformation(),
  });

  const items = infoQuery.data ?? [];

  const metrics = useMemo(
    () => ({
      total: items.length,
      published: items.filter((item) => item.isPublished).length,
      drafts: items.filter((item) => !item.isPublished).length,
    }),
    [items],
  );

  const createMutation = useMutation({
    mutationFn: () => editingId
      ? updateAdminInformation(editingId, form)
      : createAdminInformation(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-information'] });
      setEditingId(null);
      setForm({
        title: '',
        content: '',
        imageUrl: '',
        videoUrl: '',
        category: 'GENERAL',
        isPublished: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminInformation(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-information'] }),
  });

  const togglePublished = (id: string, current: boolean) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;

    updateAdminInformation(id, {
      isPublished: !current,
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl ?? undefined,
      videoUrl: item.videoUrl ?? undefined,
      category: item.category,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-information'] });
    });
  };

  return (
    <PageShell active="information" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-500">
            Content hub
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            Information Center
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <BellRing size={14} />
          Article publishing
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total posts"
          value={String(metrics.total)}
          icon={<FileText size={16} className="text-orange-600" />}
        />
        <StatCard
          label="Live to app"
          value={String(metrics.published)}
          icon={<Eye size={16} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Drafts"
          value={String(metrics.drafts)}
          icon={<EyeOff size={16} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">
            {editingId ? 'Edit update' : 'Create a new update'}
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Title
              </label>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Power outage update"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Category
              </label>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Message
              </label>
              <textarea
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                rows={6}
                placeholder="Share the latest update, safety warning, or customer tip..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Image URL <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="https://example.com/article-image.jpg"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
              {form.imageUrl.trim() && <img src={form.imageUrl} alt="Article image preview" className="mt-3 max-h-48 w-full rounded-lg border border-neutral-200 object-cover" />}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Video link <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  Publish to app users
                </p>
                <p className="text-xs text-neutral-500">
                  Published updates appear in the app’s information carousel.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    isPublished: !current.isPublished,
                  }))
                }
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${form.isPublished ? 'bg-orange-500' : 'bg-neutral-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending ||
                !form.title.trim() ||
                !form.content.trim()
              }
              className="w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
            >
              {createMutation.isPending
                ? 'Saving update...'
                : editingId ? 'Save changes' : 'Publish update'}
            </button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', content: '', imageUrl: '', videoUrl: '', category: 'GENERAL', isPublished: true }); }} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50">Cancel editing</button>}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              Recent updates
            </h2>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
              {items.length} items
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {infoQuery.isPending ? (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-400">
                Loading information...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-400">
                No content published yet.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-neutral-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-500">
                        {item.category}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-neutral-900">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          togglePublished(item.id, item.isPublished)
                        }
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-600 hover:border-orange-200 hover:text-orange-600"
                      >
                        {item.isPublished ? 'Hide' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({
                            title: item.title,
                            content: item.content,
                            imageUrl: item.imageUrl ?? '',
                            videoUrl: item.videoUrl ?? '',
                            category: item.category,
                            isPublished: item.isPublished,
                          });
                        }}
                        aria-label={`Edit ${item.title}`}
                        className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-500 hover:border-orange-200 hover:text-orange-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="rounded-lg border border-neutral-200 bg-white p-1.5 text-red-500 hover:border-red-200 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-neutral-600">
                    {item.content}
                  </p>
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="mt-3 max-h-36 w-full rounded-lg border border-neutral-100 object-cover" />}
                  {item.videoUrl && <a href={item.videoUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-orange-700 hover:underline">Open video link</a>}
                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 font-medium ${item.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}
                    >
                      {item.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
