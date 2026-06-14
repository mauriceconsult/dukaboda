// lib/api.ts — updated with vehicleType in registerRider

import type { DeliveryJob, StatusUpdatePayload, Rider } from "@/types/delivery";

const BASE = process.env.EXPO_PUBLIC_API_URL;

if (!BASE) {
  throw new Error("Missing EXPO_PUBLIC_API_URL");
}

// Add to lib/api.ts

export async function getMyProfile(clerkId: string): Promise<Rider> {
  const res = await fetch(`${BASE}/api/riders/me?clerkId=${clerkId}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXPO_PUBLIC_PLATFORM_API_KEY ?? "",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
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

const text = await res.text();

let data: any = null;

try {
  data = text ? JSON.parse(text) : null;
} catch {
  console.error("STATUS:", res.status);
  console.error("URL:", `${BASE}${path}`);
  console.error("BODY:", text);
  console.log("API URL:", BASE);

  throw new Error(`Server returned invalid response (${res.status})`);
}

if (!res.ok) {
  throw new Error(
    data?.error ?? data?.message ?? `Request failed: ${res.status}`,
  );
}

return data as T;
}

// ── Rider registration / profile ──────────────────────────────────────────────


export async function registerRider(
  data: {
    name: string;
    phone: string;
    email: string;
    vehicleType: string;
  },
  clerkId: string,
): Promise<Rider> {
  const res = await fetch(`${BASE}/api/riders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXPO_PUBLIC_PLATFORM_API_KEY ?? "",
    },
    body: JSON.stringify({
      ...data,
      clerkId,
    }),
  });
  console.log("received key:", res.headers.get("x-api-key")?.substring(0, 8));
  console.log("expected key:", process.env.PLATFORM_API_KEY?.substring(0, 8));
  

if (!res.ok) {
  const err = await res.json().catch(() => null);

  throw new Error(
    (err as { error?: string; message?: string } | null)?.error ??
      (err as { error?: string; message?: string } | null)?.message ??
      `Request failed: ${res.status}`,
  );
}
  return res.json();
}

// ── Job queue ─────────────────────────────────────────────────────────────────

export async function getAvailableJobs(token: string): Promise<DeliveryJob[]> {
  return request<DeliveryJob[]>("/api/delivery/jobs?status=pending", token);
}

export async function getMyJobs(token: string): Promise<DeliveryJob[]> {
  return request<DeliveryJob[]>("/api/delivery/jobs/mine", token);
}

export async function acceptJob(
  token: string,
  jobId: string,
): Promise<DeliveryJob> {
  return request<DeliveryJob>(`/api/delivery/jobs/${jobId}/accept`, token, {
    method: "PATCH",
  });
}

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

// ── Documents ─────────────────────────────────────────────────────────────────

export async function downloadStudioStrategy(token: string) {
  const res = await fetch(`${BASE}/api/documents/studio-strategy`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to download document");
  }

  return res.blob();
}
