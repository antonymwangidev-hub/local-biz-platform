export type PostType = "promotion" | "update" | "event";

export interface Post {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  type: PostType;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
}

export const postTypeConfig: Record<PostType, { label: string; color: string; bgClass: string; textClass: string }> = {
  promotion: { label: "Promotion", color: "hsl(36, 100%, 50%)", bgClass: "bg-secondary/15", textClass: "text-secondary" },
  update: { label: "Update", color: "hsl(174, 62%, 28%)", bgClass: "bg-primary/15", textClass: "text-primary" },
  event: { label: "Event", color: "hsl(262, 60%, 50%)", bgClass: "bg-purple-100", textClass: "text-purple-700" },
};

export const samplePosts: Post[] = [
  {
    id: "p1",
    businessId: "1",
    businessName: "Serenity Spa & Salon",
    businessLogo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&q=80",
    type: "promotion",
    content: "🎉 Spring Special! 30% off all facial treatments this week only. Book now and treat yourself to some well-deserved pampering. Limited spots available!",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    likes: 47,
    comments: [
      { id: "c1", userName: "Sarah M.", content: "Just booked mine! Can't wait 💆‍♀️", createdAt: "2026-03-20T14:30:00" },
      { id: "c2", userName: "Emily R.", content: "Love this place! Best facials in town.", createdAt: "2026-03-20T15:10:00" },
    ],
    createdAt: "2026-03-20T10:00:00",
  },
  {
    id: "p2",
    businessId: "2",
    businessName: "The Rustic Table",
    businessLogo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&q=80",
    type: "event",
    content: "🍷 Wine & Dine Night this Friday! Join us for a 5-course tasting menu paired with curated wines from local vineyards. Live jazz music all evening.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    likes: 82,
    comments: [
      { id: "c3", userName: "Michael T.", content: "Already reserved a table for 4! This is going to be amazing.", createdAt: "2026-03-19T18:00:00" },
    ],
    createdAt: "2026-03-19T09:00:00",
  },
  {
    id: "p3",
    businessId: "3",
    businessName: "Peak Performance Gym",
    businessLogo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&q=80",
    type: "update",
    content: "💪 Exciting news! We've just installed brand new Peloton bikes and expanded our cardio zone. Come check out the upgrades and crush your fitness goals!",
    likes: 63,
    comments: [
      { id: "c4", userName: "David W.", content: "The new setup looks incredible! Was there this morning.", createdAt: "2026-03-18T12:00:00" },
      { id: "c5", userName: "Lisa P.", content: "Finally! More bikes 🙌", createdAt: "2026-03-18T13:30:00" },
    ],
    createdAt: "2026-03-18T08:00:00",
  },
  {
    id: "p4",
    businessId: "5",
    businessName: "Green Thumb Landscaping",
    businessLogo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&q=80",
    type: "promotion",
    content: "🌷 Spring planting season is here! Book a garden design consultation this month and get 20% off installation. Let's make your outdoor space bloom!",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    likes: 34,
    comments: [],
    createdAt: "2026-03-17T11:00:00",
  },
  {
    id: "p5",
    businessId: "8",
    businessName: "Pawsitive Care Pet Clinic",
    businessLogo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80",
    type: "event",
    content: "🐾 Free Pet Wellness Day this Saturday! Bring your furry friends for complimentary health checkups, microchipping, and treats. No appointment needed!",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    likes: 95,
    comments: [
      { id: "c6", userName: "Nancy F.", content: "This is amazing! Bringing both my dogs 🐕🐕", createdAt: "2026-03-16T10:00:00" },
      { id: "c7", userName: "Mark L.", content: "Love how you give back to the community!", createdAt: "2026-03-16T11:30:00" },
      { id: "c8", userName: "Amanda C.", content: "Shared with all my pet owner friends!", createdAt: "2026-03-16T14:00:00" },
    ],
    createdAt: "2026-03-16T09:00:00",
  },
  {
    id: "p6",
    businessId: "7",
    businessName: "Capture Moments Photography",
    businessLogo: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=100&q=80",
    type: "update",
    content: "📸 Just wrapped up the most magical spring wedding at the botanical garden! Here's a sneak peek. Full gallery coming soon to our portfolio!",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    likes: 112,
    comments: [
      { id: "c9", userName: "Chris N.", content: "Stunning work as always! 🔥", createdAt: "2026-03-15T16:00:00" },
    ],
    createdAt: "2026-03-15T14:00:00",
  },
  {
    id: "p7",
    businessId: "6",
    businessName: "Harmony Wellness Center",
    businessLogo: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&q=80",
    type: "event",
    content: "🧘 Free Community Yoga in the Park! Join our certified instructors this Sunday at Riverside Park. All levels welcome. Bring your own mat!",
    likes: 58,
    comments: [
      { id: "c10", userName: "Michelle B.", content: "My favorite weekly tradition!", createdAt: "2026-03-14T08:00:00" },
    ],
    createdAt: "2026-03-14T07:00:00",
  },
];
