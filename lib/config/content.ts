// Fallback content used when the Supabase tables are empty or unavailable.
// This keeps every page functional in demo mode. All of it is editable in
// the admin panel once the database is connected.

import type { Faq, Industry, Service, Vehicle } from "@/types";

export const fallbackServices: Service[] = [
  {
    id: "ftl",
    slug: "full-truckload",
    title: "Full Truckload Transportation",
    short_description:
      "Dedicated vehicles for point-to-point movement of your commercial cargo.",
    description:
      "A dedicated vehicle for your shipment, moving directly from pickup to destination without consolidation. Suited for larger loads that need the full capacity of a truck.",
    icon: "Truck",
    features: [
      "Dedicated vehicle for your load",
      "Direct point-to-point routing",
      "Suitable for heavy and bulky cargo",
    ],
    sort_order: 1,
    status: "published",
  },
  {
    id: "ptl",
    slug: "part-load",
    title: "Part Load Transportation",
    short_description:
      "Cost-efficient transport when your shipment doesn't need a full vehicle.",
    description:
      "Share vehicle space with compatible cargo moving along the same corridor. A cost-efficient option for smaller commercial shipments.",
    icon: "Boxes",
    features: [
      "Pay for the space you use",
      "Consolidated along shared corridors",
      "Scheduled departures",
    ],
    sort_order: 2,
    status: "published",
  },
  {
    id: "dedicated",
    slug: "dedicated-transportation",
    title: "Dedicated Transportation",
    short_description:
      "Vehicles assigned to your operation on an ongoing basis.",
    description:
      "Reserve vehicles for recurring or contract-based movement. Built for businesses that need guaranteed capacity on regular routes.",
    icon: "Repeat",
    features: [
      "Recurring route capacity",
      "Priority scheduling",
      "Consistent vehicle assignment",
    ],
    sort_order: 3,
    status: "published",
  },
  {
    id: "industrial",
    slug: "industrial-transportation",
    title: "Industrial Transportation",
    short_description:
      "Movement of industrial goods, machinery and plant materials.",
    description:
      "Transport for manufacturing inputs, machinery components and industrial equipment, planned around site requirements.",
    icon: "Factory",
    features: [
      "Machinery and plant material movement",
      "Site-coordinated pickups",
      "Load planning support",
    ],
    sort_order: 4,
    status: "published",
  },
  {
    id: "commercial",
    slug: "commercial-goods",
    title: "Commercial Goods Transportation",
    short_description:
      "Dependable movement for retail and trade cargo across the region.",
    description:
      "Reliable movement of commercial goods for traders, distributors and retail businesses.",
    icon: "PackageCheck",
    features: [
      "Retail and trade cargo",
      "Flexible scheduling",
      "Careful handling standards",
    ],
    sort_order: 5,
    status: "published",
  },
  {
    id: "fleet-solutions",
    slug: "fleet-solutions",
    title: "Fleet Solutions",
    short_description:
      "Vehicle capacity arranged around your business operation.",
    description:
      "Access vehicle capacity as your operation requires — per trip, per route, or per period — without maintaining your own fleet.",
    icon: "LayoutGrid",
    features: [
      "Capacity on demand",
      "Route-based arrangements",
      "Operational support",
    ],
    sort_order: 6,
    status: "published",
  },
  {
    id: "long-distance",
    slug: "long-distance",
    title: "Long-Distance Transportation",
    short_description: "Intercity and interstate movement of commercial cargo.",
    description:
      "Planned long-haul movement between cities and states, with realistic transit expectations communicated upfront.",
    icon: "Route",
    features: [
      "Intercity and interstate routes",
      "Planned transit schedules",
      "Status communication",
    ],
    sort_order: 7,
    status: "published",
  },
  {
    id: "logistics-coordination",
    slug: "logistics-coordination",
    title: "Logistics Coordination",
    short_description:
      "One point of contact for multi-leg or multi-vehicle movements.",
    description:
      "Coordination of vehicles, schedules and handoffs for movements that involve more than one leg — so your team talks to one person, not five.",
    icon: "Workflow",
    features: [
      "Single point of contact",
      "Multi-leg planning",
      "Schedule synchronization",
    ],
    sort_order: 8,
    status: "published",
  },
];

