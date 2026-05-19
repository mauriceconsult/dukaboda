// lib/api.ts
//
// All calls go to the Vendly backend.
// EXPO_PUBLIC_API_URL = https://vendly.maxnovate.com

import { useAuth } from "@clerk/clerk-expo";
import type { DeliveryJob, StatusUpdatePayload, Rider } from "@/types/delivery";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://vendly.maxnovate.com";

// ── Auth header helper ────────────────────────────────────────────────────────
// Call getToken() from Clerk inside each request so the token is always fresh.

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Rider registration / profile ──────────────────────────────────────────────

export async function registerRider(
  token: string,
  data: { name: string; phone: string; email: string },
): Promise<Rider> {
  return request<Rider>("/api/riders", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyProfile(token: string): Promise<Rider> {
  return request<Rider>("/api/riders/me", token);
}

export async function updateRiderStatus(
  token: string,
  isActive: boolean,
): Promise<Rider> {
  return request<Rider>("/api/riders/me/status", token, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

// ── Job queue ─────────────────────────────────────────────────────────────────

// Available jobs — rider sees these and can accept one
export async function getAvailableJobs(token: string): Promise<DeliveryJob[]> {
  return request<DeliveryJob[]>("/api/delivery/jobs?status=pending", token);
}

// Jobs assigned to this rider
export async function getMyJobs(token: string): Promise<DeliveryJob[]> {
  return request<DeliveryJob[]>("/api/delivery/jobs/mine", token);
}

// Accept a job — assigns it to this rider
export async function acceptJob(
  token: string,
  jobId: string,
): Promise<DeliveryJob> {
  return request<DeliveryJob>(`/api/delivery/jobs/${jobId}/accept`, token, {
    method: "PATCH",
  });
}

// Update delivery status (picking_up → picked_up → delivered etc.)
export async function updateJobStatus(
  token: string,
  jobId: string,
  payload: StatusUpdatePayload,
): Promise<DeliveryJob> {
  return request<DeliveryJob>(`/api/delivery/jobs/${jobId}/status`, token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ── History ───────────────────────────────────────────────────────────────────

export async function getJobHistory(token: string): Promise<DeliveryJob[]> {
  return request<DeliveryJob[]>(
    "/api/delivery/jobs/mine?status=delivered",
    token,
  );
}
