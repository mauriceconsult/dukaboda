// types/delivery.ts

export type DeliveryStep =
  | "pending"
  | "accepted"
  | "picking_up"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "failed";

export type VehicleType = "motorcycle" | "bicycle" | "car";

export interface DeliveryJob {
  id:            string;
  orderId:       string;
  status:        DeliveryStep;
  pickupAddress:  string;
  pickupLat:      number;
  pickupLng:      number;
  pickupName:     string;
  pickupPhone:    string;
  dropoffAddress: string;
  dropoffLat:     number;
  dropoffLng:     number;
  dropoffName:    string;
  dropoffPhone:   string;
  deliveryCost:   number;
  currency:       string;
  createdAt:      string;
  acceptedAt?:    string;
  deliveredAt?:   string;
  trackingUrl?:   string;
}

export interface Rider {
  id:          string;
  clerkId:     string;
  name:        string;
  phone:       string;
  email:       string;
  vehicleType: VehicleType;
  isApproved:  boolean;       // ← set by shop owner
  isActive:    boolean;       // ← rider toggles availability
  rating:      number;
  totalJobs:   number;
  createdAt:   string;
}

export type RiderState = "loading" | "not_registered" | "pending" | "approved";

export interface StatusUpdatePayload {
  status: DeliveryStep;
  lat?:   number;
  lng?:   number;
}
