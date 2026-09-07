export const APP_NAME = "TheLocal";
export const APP_TAGLINE = "What's happening near you";
export const APP_DESCRIPTION =
  "A community hub for real-world connection — find events, groups, and gatherings near you.";
export const APP_DOMAIN = "thelocal.nexus";

export const LISTING_TYPES = [
  { value: "ONE_TIME_EVENT", label: "One-time event", description: "Concerts, cleanups, game nights" },
  { value: "RECURRING_EVENT", label: "Recurring event", description: "Weekly rides, monthly potlucks" },
  { value: "GROUP_SEEKING", label: "Group seeking members", description: "Join us — ongoing" },
  { value: "HANGOUT_SPOT", label: "Hangout spot", description: "Open invitation — just show up" },
  { value: "VOLUNTEER", label: "Volunteer opportunity", description: "Community service & mutual aid" },
  { value: "WORKSHOP", label: "Workshop or class", description: "Skill shares and learning" },
  { value: "LOOKING_FOR", label: "Looking for", description: "Seeking a group or activity" },
] as const;

export const LISTING_CATEGORIES = [
  { slug: "cycling", name: "Cycling", icon: "🚴" },
  { slug: "music", name: "Music", icon: "🎵" },
  { slug: "dnd", name: "D&D & Tabletop", icon: "🎲" },
  { slug: "arts", name: "Arts & Crafts", icon: "🎨" },
  { slug: "volunteering", name: "Volunteering", icon: "🤝" },
  { slug: "outdoors", name: "Outdoors", icon: "🌲" },
  { slug: "food", name: "Food & Potlucks", icon: "🍲" },
  { slug: "fitness", name: "Fitness", icon: "💪" },
  { slug: "books", name: "Books & Discussion", icon: "📚" },
  { slug: "tech", name: "Tech & Makers", icon: "🔧" },
  { slug: "home-repairs", name: "Home & Repairs", icon: "🛠️" },
  { slug: "yard-garden", name: "Yard & Garden", icon: "🌿" },
  { slug: "parenting", name: "Parenting", icon: "👶" },
  { slug: "pets", name: "Pets", icon: "🐕" },
  { slug: "religion", name: "Religion", icon: "🙏" },
] as const;

export const LISTING_NATURE_TAGS = [
  { value: "INDIVIDUAL", label: "Individual", description: "Hosted by one person" },
  { value: "GATHERING", label: "Gathering", description: "Small get-together, casual" },
  { value: "BUSINESS", label: "Business", description: "Hosted by a local business" },
  { value: "ORGANIZATION", label: "Organization", description: "Club, nonprofit, or community group" },
  { value: "LARGE_EVENT", label: "Large event", description: "Festival, conference, or big turnout" },
] as const;

export const DEFAULT_RADIUS_MILES = 20;

export const RADIUS_OPTIONS = [5, 10, 15, 20, 50] as const;