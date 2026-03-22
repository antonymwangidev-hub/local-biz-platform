export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  description: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  shortDescription: string;
  image: string;
  logo: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: Record<string, string>;
  services: Service[];
  reviews: Review[];
  lat: number;
  lng: number;
}

export const categories = [
  "All",
  "Salon & Spa",
  "Restaurant",
  "Fitness",
  "Auto Service",
  "Home Services",
  "Health & Wellness",
  "Photography",
  "Pet Care",
];

export const sampleBusinesses: Business[] = [
  {
    id: "1",
    name: "Serenity Spa & Salon",
    slug: "serenity-spa-salon",
    category: "Salon & Spa",
    description: "Serenity Spa & Salon is a premium beauty destination offering a full range of hair, skin, and relaxation services. Our team of expert stylists and therapists are dedicated to helping you look and feel your best in a tranquil, luxurious setting.",
    shortDescription: "Premium beauty & relaxation services in a tranquil setting.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&q=80",
    rating: 4.8,
    reviewCount: 124,
    address: "123 Main Street, Downtown",
    phone: "(555) 123-4567",
    email: "hello@serenityspa.com",
    website: "www.serenityspa.com",
    hours: { Mon: "9AM–7PM", Tue: "9AM–7PM", Wed: "9AM–7PM", Thu: "9AM–8PM", Fri: "9AM–8PM", Sat: "10AM–6PM", Sun: "Closed" },
    services: [
      { id: "s1", name: "Haircut & Styling", price: 65, duration: 60, description: "Professional haircut with wash and style" },
      { id: "s2", name: "Deep Tissue Massage", price: 90, duration: 60, description: "Therapeutic massage targeting deep muscle tension" },
      { id: "s3", name: "Facial Treatment", price: 75, duration: 45, description: "Rejuvenating facial with premium skincare products" },
    ],
    reviews: [
      { id: "r1", customerName: "Sarah M.", rating: 5, comment: "Absolutely love this place! The staff is wonderful and the atmosphere is so relaxing.", date: "2024-12-15" },
      { id: "r2", customerName: "Emily R.", rating: 5, comment: "Best massage I've ever had. Will definitely be coming back!", date: "2024-11-20" },
      { id: "r3", customerName: "Jessica L.", rating: 4, comment: "Great haircut, very professional service.", date: "2024-10-08" },
    ],
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: "2",
    name: "The Rustic Table",
    slug: "the-rustic-table",
    category: "Restaurant",
    description: "The Rustic Table brings farm-to-table dining to your neighborhood. We source ingredients from local farms to create seasonal menus that celebrate the best flavors of each region. Join us for an unforgettable dining experience.",
    shortDescription: "Farm-to-table dining with seasonal, locally-sourced menus.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&q=80",
    rating: 4.6,
    reviewCount: 89,
    address: "456 Oak Avenue, Midtown",
    phone: "(555) 234-5678",
    email: "reservations@rustictable.com",
    website: "www.rustictable.com",
    hours: { Mon: "Closed", Tue: "11AM–10PM", Wed: "11AM–10PM", Thu: "11AM–10PM", Fri: "11AM–11PM", Sat: "10AM–11PM", Sun: "10AM–9PM" },
    services: [
      { id: "s4", name: "Table Reservation", price: 0, duration: 120, description: "Reserve a table for your party" },
      { id: "s5", name: "Private Dining", price: 500, duration: 180, description: "Exclusive private dining room for special occasions" },
      { id: "s6", name: "Catering Service", price: 250, duration: 0, description: "Full catering for your events, starting price" },
    ],
    reviews: [
      { id: "r4", customerName: "Michael T.", rating: 5, comment: "The food is incredible. Every dish tells a story.", date: "2024-12-01" },
      { id: "r5", customerName: "Anna K.", rating: 4, comment: "Beautiful ambiance and great service. Slightly pricey but worth it.", date: "2024-11-15" },
    ],
    lat: 40.7589,
    lng: -73.9851,
  },
  {
    id: "3",
    name: "Peak Performance Gym",
    slug: "peak-performance-gym",
    category: "Fitness",
    description: "Peak Performance Gym is your ultimate fitness destination. With state-of-the-art equipment, certified personal trainers, and a variety of group classes, we help you achieve your fitness goals in a motivating environment.",
    shortDescription: "State-of-the-art fitness with personal training & group classes.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&q=80",
    rating: 4.7,
    reviewCount: 203,
    address: "789 Fitness Blvd, Uptown",
    phone: "(555) 345-6789",
    email: "info@peakperformance.com",
    website: "www.peakperformancegym.com",
    hours: { Mon: "5AM–10PM", Tue: "5AM–10PM", Wed: "5AM–10PM", Thu: "5AM–10PM", Fri: "5AM–9PM", Sat: "7AM–7PM", Sun: "8AM–5PM" },
    services: [
      { id: "s7", name: "Personal Training Session", price: 80, duration: 60, description: "One-on-one session with a certified trainer" },
      { id: "s8", name: "Group Fitness Class", price: 25, duration: 45, description: "High-energy group workout sessions" },
      { id: "s9", name: "Monthly Membership", price: 59, duration: 0, description: "Full access to all facilities and classes" },
    ],
    reviews: [
      { id: "r6", customerName: "David W.", rating: 5, comment: "Best gym in the area. Trainers are top-notch!", date: "2024-12-10" },
      { id: "r7", customerName: "Lisa P.", rating: 5, comment: "Love the group classes. Great community vibe.", date: "2024-11-25" },
      { id: "r8", customerName: "Tom H.", rating: 4, comment: "Clean facilities, good equipment. Gets crowded at peak hours.", date: "2024-10-30" },
    ],
    lat: 40.7831,
    lng: -73.9712,
  },
  {
    id: "4",
    name: "AutoCare Pro",
    slug: "autocare-pro",
    category: "Auto Service",
    description: "AutoCare Pro provides comprehensive automotive services from routine maintenance to complex repairs. Our ASE-certified technicians use the latest diagnostic tools to keep your vehicle running smoothly and safely.",
    shortDescription: "Trusted automotive care from certified professionals.",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&q=80",
    rating: 4.5,
    reviewCount: 67,
    address: "321 Mechanic Way, Eastside",
    phone: "(555) 456-7890",
    email: "service@autocarepro.com",
    website: "www.autocarepro.com",
    hours: { Mon: "7AM–6PM", Tue: "7AM–6PM", Wed: "7AM–6PM", Thu: "7AM–6PM", Fri: "7AM–6PM", Sat: "8AM–3PM", Sun: "Closed" },
    services: [
      { id: "s10", name: "Oil Change", price: 45, duration: 30, description: "Full synthetic oil change with filter" },
      { id: "s11", name: "Brake Inspection", price: 0, duration: 30, description: "Complimentary brake system inspection" },
      { id: "s12", name: "Full Vehicle Inspection", price: 120, duration: 90, description: "Comprehensive 50-point vehicle inspection" },
    ],
    reviews: [
      { id: "r9", customerName: "Robert J.", rating: 5, comment: "Honest and reliable. They don't try to upsell unnecessary services.", date: "2024-12-05" },
      { id: "r10", customerName: "Karen S.", rating: 4, comment: "Quick service and fair prices.", date: "2024-11-10" },
    ],
    lat: 40.7282,
    lng: -73.7949,
  },
  {
    id: "5",
    name: "Green Thumb Landscaping",
    slug: "green-thumb-landscaping",
    category: "Home Services",
    description: "Green Thumb Landscaping transforms outdoor spaces into beautiful, functional landscapes. From design to maintenance, our experienced team creates stunning gardens, patios, and outdoor living areas tailored to your vision.",
    shortDescription: "Expert landscaping & garden design for beautiful outdoor spaces.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&q=80",
    rating: 4.9,
    reviewCount: 156,
    address: "555 Garden Lane, Westside",
    phone: "(555) 567-8901",
    email: "info@greenthumblc.com",
    website: "www.greenthumblc.com",
    hours: { Mon: "7AM–5PM", Tue: "7AM–5PM", Wed: "7AM–5PM", Thu: "7AM–5PM", Fri: "7AM–5PM", Sat: "8AM–2PM", Sun: "Closed" },
    services: [
      { id: "s13", name: "Lawn Maintenance", price: 75, duration: 60, description: "Weekly mowing, edging, and cleanup" },
      { id: "s14", name: "Garden Design", price: 300, duration: 120, description: "Custom garden design consultation" },
      { id: "s15", name: "Patio Installation", price: 2500, duration: 0, description: "Custom patio design and installation, starting price" },
    ],
    reviews: [
      { id: "r11", customerName: "Patricia D.", rating: 5, comment: "They transformed our backyard into an oasis. Absolutely stunning work!", date: "2024-12-12" },
      { id: "r12", customerName: "James M.", rating: 5, comment: "Professional, punctual, and the results speak for themselves.", date: "2024-11-28" },
    ],
    lat: 40.7484,
    lng: -73.9967,
  },
  {
    id: "6",
    name: "Harmony Wellness Center",
    slug: "harmony-wellness-center",
    category: "Health & Wellness",
    description: "Harmony Wellness Center offers a holistic approach to health with services including acupuncture, chiropractic care, nutritional counseling, and yoga. Our practitioners work together to create personalized wellness plans.",
    shortDescription: "Holistic health services for mind, body, and spirit.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&q=80",
    rating: 4.7,
    reviewCount: 98,
    address: "888 Wellness Drive, Northside",
    phone: "(555) 678-9012",
    email: "wellness@harmonycenter.com",
    website: "www.harmonywellness.com",
    hours: { Mon: "8AM–7PM", Tue: "8AM–7PM", Wed: "8AM–7PM", Thu: "8AM–8PM", Fri: "8AM–6PM", Sat: "9AM–4PM", Sun: "Closed" },
    services: [
      { id: "s16", name: "Acupuncture Session", price: 95, duration: 60, description: "Traditional acupuncture treatment" },
      { id: "s17", name: "Chiropractic Adjustment", price: 70, duration: 30, description: "Spinal alignment and adjustment" },
      { id: "s18", name: "Yoga Class", price: 20, duration: 60, description: "Guided yoga session for all levels" },
    ],
    reviews: [
      { id: "r13", customerName: "Michelle B.", rating: 5, comment: "The acupuncture has been life-changing for my chronic pain.", date: "2024-12-08" },
      { id: "r14", customerName: "Steven G.", rating: 4, comment: "Great yoga classes. Peaceful and welcoming environment.", date: "2024-11-18" },
    ],
    lat: 40.7614,
    lng: -73.9776,
  },
  {
    id: "7",
    name: "Capture Moments Photography",
    slug: "capture-moments-photography",
    category: "Photography",
    description: "Capture Moments Photography specializes in wedding, portrait, and event photography. Our award-winning photographers blend artistry with storytelling to create images that you'll treasure for a lifetime.",
    shortDescription: "Award-winning wedding, portrait & event photography.",
    image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=100&q=80",
    rating: 4.9,
    reviewCount: 78,
    address: "222 Studio Row, Arts District",
    phone: "(555) 789-0123",
    email: "book@capturemoments.com",
    website: "www.capturemoments.com",
    hours: { Mon: "By Appointment", Tue: "10AM–6PM", Wed: "10AM–6PM", Thu: "10AM–6PM", Fri: "10AM–6PM", Sat: "9AM–5PM", Sun: "By Appointment" },
    services: [
      { id: "s19", name: "Portrait Session", price: 200, duration: 60, description: "Professional portrait photography session" },
      { id: "s20", name: "Wedding Package", price: 3500, duration: 480, description: "Full-day wedding photography coverage" },
      { id: "s21", name: "Event Photography", price: 500, duration: 180, description: "Professional event photography, 3-hour minimum" },
    ],
    reviews: [
      { id: "r15", customerName: "Amanda C.", rating: 5, comment: "Our wedding photos are absolutely breathtaking. Worth every penny!", date: "2024-12-03" },
      { id: "r16", customerName: "Chris N.", rating: 5, comment: "Professional and creative. The portraits exceeded our expectations.", date: "2024-11-22" },
    ],
    lat: 40.7193,
    lng: -73.9987,
  },
  {
    id: "8",
    name: "Pawsitive Care Pet Clinic",
    slug: "pawsitive-care-pet-clinic",
    category: "Pet Care",
    description: "Pawsitive Care Pet Clinic provides compassionate veterinary care for your beloved pets. From routine checkups to emergency care, our experienced veterinarians and caring staff treat every pet like family.",
    shortDescription: "Compassionate veterinary care for your beloved pets.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80",
    rating: 4.8,
    reviewCount: 145,
    address: "444 Pet Lane, Southside",
    phone: "(555) 890-1234",
    email: "care@pawsitiveclinic.com",
    website: "www.pawsitiveclinic.com",
    hours: { Mon: "8AM–6PM", Tue: "8AM–6PM", Wed: "8AM–6PM", Thu: "8AM–7PM", Fri: "8AM–6PM", Sat: "9AM–3PM", Sun: "Emergency Only" },
    services: [
      { id: "s22", name: "Wellness Checkup", price: 55, duration: 30, description: "Comprehensive pet health examination" },
      { id: "s23", name: "Vaccination Package", price: 120, duration: 20, description: "Core vaccinations and booster shots" },
      { id: "s24", name: "Grooming Service", price: 65, duration: 60, description: "Full grooming including bath, trim, and nail clipping" },
    ],
    reviews: [
      { id: "r17", customerName: "Nancy F.", rating: 5, comment: "Dr. Chen is amazing with our anxious dog. So gentle and patient!", date: "2024-12-14" },
      { id: "r18", customerName: "Mark L.", rating: 5, comment: "Fair prices and excellent care. Our whole family trusts Pawsitive.", date: "2024-11-30" },
    ],
    lat: 40.7061,
    lng: -74.0087,
  },
];