export const fallbackIndustries: Industry[] = [
  {
    id: "manufacturing",
    slug: "manufacturing",
    title: "Manufacturing",
    challenge:
      "Production lines stall when raw material and finished-goods movement is unpredictable.",
    solution:
      "Scheduled vehicle capacity and direct routing to keep plants supplied and dispatches moving.",
    icon: "Factory",
    sort_order: 1,
    status: "published",
  },
  {
    id: "automotive",
    slug: "automotive",
    title: "Automotive",
    challenge:
      "Components and spare parts must arrive in sequence and on time to avoid line-down events.",
    solution:
      "Dedicated vehicles with careful handling and planned pickup windows for parts movement.",
    icon: "Car",
    sort_order: 2,
    status: "published",
  },
  {
    id: "construction",
    slug: "construction",
    title: "Construction",
    challenge:
      "Materials are heavy, sites are remote, and delays cascade across the project schedule.",
    solution:
      "Heavy vehicles and site-coordinated delivery planned around project timelines.",
    icon: "HardHat",
    sort_order: 3,
    status: "published",
  },
  {
    id: "retail",
    slug: "retail",
    title: "Retail",
    challenge:
      "Stores need frequent, reliable replenishment without over-ordering stock.",
    solution:
      "Part-load and scheduled distribution options that match store replenishment cycles.",
    icon: "Store",
    sort_order: 4,
    status: "published",
  },
  {
    id: "fmcg",
    slug: "fmcg",
    title: "FMCG",
    challenge:
      "High volumes and tight windows leave no room for missed pickups.",
    solution:
      "Consistent capacity and responsive communication for fast-moving consumer goods.",
    icon: "ShoppingCart",
    sort_order: 5,
    status: "published",
  },
  {
    id: "industrial-equipment",
    slug: "industrial-equipment",
    title: "Industrial Equipment",
    challenge:
      "Oversized and sensitive equipment needs the right vehicle and careful load planning.",
    solution:
      "Vehicle selection matched to the load, with coordination from pickup to placement.",
    icon: "Wrench",
    sort_order: 6,
    status: "published",
  },
  {
    id: "agriculture",
    slug: "agriculture",
    title: "Agriculture",
    challenge:
      "Seasonal peaks demand flexible capacity and produce needs timely movement.",
    solution:
      "Seasonal capacity arrangements with priority scheduling during harvest windows.",
    icon: "Wheat",
    sort_order: 7,
    status: "published",
  },
  {
    id: "ecommerce",
    slug: "ecommerce",
    title: "E-commerce",
    challenge:
      "Order volumes fluctuate and fulfillment depends on dependable linehaul capacity.",
    solution:
      "Flexible linehaul capacity between warehouses and distribution points.",
    icon: "ShoppingBag",
    sort_order: 8,
    status: "published",
  },
];

export const fallbackVehicles: Vehicle[] = [
  {
    id: "heavy-truck",
    slug: "heavy-truck",
    category: "heavy",
    title: "Heavy Trucks",
    capacity: null,
    cargo_suitability: null,
    availability: "on_request",
    description:
      "Full-size commercial trucks for heavy and long-haul loads. Specifications to be configured.",
    color: "#f5a623",
    sort_order: 1,
    status: "published",
  },
  {
    id: "medium-truck",
    slug: "medium-truck",
    category: "medium",
    title: "Medium Trucks",
    capacity: null,
    cargo_suitability: null,
    availability: "on_request",
    description:
      "Versatile mid-size trucks for regional distribution. Specifications to be configured.",
    color: "#d97b29",
    sort_order: 2,
    status: "published",
  },
  {
    id: "lcv",
    slug: "light-commercial",
    category: "light",
    title: "Light Commercial Vehicles",
    capacity: null,
    cargo_suitability: null,
    availability: "on_request",
    description:
      "Nimble vehicles for city deliveries and smaller loads. Specifications to be configured.",
    color: "#8b99ac",
    sort_order: 3,
    status: "published",
  },
  {
    id: "specialized",
    slug: "specialized",
    category: "specialized",
    title: "Specialized Vehicles",
    capacity: null,
    cargo_suitability: null,
    availability: "on_request",
    description:
      "Vehicles configured for specific cargo requirements. Specifications to be configured.",
    color: "#4f8ef7",
    sort_order: 4,
    status: "published",
  },
];

export const fallbackFaqs: Faq[] = [
  {
    id: "faq-1",
    question: "Which routes does Satguru Transport operate?",
    answer:
      "We operate transportation services across Maharashtra, with intercity and interstate capability depending on the load. Contact us with your route and we will confirm what we can operate.",
    sort_order: 1,
    status: "published",
  },
  {
    id: "faq-2",
    question: "How do I get a price for my shipment?",
    answer:
      "Submit the quote form with your route, cargo and timing. We respond with a tailored quote — there is no generic pricing because every load is different.",
    sort_order: 2,
    status: "published",
  },
  {
    id: "faq-3",
    question: "Can I track my shipment?",
    answer:
      "Yes. Once your shipment is booked you receive a tracking code. Enter it on the Tracking page to see the current status and history of milestones.",
    sort_order: 3,
    status: "published",
  },
  {
    id: "faq-4",
    question: "What information do you need to arrange a vehicle?",
    answer:
      "Pickup and destination, cargo description and approximate weight, preferred date, and any vehicle preference. The quote form collects all of this.",
    sort_order: 4,
    status: "published",
  },
  {
    id: "faq-5",
    question: "Do you handle part loads, or only full vehicles?",
    answer:
      "Both. Full truckload moves your cargo on a dedicated vehicle; part load consolidates compatible cargo along the same corridor to reduce cost.",
    sort_order: 5,
    status: "published",
  },
  {
    id: "faq-6",
    question: "How far in advance should I book?",
    answer:
      "For planned loads, a few days' notice lets us assign the right vehicle. For urgent requirements, contact us directly and we will confirm availability.",
    sort_order: 6,
    status: "published",
  },
];

export const fallbackValuePillars = [
  {
    icon: "ShieldCheck",
    title: "Reliable Operations",
    description:
      "Planned dispatches, maintained vehicles and direct routing — so commitments made are commitments kept.",
  },
  {
    icon: "Truck",
    title: "Professional Fleet",
    description:
      "Vehicles selected and prepared for the cargo they carry, from light commercial to heavy trucks.",
  },
  {
    icon: "MessagesSquare",
    title: "Responsive Communication",
    description:
      "A person who answers, status updates when they matter, and no chasing for information.",
  },
  {
    icon: "Briefcase",
    title: "Business-Focused Service",
    description:
      "Transport arranged around your production schedules, dispatch windows and cost targets.",
  },
];
