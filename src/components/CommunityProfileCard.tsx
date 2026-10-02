import { Link } from 'react-router-dom';
import { demoCommunities } from '../lib/userProfileActivity';

export default function CommunityProfileCard() {
  const community = demoCommunities[0];

  return (
    <div className="w-full max-w-[440px] overflow-hidden rounded-[30px] border border-orange-100 bg-white shadow-[0_30px_80px_rgba(245,90,8,0.12)]">
      <div className="relative h-56 overflow-hidden">
        <img
          src={community.profileImage}
          alt={community.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937]/80 via-[#1f2937]/20 to-transparent" />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
          {community.category}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-base font-black text-white"
              style={{ backgroundColor: community.avatarColor ?? '#F55A08' }}
            >
              {community.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {community.name}
              </h3>
              <p className="text-xs text-slate-500">
                Founded by {community.founderName}
              </p>
            </div>
          </div>
          <button className="rounded-full bg-[#F55A08] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600">
            Join
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {community.tagline}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {['Energy updates', 'Power alerts', 'Community tips'].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700"
            >
              #{tag.replace(/\s+/g, '').toLowerCase()}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
          <div>
            <p className="text-xl font-black text-slate-900">
              {community.members.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Members
            </p>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">4.9</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Rating
            </p>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">24/7</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Alerts
            </p>
          </div>
        </div>

        <Link
          to="/new-user-dashboard"
          className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View personalized dashboard
        </Link>
      </div>
    </div>
  );
}
