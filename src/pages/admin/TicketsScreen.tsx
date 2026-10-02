import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BadgeCheck,
  LifeBuoy,
  MessageSquareText,
  Send,
} from 'lucide-react';
import PageShell from '../../components/PageShell';
import { StatCard, StatusBadge } from '../../components/StatCard';
import type { NavKey } from '../../components/Sidebar';
import {
  fetchAdminTickets,
  replyToAdminTicket,
  updateAdminTicketStatus,
} from '../../lib/adminApi';

interface TicketsScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

const statusOptions = [
  'OPEN',
  'PENDING',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

function formatStatus(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function TicketsScreen({
  onNavigate,
  onLogout,
}: TicketsScreenProps) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const ticketsQuery = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => fetchAdminTickets(),
  });

  const tickets = ticketsQuery.data ?? [];
  const selected =
    tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0] ?? null;

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === 'OPEN').length,
      active: tickets.filter((ticket) =>
        ['PENDING', 'IN_PROGRESS'].includes(ticket.status),
      ).length,
      resolved: tickets.filter((ticket) =>
        ['RESOLVED', 'CLOSED'].includes(ticket.status),
      ).length,
    }),
    [tickets],
  );

  const statusMutation = useMutation({
    mutationFn: ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    }) => updateAdminTicketStatus(ticketId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }),
  });

  const replyMutation = useMutation({
    mutationFn: ({
      ticketId,
      message,
    }: {
      ticketId: string;
      message: string;
    }) => replyToAdminTicket(ticketId, message),
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });

  return (
    <PageShell active="tickets" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-500">
            Support desk
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            User Tickets
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
          <LifeBuoy size={14} />
          {stats.total} total tickets
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <StatCard
          label="Open"
          value={String(stats.open)}
          icon={<LifeBuoy size={16} className="text-orange-600" />}
        />
        <StatCard
          label="In progress"
          value={String(stats.active)}
          icon={<MessageSquareText size={16} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Resolved"
          value={String(stats.resolved)}
          icon={<BadgeCheck size={16} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Priority"
          value={'High'}
          icon={<ArrowUpRight size={16} className="text-red-500" />}
          iconBg="bg-red-50"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Inbox</h2>
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600">
              {tickets.length} active
            </span>
          </div>

          <div className="space-y-3">
            {ticketsQuery.isPending ? (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-400">
                Loading tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-400">
                No support tickets yet.
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === ticket.id ? 'border-orange-300 bg-orange-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-500">
                          {ticket.ticketNo}
                        </span>
                        <StatusBadge status={ticket.status} />
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                        {ticket.title}
                      </h3>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                    {ticket.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                    <span>{ticket.user?.fullName ?? 'Customer'}</span>
                    <span>{ticket._count?.messages ?? 0} messages</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          {selected ? (
            <>
              <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-500">
                    {selected.ticketNo}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-neutral-900">
                    {selected.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selected.status}
                    onChange={(event) =>
                      statusMutation.mutate({
                        ticketId: selected.id,
                        status: event.target.value as any,
                      })
                    }
                    className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                    Customer
                  </p>
                  <p className="mt-2 text-sm font-semibold text-neutral-800">
                    {selected.user?.fullName ?? 'Customer'}
                  </p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                    Category
                  </p>
                  <p className="mt-2 text-sm font-semibold text-neutral-800">
                    {selected.category}
                  </p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                    Priority
                  </p>
                  <p className="mt-2 text-sm font-semibold text-neutral-800">
                    {selected.priority}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  User report
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                  {selected.description}
                </p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-neutral-900">
                  Admin response
                </p>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={5}
                  placeholder="Reply to the customer..."
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      replyMutation.mutate({
                        ticketId: selected.id,
                        message: reply,
                      })
                    }
                    disabled={replyMutation.isPending || !reply.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
                  >
                    <Send size={15} />
                    {replyMutation.isPending ? 'Sending...' : 'Send reply'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-400">
              Select a ticket to view details.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
