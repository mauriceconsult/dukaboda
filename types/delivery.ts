// types/delivery.ts

export type DeliveryStep =
  | "pending"      // job posted, no rider yet
  | "accepted"     // rider accepted, heading to shop
  | "picking_up"   // rider at shop, collecting package
  | "picked_up"    // package collected, heading to customer
  | "in_transit"   // on the way
  | "delivered"    // completed
  | "cancelled"    // cancelled by shop or admin
  | "failed";      // could not complete

export interface DeliveryJob {
  id:            string;
  orderId:       string;
  status:        DeliveryStep;

  // Pickup — the shop
  pickupAddress:  string;
  pickupLat:      number;
  pickupLng:      number;
  pickupName:     string;   // shop name
  pickupPhone:    string;

  // Dropoff — the customer
  dropoffAddress: string;
  dropoffLat:     number;
  dropoffLng:     number;
  dropoffName:    string;
  dropoffPhone:   string;

  // Earnings
  deliveryCost:   number;
  currency:       string;

  // Timing
  createdAt:      string;
  acceptedAt?:    string;
  deliveredAt?:   string;

  // Tracking
  trackingUrl?:   string;
}

export interface Rider {
  id:           string;
  clerkId:      string;
  name:         string;
  phone:        string;
  email:        string;
  isActive:     boolean;    // available to take jobs
  rating:       number;
  totalJobs:    number;
  createdAt:    string;
}

export type RiderStatus = "available" | "busy" | "offline";

// What the rider app sends when updating job status
export interface StatusUpdatePayload {
  status: DeliveryStep;
  lat?:   number;
  lng?:   number;
}
