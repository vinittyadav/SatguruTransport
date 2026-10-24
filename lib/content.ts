import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  fallbackFaqs,
  fallbackIndustries,
  fallbackServices,
  fallbackVehicles,
} from "@/lib/config/content";
import type { Faq, Industry, Service, Vehicle } from "@/types";

async function fetchPublished<T extends { sort_order: number | null }>(
  table: string,
  fallback: T[],
): Promise<T[]> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const { createAdminSupabaseClient } = await import(
      "@/lib/supabase/server"
    );
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return fallback;
    return data as T[];
  } catch {
    // Never let content fetching break a page — fall back to defaults.
    return fallback;
  }
}

export const getServices = cache(async () =>
  fetchPublished<Service>("services", fallbackServices),
);

export const getIndustries = cache(async () =>
  fetchPublished<Industry>("industries", fallbackIndustries),
);

export const getVehicles = cache(async () =>
  fetchPublished<Vehicle>("vehicles", fallbackVehicles),
);

export const getFaqs = cache(async () =>
  fetchPublished<Faq>("faqs", fallbackFaqs),
);
