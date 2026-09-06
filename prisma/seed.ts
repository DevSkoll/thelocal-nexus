import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

const INTERESTS = [
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
  { slug: "religion", name: "Religion", icon: "🙏" },
];

function daysFromNow(days: number, hours = 0) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000);
}

async function main() {
  await db.phoneOtpChallenge.deleteMany();
  await db.feedback.deleteMany();
  await db.reputationEvent.deleteMany();
  await db.skillOfferInterest.deleteMany();
  await db.skillOffer.deleteMany();
  await db.announcement.deleteMany();
  await db.message.deleteMany();
  await db.report.deleteMany();
  await db.rsvp.deleteMany();
  await db.listingInterest.deleteMany();
  await db.listing.deleteMany();
  await db.groupMember.deleteMany();
  await db.group.deleteMany();
  await db.userInterest.deleteMany();
  await db.alert.deleteMany();
  await db.interest.deleteMany();
  await db.user.deleteMany();

  for (const interest of INTERESTS) {
    await db.interest.create({ data: interest });
  }

  const interests = await db.interest.findMany();
  const interestId = (slug: string) => interests.find((i) => i.slug === slug)!.id;

  const verifiedAt = new Date();

  const joe = await db.user.create({
    data: {
      phone: "+15035550101",
      phoneVerifiedAt: verifiedAt,
      email: "joe@example.com",
      name: "Joe Martinez",
      slug: "joe-martinez",
      headline: "Bike club organizer · weekend rides",
      bio: "Bike enthusiast. Building community one ride at a time.",
      verificationTier: "VERIFIED_HOST",
      reputationScore: 72,
      reputationUpdatedAt: verifiedAt,
      zipCode: "97201",
      latitude: 45.5231,
      longitude: -122.6765,
      locationLabel: "Portland, OR",
      radiusMiles: 20,
      interests: {
        create: [
          { interestId: interestId("cycling") },
          { interestId: interestId("outdoors") },
        ],
      },
      alerts: {
        create: [{ interestId: interestId("cycling"), radiusMiles: 20 }],
      },
    },
  });

  const mira = await db.user.create({
    data: {
      phone: "+15035550102",
      phoneVerifiedAt: verifiedAt,
      email: "mira@example.com",
      name: "Mira Chen",
      slug: "mira-chen",
      headline: "Barn host · music, D&D, and art",
      bio: "Barn host for music nights, D&D, and art gatherings.",
      verificationTier: "VERIFIED_HOST",
      reputationScore: 65,
      reputationUpdatedAt: verifiedAt,
      zipCode: "97214",
      latitude: 45.5152,
      longitude: -122.6784,
      locationLabel: "Portland, OR",
      radiusMiles: 20,
      interests: {
        create: [
          { interestId: interestId("music") },
          { interestId: interestId("dnd") },
          { interestId: interestId("arts") },
        ],
      },
      alerts: {
        create: [
          { interestId: interestId("music"), radiusMiles: 20 },
          { interestId: interestId("arts"), radiusMiles: 20 },
        ],
      },
    },
  });

  const todd = await db.user.create({
    data: {
      phone: "+15035550103",
      phoneVerifiedAt: verifiedAt,
      email: "todd@example.com",
      name: "Todd Williams",
      slug: "todd-williams",
      headline: "Volunteer coordinator · river cleanups",
      bio: "Volunteer coordinator at Riverfront Community Network.",
      verificationTier: "UNVERIFIED",
      reputationScore: 18,
      reputationUpdatedAt: verifiedAt,
      zipCode: "97201",
      latitude: 45.5122,
      longitude: -122.6587,
      locationLabel: "Portland, OR",
      radiusMiles: 20,
      interests: {
        create: [
          { interestId: interestId("volunteering") },
          { interestId: interestId("outdoors") },
        ],
      },
      alerts: {
        create: [{ interestId: interestId("volunteering"), radiusMiles: 20 }],
      },
    },
  });

  const sam = await db.user.create({
    data: {
      phone: "+15035550104",
      phoneVerifiedAt: verifiedAt,
      email: "sam@example.com",
      name: "Sam Okonkwo",
      slug: "sam-okonkwo",
      headline: "Hawthorne Roastery · open mics & coffee",
      bio: "Owner of Hawthorne Roastery. Hosting open mics and neighborhood events.",
      verificationTier: "VERIFIED_HOST",
      reputationScore: 58,
      reputationUpdatedAt: verifiedAt,
      zipCode: "97214",
      latitude: 45.512,
      longitude: -122.632,
      locationLabel: "Hawthorne, Portland",
      radiusMiles: 20,
      interests: {
        create: [{ interestId: interestId("music") }, { interestId: interestId("food") }],
      },
    },
  });

  const bikeClub = await db.group.create({
    data: {
      slug: "portland-urban-cyclists",
      name: "Portland Urban Cyclists",
      description:
        "A welcoming bike club for all skill levels. We ride every Saturday morning and host monthly social rides. Newcomers always welcome — no expensive gear required.",
      type: "COMMUNITY",
      verification: "ESTABLISHED",
      latitude: 45.5231,
      longitude: -122.6765,
      locationLabel: "Portland, OR",
      foundedAt: new Date("2022-03-15"),
      createdById: joe.id,
      members: {
        create: [
          { userId: joe.id, role: "ADMIN" },
          { userId: mira.id, role: "MEMBER" },
          { userId: todd.id, role: "MEMBER" },
        ],
      },
    },
  });

  const capeFear = await db.group.create({
    data: {
      slug: "cape-fear-community-network",
      name: "Cape Fear Community Network",
      description:
        "Connecting Fayetteville neighbors through volunteer work, mutual aid, and local events along the Cape Fear River region.",
      type: "ORGANIZATION",
      verification: "ESTABLISHED",
      latitude: 35.0527,
      longitude: -78.8784,
      locationLabel: "Fayetteville, NC",
      foundedAt: new Date("2020-04-01"),
      createdById: todd.id,
      members: {
        create: [{ userId: todd.id, role: "ADMIN" }],
      },
    },
  });

  const riverfront = await db.group.create({
    data: {
      slug: "riverfront-community-network",
      name: "Riverfront Community Network",
      description:
        "A nonprofit connecting neighbors through volunteer opportunities, mutual aid, and community events along the Willamette River corridor.",
      type: "ORGANIZATION",
      verification: "ESTABLISHED",
      latitude: 45.5122,
      longitude: -122.6587,
      locationLabel: "Portland, OR",
      foundedAt: new Date("2019-06-01"),
      createdById: todd.id,
      members: {
        create: [
          { userId: todd.id, role: "ADMIN" },
          { userId: joe.id, role: "MEMBER" },
        ],
      },
    },
  });

  type ListingSeed = {
    slug: string;
    title: string;
    description: string;
    type: "ONE_TIME_EVENT" | "RECURRING_EVENT" | "GROUP_SEEKING" | "HANGOUT_SPOT" | "VOLUNTEER" | "WORKSHOP" | "LOOKING_FOR";
    posterType: "PERSON" | "GROUP" | "ORGANIZATION";
    posterUserId?: string;
    posterGroupId?: string;
    latitude: number;
    longitude: number;
    locationLabel: string;
    locationPrecision: "EXACT" | "APPROXIMATE" | "NEIGHBORHOOD";
    startsAt?: Date;
    endsAt?: Date;
    recurrenceRule?: string;
    capacity?: number;
    rsvpRequired?: boolean;
    rsvpApprovalRequired?: boolean;
    homeHosted?: boolean;
    natureTag: "INDIVIDUAL" | "GATHERING" | "BUSINESS" | "ORGANIZATION" | "LARGE_EVENT";
    isPaid: boolean;
    priceMin?: number;
    priceMax?: number;
    interestSlugs: string[];
  };

  const listings: ListingSeed[] = [
    {
      slug: "saturday-morning-urban-ride",
      title: "Saturday Morning Urban Ride",
      description:
        "Join us for a relaxed 15-mile ride through Portland's bike-friendly streets. All paces welcome — we regroup at every major intersection. Bring water and a helmet. Coffee stop at the end!",
      type: "RECURRING_EVENT",
      posterType: "GROUP",
      posterGroupId: bikeClub.id,
      latitude: 45.5231,
      longitude: -122.6765,
      locationLabel: "Waterfront Park, Portland",
      locationPrecision: "EXACT",
      recurrenceRule: "weekly:saturday:09:00",
      capacity: 30,
      rsvpRequired: true,
      natureTag: "ORGANIZATION",
      isPaid: false,
      interestSlugs: ["cycling", "outdoors"],
    },
    {
      slug: "barn-music-night-march",
      title: "Barn Music Night — Acoustic Open Session",
      description:
        "Bring your instrument or just your ears. Mira opens her barn for an informal acoustic music night. BYOB, snacks provided. First-timers welcome — this is a cozy, low-pressure space to meet fellow music lovers.",
      type: "ONE_TIME_EVENT",
      posterType: "PERSON",
      posterUserId: mira.id,
      latitude: 45.5152,
      longitude: -122.6784,
      locationLabel: "Southeast Portland (address shared after RSVP)",
      locationPrecision: "APPROXIMATE",
      startsAt: daysFromNow(5, 19),
      endsAt: daysFromNow(5, 23),
      capacity: 20,
      rsvpRequired: true,
      rsvpApprovalRequired: true,
      homeHosted: true,
      natureTag: "GATHERING",
      isPaid: false,
      interestSlugs: ["music", "arts"],
    },
    {
      slug: "dnd-campaign-sunday",
      title: "Sunday D&D Campaign — New Players Welcome",
      description:
        "Ongoing homebrew campaign, currently in Act 2. We're looking for 1-2 more players. Session zero available for newcomers. All materials provided. 18+.",
      type: "RECURRING_EVENT",
      posterType: "PERSON",
      posterUserId: mira.id,
      latitude: 45.5152,
      longitude: -122.6784,
      locationLabel: "Southeast Portland",
      locationPrecision: "NEIGHBORHOOD",
      recurrenceRule: "weekly:sunday:14:00",
      capacity: 6,
      rsvpRequired: true,
      rsvpApprovalRequired: true,
      homeHosted: true,
      natureTag: "GATHERING",
      isPaid: false,
      interestSlugs: ["dnd"],
    },
    {
      slug: "river-cleanup-volunteer",
      title: "Willamette River Cleanup — This Saturday",
      description:
        "Help us remove debris and restore habitat along a 2-mile stretch of the riverfront. Gloves, bags, and refreshments provided. No experience needed. Great for groups and families (kids 12+ with guardian).",
      type: "VOLUNTEER",
      posterType: "ORGANIZATION",
      posterGroupId: riverfront.id,
      latitude: 45.5122,
      longitude: -122.6587,
      locationLabel: "Oaks Bottom Wildlife Refuge",
      locationPrecision: "EXACT",
      startsAt: daysFromNow(3, 9),
      endsAt: daysFromNow(3, 12),
      capacity: 50,
      rsvpRequired: true,
      natureTag: "ORGANIZATION",
      isPaid: false,
      interestSlugs: ["volunteering", "outdoors"],
    },
    {
      slug: "laurelhurst-park-sunday-hangout",
      title: "Sunday Park Hangout — Just Show Up",
      description:
        "We gather at the big oak tree every Sunday around noon. Bring a blanket, a book, or a frisbee. No RSVP needed — just look for the friendly group with the golden retriever.",
      type: "HANGOUT_SPOT",
      posterType: "PERSON",
      posterUserId: joe.id,
      latitude: 45.5267,
      longitude: -122.6294,
      locationLabel: "Laurelhurst Park",
      locationPrecision: "EXACT",
      recurrenceRule: "weekly:sunday:12:00",
      rsvpRequired: false,
      natureTag: "GATHERING",
      isPaid: false,
      interestSlugs: ["outdoors", "food"],
    },
    {
      slug: "join-portland-urban-cyclists",
      title: "Portland Urban Cyclists — Now Recruiting",
      description:
        "Looking for a bike community that isn't about racing or expensive gear? We're a mixed-skill group focused on fun, safety, and exploring the city by bike. Rides every Saturday, plus monthly social events.",
      type: "GROUP_SEEKING",
      posterType: "GROUP",
      posterGroupId: bikeClub.id,
      latitude: 45.5231,
      longitude: -122.6765,
      locationLabel: "Portland, OR",
      locationPrecision: "NEIGHBORHOOD",
      rsvpRequired: false,
      natureTag: "ORGANIZATION",
      isPaid: false,
      interestSlugs: ["cycling"],
    },
    {
      slug: "looking-for-hiking-buddy",
      title: "Looking for Weekend Hiking Buddy",
      description:
        "Moved to Portland recently and looking for someone to explore Forest Park and nearby trails. Intermediate pace, happy to plan routes together. Prefer Saturday mornings.",
      type: "LOOKING_FOR",
      posterType: "PERSON",
      posterUserId: todd.id,
      latitude: 45.5122,
      longitude: -122.6587,
      locationLabel: "Portland, OR",
      locationPrecision: "NEIGHBORHOOD",
      rsvpRequired: false,
      natureTag: "INDIVIDUAL",
      isPaid: false,
      interestSlugs: ["outdoors", "fitness"],
    },
    {
      slug: "watercolor-workshop-beginners",
      title: "Watercolor Workshop for Beginners",
      description:
        "Learn basic watercolor techniques in a relaxed group setting. All supplies provided. No experience needed — just curiosity. Hosted in Mira's barn studio. Sliding scale $10–$20 to cover materials.",
      type: "WORKSHOP",
      posterType: "PERSON",
      posterUserId: mira.id,
      latitude: 45.5152,
      longitude: -122.6784,
      locationLabel: "Southeast Portland",
      locationPrecision: "APPROXIMATE",
      startsAt: daysFromNow(10, 14),
      endsAt: daysFromNow(10, 16),
      capacity: 12,
      rsvpRequired: true,
      homeHosted: true,
      natureTag: "INDIVIDUAL",
      isPaid: true,
      priceMin: 10,
      priceMax: 20,
      interestSlugs: ["arts"],
    },
    {
      slug: "roastery-open-mic-night",
      title: "Open Mic Night at Hawthorne Roastery",
      description:
        "Weekly open mic at a neighborhood coffee shop. Sign up at the door at 7pm. Cover supports local musicians and the venue sound system. All ages until 10pm.",
      type: "RECURRING_EVENT",
      posterType: "PERSON",
      posterUserId: sam.id,
      latitude: 45.512,
      longitude: -122.632,
      locationLabel: "Hawthorne Roastery, Portland",
      locationPrecision: "EXACT",
      recurrenceRule: "weekly:friday:19:00",
      capacity: 40,
      rsvpRequired: false,
      natureTag: "BUSINESS",
      isPaid: true,
      priceMin: 5,
      priceMax: 8,
      interestSlugs: ["music"],
    },
    {
      slug: "portland-neighborhood-festival",
      title: "Southeast Portland Neighborhood Festival",
      description:
        "Annual block party with local vendors, live music, kids' activities, and community org booths. Free to attend. Food trucks on site (pay per vendor). Rain or shine.",
      type: "ONE_TIME_EVENT",
      posterType: "ORGANIZATION",
      posterGroupId: riverfront.id,
      latitude: 45.505,
      longitude: -122.65,
      locationLabel: "Sellers City Park, Portland",
      locationPrecision: "EXACT",
      startsAt: daysFromNow(14, 11),
      endsAt: daysFromNow(14, 18),
      rsvpRequired: false,
      natureTag: "LARGE_EVENT",
      isPaid: false,
      interestSlugs: ["food", "music", "volunteering"],
    },
    {
      slug: "makers-meetup-portland",
      title: "Portland Makers Monthly Meetup",
      description:
        "Show-and-tell for local builders, 3D printing enthusiasts, and hobby engineers. Bring a project or just come see what neighbors are working on. Hosted at a community workshop space.",
      type: "RECURRING_EVENT",
      posterType: "PERSON",
      posterUserId: joe.id,
      latitude: 45.518,
      longitude: -122.655,
      locationLabel: "Portland Made Workshop",
      locationPrecision: "EXACT",
      recurrenceRule: "monthly:first:thursday:18:30",
      capacity: 25,
      rsvpRequired: true,
      natureTag: "GATHERING",
      isPaid: false,
      interestSlugs: ["tech"],
    },
    {
      slug: "cape-fear-river-cleanup",
      title: "Cape Fear River Cleanup",
      description:
        "Join neighbors for a morning of litter pickup and trail maintenance along the riverwalk. Gloves and bags provided. Families welcome — kids 10+ with a guardian.",
      type: "VOLUNTEER",
      posterType: "ORGANIZATION",
      posterGroupId: capeFear.id,
      latitude: 35.058,
      longitude: -78.882,
      locationLabel: "Cape Fear River Trail, Fayetteville",
      locationPrecision: "EXACT",
      startsAt: daysFromNow(4, 9),
      endsAt: daysFromNow(4, 12),
      capacity: 40,
      rsvpRequired: true,
      natureTag: "ORGANIZATION",
      isPaid: false,
      interestSlugs: ["volunteering", "outdoors"],
    },
    {
      slug: "fayetteville-farmers-market",
      title: "Downtown Fayetteville Farmers Market",
      description:
        "Local produce, baked goods, and crafts every Saturday morning. Live acoustic music on the pavilion. Leashed dogs welcome.",
      type: "RECURRING_EVENT",
      posterType: "ORGANIZATION",
      posterGroupId: capeFear.id,
      latitude: 35.0527,
      longitude: -78.8784,
      locationLabel: "Downtown Fayetteville",
      locationPrecision: "EXACT",
      recurrenceRule: "weekly:saturday:08:00",
      rsvpRequired: false,
      natureTag: "LARGE_EVENT",
      isPaid: false,
      interestSlugs: ["food", "music"],
    },
    {
      slug: "fayetteville-running-club",
      title: "Fayetteville Running Club — Saturday Group Run",
      description:
        "All paces welcome for a 3–5 mile loop through downtown and the river trail. We regroup at every mile. Post-run coffee optional.",
      type: "RECURRING_EVENT",
      posterType: "PERSON",
      posterUserId: joe.id,
      latitude: 35.055,
      longitude: -78.876,
      locationLabel: "Linear Park, Fayetteville",
      locationPrecision: "EXACT",
      recurrenceRule: "weekly:saturday:07:30",
      capacity: 25,
      rsvpRequired: true,
      natureTag: "GATHERING",
      isPaid: false,
      interestSlugs: ["fitness", "outdoors"],
    },
    {
      slug: "haystreet-open-mic",
      title: "Open Mic at Hay Street Coffee",
      description:
        "Weekly open mic for musicians, poets, and comedians. Sign up at 7pm. Cover supports local artists and the sound system.",
      type: "RECURRING_EVENT",
      posterType: "PERSON",
      posterUserId: sam.id,
      latitude: 35.051,
      longitude: -78.88,
      locationLabel: "Hay Street, Fayetteville",
      locationPrecision: "EXACT",
      recurrenceRule: "weekly:thursday:19:00",
      capacity: 35,
      rsvpRequired: false,
      natureTag: "BUSINESS",
      isPaid: true,
      priceMin: 5,
      priceMax: 5,
      interestSlugs: ["music"],
    },
    {
      slug: "fayetteville-community-festival",
      title: "Fayetteville Community Festival",
      description:
        "Annual celebration with local vendors, kids activities, live bands, and community org booths. Free admission — food trucks on site.",
      type: "ONE_TIME_EVENT",
      posterType: "ORGANIZATION",
      posterGroupId: capeFear.id,
      latitude: 35.049,
      longitude: -78.875,
      locationLabel: "Festival Park, Fayetteville",
      locationPrecision: "EXACT",
      startsAt: daysFromNow(12, 11),
      endsAt: daysFromNow(12, 17),
      rsvpRequired: false,
      natureTag: "LARGE_EVENT",
      isPaid: false,
      interestSlugs: ["food", "music", "volunteering"],
    },
  ];

  const createdListings: Record<string, string> = {};

  for (const listing of listings) {
    const { interestSlugs, ...data } = listing;
    const created = await db.listing.create({
      data: {
        ...data,
        interests: {
          create: interestSlugs.map((slug) => ({ interestId: interestId(slug) })),
        },
      },
    });
    createdListings[listing.slug] = created.id;
  }

  // RSVPs — demonstrate approval flow, going lists, and interested
  await db.rsvp.createMany({
    data: [
      { listingId: createdListings["saturday-morning-urban-ride"], userId: mira.id, status: "GOING", approved: true },
      { listingId: createdListings["saturday-morning-urban-ride"], userId: todd.id, status: "GOING", approved: true },
      { listingId: createdListings["saturday-morning-urban-ride"], userId: sam.id, status: "INTERESTED", approved: true },
      {
        listingId: createdListings["barn-music-night-march"],
        userId: todd.id,
        status: "GOING",
        approved: false,
        message: "Hi Mira! I play guitar and would love to join. First time at the barn.",
      },
      {
        listingId: createdListings["barn-music-night-march"],
        userId: joe.id,
        status: "GOING",
        approved: true,
      },
      { listingId: createdListings["river-cleanup-volunteer"], userId: joe.id, status: "GOING", approved: true },
      { listingId: createdListings["river-cleanup-volunteer"], userId: mira.id, status: "GOING", approved: true },
      { listingId: createdListings["river-cleanup-volunteer"], userId: sam.id, status: "GOING", approved: true },
      { listingId: createdListings["watercolor-workshop-beginners"], userId: joe.id, status: "GOING", approved: true },
      {
        listingId: createdListings["dnd-campaign-sunday"],
        userId: todd.id,
        status: "GOING",
        approved: false,
        message: "New to D&D but eager to learn. Available every Sunday.",
      },
    ],
  });

  // Listing-scoped messages
  await db.message.createMany({
    data: [
      {
        listingId: createdListings["barn-music-night-march"],
        userId: todd.id,
        body: "Is there parking nearby, or should I bike?",
      },
      {
        listingId: createdListings["barn-music-night-march"],
        userId: mira.id,
        body: "Street parking on the lane — biking is great, we have a rack by the barn door.",
      },
      {
        listingId: createdListings["saturday-morning-urban-ride"],
        userId: sam.id,
        body: "What's the average pace? I'm a beginner.",
      },
      {
        listingId: createdListings["saturday-morning-urban-ride"],
        userId: joe.id,
        body: "Leisurely — about 10-12 mph with regroup stops. No one gets left behind!",
      },
      {
        listingId: createdListings["watercolor-workshop-beginners"],
        userId: joe.id,
        body: "Do I need to bring anything, or are all supplies included?",
      },
    ],
  });

  // Host announcements
  await db.announcement.createMany({
    data: [
      {
        listingId: createdListings["river-cleanup-volunteer"],
        hostId: todd.id,
        body: "Forecast looks clear! Wear sturdy shoes and layers. We'll meet at the north parking lot.",
      },
      {
        listingId: createdListings["barn-music-night-march"],
        hostId: mira.id,
        body: "Snacks update: I'll have veggie chili and cornbread. Bring cups if you want coffee or tea.",
      },
    ],
  });


  // Skill offers
  const skillBike = await db.skillOffer.create({
    data: {
      slug: "bike-tune-up-help",
      userId: joe.id,
      title: "Bike tune-up help",
      description: "I will help you adjust brakes, gears, and teach basic maintenance in a park meetup. Bring your bike — tools provided.",
      status: "ACTIVE",
      latitude: 45.5231,
      longitude: -122.6765,
      locationLabel: "Portland, OR",
      radiusMiles: 15,
      priceMin: 0,
      priceMax: 25,
      interests: { create: [{ interestId: interestId("cycling") }] },
    },
  });

  const skillWatercolor = await db.skillOffer.create({
    data: {
      slug: "watercolor-coaching",
      userId: mira.id,
      title: "Beginner watercolor coaching",
      description: "One-on-one or tiny-group watercolor tips in the barn studio. Materials available for a small materials fee.",
      status: "ACTIVE",
      latitude: 45.5152,
      longitude: -122.6784,
      locationLabel: "Southeast Portland",
      radiusMiles: 20,
      priceMin: 15,
      priceMax: 40,
      interests: { create: [{ interestId: interestId("arts") }] },
    },
  });

  await db.skillOffer.create({
    data: {
      slug: "espresso-basics",
      userId: sam.id,
      title: "Home espresso basics",
      description: "Learn dialing-in, milk texture, and tasting notes at the roastery after hours. Great for curious neighbors.",
      status: "ACTIVE",
      latitude: 45.512,
      longitude: -122.632,
      locationLabel: "Hawthorne, Portland",
      radiusMiles: 10,
      priceMin: null,
      priceMax: null,
      interests: {
        create: [{ interestId: interestId("food") }, { interestId: interestId("music") }],
      },
    },
  });

  await db.skillOffer.create({
    data: {
      slug: "volunteer-shift-coaching",
      userId: todd.id,
      title: "Volunteer shift coaching",
      description: "New to organizing cleanups? I will walk you through signup flows, safety briefings, and day-of logistics.",
      status: "ACTIVE",
      latitude: 45.5122,
      longitude: -122.6587,
      locationLabel: "Portland, OR",
      radiusMiles: 25,
      priceMin: 0,
      priceMax: 0,
      interests: { create: [{ interestId: interestId("volunteering") }] },
    },
  });

  // Reputation ledger samples (scores on users already set)
  await db.reputationEvent.createMany({
    data: [
      { subjectUserId: joe.id, actorUserId: mira.id, reason: "VOUCH", points: 8, note: "Reliable ride leader" },
      { subjectUserId: joe.id, reason: "EVENT_HOSTED", points: 10, note: "Saturday urban ride" },
      { subjectUserId: joe.id, reason: "PROFILE_COMPLETED", points: 5 },
      { subjectUserId: mira.id, actorUserId: joe.id, reason: "POSITIVE_FEEDBACK", points: 3, note: "Warm barn host" },
      { subjectUserId: mira.id, reason: "EVENT_HOSTED", points: 10 },
      { subjectUserId: mira.id, skillOfferId: skillWatercolor.id, reason: "SKILL_COMPLETED", points: 5 },
      { subjectUserId: sam.id, reason: "EVENT_HOSTED", points: 10 },
      { subjectUserId: sam.id, actorUserId: todd.id, reason: "POSITIVE_FEEDBACK", points: 3 },
      { subjectUserId: todd.id, reason: "EVENT_COMPLETED", points: 5 },
      { subjectUserId: todd.id, reason: "PROFILE_COMPLETED", points: 5 },
      { subjectUserId: joe.id, skillOfferId: skillBike.id, actorUserId: todd.id, reason: "SKILL_COMPLETED", points: 5 },
    ],
  });

  await db.feedback.createMany({
    data: [
      {
        fromUserId: joe.id,
        toUserId: mira.id,
        listingId: createdListings["barn-music-night-march"],
        rating: 5,
        body: "Cozy space and clear house rules. Felt welcome.",
      },
      {
        fromUserId: todd.id,
        toUserId: joe.id,
        skillOfferId: skillBike.id,
        rating: 5,
        body: "Patient teacher — brakes feel great now.",
      },
    ],
  });

  console.log("Seed complete:");
  console.log("  4 users with slugs + reputation");
  console.log("  3 groups, 16 listings (Portland + Fayetteville, multi-city demo)");
  console.log("  Skill offers, reputation events, feedback, RSVPs, messages");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());