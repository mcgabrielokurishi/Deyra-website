import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  buildUserEngagementInsight,
  demoCommunities,
  getOrCreateUserProfile,
  getPersonalizedRecommendations,
  listUserActivities,
} from '../lib/userProfileActivity';

export default function NewUserDashboard() {
  const profile = useMemo(() => getOrCreateUserProfile(), []);
  const activities = useMemo(() => listUserActivities(), []);
  const recommendations = useMemo(() => getPersonalizedRecommendations(), []);
  const insight = useMemo(
    () => buildUserEngagementInsight(demoCommunities),
    [],
  );

  return (
    <div className="min-h-screen bg-[#fff7f2] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-[#F55A08] to-orange-500 p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-100">
                Personal dashboard
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Hi {profile.name}
              </h1>
            </div>
            <Link
              to="/"
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              Back to home
            </Link>
          </div>

          <div className="mt-2 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-100">
                Interest score
              </p>
              <p className="mt-3 text-3xl font-black">{profile.score}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-100">
                Top interest
              </p>
              <p className="mt-3 text-xl font-bold">
                {profile.strongestCategory}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-100">
                Last activity
              </p>
              <p className="mt-3 text-lg font-semibold">
                {new Date(profile.lastActiveAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                    Interest radar
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    Your personalized activity snapshot
                  </h2>
                </div>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                  {insight.score}% engagement
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {['OUTAGES', 'TIPS', 'NEWS', 'GENERAL'].map((item) => {
                  const active = item === insight.strongest;
                  const width = active ? 82 : 46;
                  return (
                    <div key={item}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {item}
                        </span>
                        <span className="text-slate-500">{width}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${active ? 'bg-orange-500' : 'bg-slate-300'}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                    Recommended communities
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    Built around your interests
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {recommendations.map((community) => (
                  <div
                    key={community.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white"
                        style={{
                          backgroundColor: community.avatarColor ?? '#F55A08',
                        }}
                      >
                        {community.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-slate-900">
                          {community.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {community.category}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {community.tagline}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{community.members.toLocaleString()} members</span>
                      <span>{community.matchScore}% match</span>
                    </div>
                    <button className="mt-4 w-full rounded-xl bg-[#F55A08] px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                      Join community
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                Your preferences
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.favoriteTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                Recent activity
              </p>
              <div className="mt-4 space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {activity.communityName}
                      </p>
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700">
                        {activity.type}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {activity.message}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      {new Date(activity.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
