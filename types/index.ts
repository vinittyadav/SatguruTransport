// Shared domain types for Satguru Transport.
// `database.ts` (generated via `npm run db:types`) extends these for Supabase rows.

export type PublishStatus = "draft" | "published";

export interface Service {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string | null;
  icon: string; // lucide icon name, resolved client-side
  features: string[];
  sort_order: number;
  status: PublishStatus;
  created_at?: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  category: VehicleCategory;
  title: string;
  capacity: string | null;
  cargo_suitability: string | null;
  availability: VehicleAvailability;
  description: string | null;
  color: string; // hex, used by the 3D showroom
  vehicle_number?: string | null;
  driver_id?: string | null;
  registration_expiry?: string | null;
  insurance_expiry?: string | null;
  sort_order: number;
  status: PublishStatus;
  created_at?: string;
}

export type VehicleCategory =
  | "heavy"
  | "medium"
  | "light"
  | "specialized";

export type VehicleAvailability =
  | "available"
  | "assigned"
  | "in_transit"
  | "maintenance"
  | "inactive"
  | "on_request" // legacy show-room value (seeded category rows)
  | "unavailable"; // legacy show-room value

export interface VehicleOperations {
  vehicle_number: string | null;
  driver_id: string | null;
  registration_expiry: string | null;
  insurance_expiry: string | null;
}

export interface Industry {
  id: string;
  slug: string;
  title: string;
  challenge: string;
  solution: string;
  icon: string;
  sort_order: number;
  status: PublishStatus;
  created_at?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  status: PublishStatus;
  created_at?: string;
}

export interface QuoteRequest {
  id: string;
  reference_code: string;
  company_name: string | null;
  contact_name: string;
  email: string;
  phone: string;
  origin_city: string;
  destination_city: string;
  cargo_description: string;
  cargo_weight_kg: number | null;
  vehicle_preference: string | null;
  service_type: string | null;
  preferred_pickup_date: string | null;
  notes: string | null;
  status: QuoteStatus;
  created_at: string;
  updated_at?: string;
}

export type QuoteStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "quoted"
  | "confirmed"
  | "won"
  | "lost";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactStatus;
  created_at: string;
}

export type ContactStatus = "new" | "read" | "replied" | "closed";

export interface Shipment {
  id: string;
  tracking_code: string;
  customer_name: string | null;
  origin_city: string;
  destination_city: string;
  status: ShipmentStatus;
  current_location: string | null;
  notes: string | null;
  estimated_delivery: string | null;
  quote_id: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  driver_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus =
  | "booked"
  | "picked_up"
  | "in_transit"
  | "at_destination"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  location: string | null;
  note: string | null;
  occurred_at: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
  status: DriverStatus;
  created_at: string;
}

export type DriverStatus = "active" | "on_leave" | "inactive";

export interface Customer {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "staff";
  created_at: string;
}
