export type ActivityType = 'view' | 'like' | 'comment' | 'save' | 'join';

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityType;
  communityId: string;
  communityName: string;
  category: string;
  tag: string;
  message: string;
  createdAt: string;
}

export interface InterestProfile {
  userId: string;
  name: string;
  strongestCategory: string;
  score: number;
  favoriteTopics: string[];
  savedCommunities: string[];
  recentEvents: string[];
  lastActiveAt: string;
}

export interface CommunityInterestSeed {
  id: string;
  name: string;
  category: string;
  members: number;
  description: string;
  tagline: string;
  founderName: string;
  profileImage?: string;
  avatarColor?: string;
}

export const demoCommunities: CommunityInterestSeed[] = [
  {
    id: 'community-outage-lekki',
    name: 'Lekki Outage Reports',
    category: 'OUTAGES',
    members: 1280,
    description: 'Live outage updates from Lekki and surrounding communities.',
    tagline: 'Fast updates, clear alerts, action-ready reports.',
    founderName: 'Ada Okafor',
    avatarColor: '#E85D04',
    profileImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'community-energy-tips',
    name: 'Energy Saving Tips',
    category: 'TIPS',
    members: 2400,
    description: 'Short, practical ways to reduce electricity usage and lower bills.',
    tagline: 'Better habits. Lower cost. Smarter consumption.',
    founderName: 'Musa Bello',
    avatarColor: '#14B8A6',
    profileImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'community-news-grid',
    name: 'Power Policy Updates',
    category: 'NEWS',
    members: 860,
    description: 'Utility policy changes, tariff notices, and district updates.',
    tagline: 'Stay informed before the next bill or outage.',
    founderName: 'Femi Adebayo',
    avatarColor: '#2563EB',
    profileImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'community-general-forum',
    name: 'Deyra Community Hub',
    category: 'GENERAL',
    members: 5400,
    description: 'A general-purpose community for meter management and everyday energy support.',
    tagline: 'Community support for daily energy decisions.',
    founderName: 'Ezra Nnaji',
    avatarColor: '#7C3AED',
    profileImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
  },
];

const USER_ACTIVITY_STORAGE_KEY = 'pay4light-user-activity-store';
const GENERIC_USER_ID = 'demo-user';

function readStore() {
  if (typeof window === 'undefined') {
    return { profiles: {} as Record<string, InterestProfile>, activities: {} as Record<string, ActivityEvent[]> };
  }

  try {
    const raw = window.localStorage.getItem(USER_ACTIVITY_STORAGE_KEY);
    if (!raw) {
      return { profiles: {}, activities: {} };
    }
    return JSON.parse(raw) as { profiles: Record<string, InterestProfile>; activities: Record<string, ActivityEvent[]> };
  } catch {
    return { profiles: {}, activities: {} };
  }
}

function writeStore(data: { profiles: Record<string, InterestProfile>; activities: Record<string, ActivityEvent[]> }) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_ACTIVITY_STORAGE_KEY, JSON.stringify(data));
}

export function buildUserEngagementInsight(communities: Array<{ category?: string; members?: number }>) {
  const categoryMap: Record<string, number> = {};
  communities.forEach((community) => {
    const category = String(community.category ?? 'GENERAL').toUpperCase();
    categoryMap[category] = (categoryMap[category] ?? 0) + Number(community.members ?? 0);
  });

  const strongest = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
  const score = Math.min(96, 35 + communities.length * 7 + (strongest ? Math.round(strongest[1] / 120) : 0));

  return {
    score,
    strongest: strongest ? strongest[0] : 'GENERAL',
    trend: strongest ? `${strongest[0]} is leading the current activity.` : 'Your community mix is still balancing out.',
    favoriteTopics: strongest ? [strongest[0], 'Community updates', 'Smart alerts'] : ['Community updates', 'Smart alerts'],
  };
}

export function getOrCreateUserProfile(userId = GENERIC_USER_ID): InterestProfile {
  const store = readStore();
  const profile = store.profiles[userId];
  if (profile) return profile;

  const defaultProfile: InterestProfile = {
    userId,
    name: 'Demo user',
    strongestCategory: 'OUTAGES',
    score: 82,
    favoriteTopics: ['Outages', 'Energy tips', 'Usage alerts'],
    savedCommunities: ['community-outage-lekki', 'community-energy-tips'],
    recentEvents: ['Outage notice', 'Saved tip', 'Joined community'],
    lastActiveAt: new Date().toISOString(),
  };

  store.profiles[userId] = defaultProfile;
  writeStore(store);
  return defaultProfile;
}

export function listUserActivities(userId = GENERIC_USER_ID): ActivityEvent[] {
  const store = readStore();
  const seed: ActivityEvent[] = [
    {
      id: 'a1',
      userId,
      type: 'view',
      communityId: 'community-outage-lekki',
      communityName: 'Lekki Outage Reports',
      category: 'OUTAGES',
      tag: 'Outage alert',
      message: 'Viewed outage report for Lekki',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'a2',
      userId,
      type: 'save',
      communityId: 'community-energy-tips',
      communityName: 'Energy Saving Tips',
      category: 'TIPS',
      tag: 'Saved tip',
      message: 'Saved a bill-saving energy tip',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'a3',
      userId,
      type: 'join',
      communityId: 'community-general-forum',
      communityName: 'Deyra Community Hub',
      category: 'GENERAL',
      tag: 'Joined community',
      message: 'Joined the general community hub',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ];

  return (store.activities[userId] ?? seed).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveUserActivity(
  userId: string,
  activity: Omit<ActivityEvent, 'id' | 'userId' | 'createdAt'>,
): ActivityEvent {
  const store = readStore();
  const event: ActivityEvent = {
    ...activity,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId,
    createdAt: new Date().toISOString(),
  };

  const activities = store.activities[userId] ?? [];
  store.activities[userId] = [event, ...activities].slice(0, 12);

  const profile = store.profiles[userId] ?? getOrCreateUserProfile(userId);
  const nextCategories = [event.category, profile.strongestCategory].filter(Boolean);
  const strongest = nextCategories[0] ?? 'OUTAGES';
  store.profiles[userId] = {
    ...profile,
    strongestCategory: strongest,
    score: Math.min(99, Math.max(70, profile.score + (event.type === 'save' ? 4 : event.type === 'join' ? 5 : 2))),
    favoriteTopics: Array.from(new Set([event.tag, ...profile.favoriteTopics])).slice(0, 4),
    lastActiveAt: event.createdAt,
  };

  writeStore(store);
  return event;
}

export function getPersonalizedRecommendations(userId = GENERIC_USER_ID) {
  const profile = getOrCreateUserProfile(userId);
  const activities = listUserActivities(userId);
  const strongest = profile.strongestCategory || 'OUTAGES';

  return demoCommunities
    .filter((community) => community.category === strongest || community.category === 'GENERAL')
    .map((community) => ({
      ...community,
      recommendedReason: `${community.category} is matching your recent activity and saved preferences.`,
      matchScore: community.category === strongest ? 94 : 78,
      recentActivity: activities.filter((event) => event.category === community.category).length,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}
