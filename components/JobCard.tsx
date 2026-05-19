// components/JobCard.tsx

import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DeliveryJob } from "@/types/delivery";

interface JobCardProps {
  job:        DeliveryJob;
  onAccept?:  (job: DeliveryJob) => void;  // undefined on history/active views
  isAccepting?: boolean;
}

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

function distanceLabel(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): string {
  // Haversine estimate for display only
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  accepted:   "bg-blue-100 text-blue-700",
  picking_up: "bg-orange-100 text-orange-700",
  picked_up:  "bg-purple-100 text-purple-700",
  in_transit: "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-gray-100 text-gray-500",
  failed:     "bg-red-100 text-red-700",
};

export default function JobCard({ job, onAccept, isAccepting }: JobCardProps) {
  const dist = distanceLabel(
    job.pickupLat, job.pickupLng,
    job.dropoffLat, job.dropoffLng,
  );
  const [bgColor, textColor] = (STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-500").split(" ");

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-neutral-100">

      {/* Header row — earnings + distance + status */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xl font-JakartaBold text-black">
          {formatCurrency(job.deliveryCost, job.currency)}
        </Text>
        <View className="flex-row items-center gap-x-2">
          <View className={`px-2 py-0.5 rounded-full ${bgColor}`}>
            <Text className={`text-xs font-JakartaSemiBold capitalize ${textColor}`}>
              {job.status.replace("_", " ")}
            </Text>
          </View>
          <Text className="text-sm text-gray-400 font-Jakarta">{dist}</Text>
        </View>
      </View>

      {/* Pickup */}
      <View className="flex-row items-start mb-2">
        <Ionicons name="radio-button-on" size={16} color="#0286ff" style={{ marginTop: 2, marginRight: 8 }} />
        <View className="flex-1">
          <Text className="text-xs font-JakartaSemiBold text-gray-400 uppercase tracking-widest mb-0.5">
            Pickup
          </Text>
          <Text className="text-sm font-JakartaSemiBold text-black" numberOfLines={1}>
            {job.pickupName}
          </Text>
          <Text className="text-xs font-Jakarta text-gray-500" numberOfLines={1}>
            {job.pickupAddress}
          </Text>
        </View>
      </View>

      {/* Connector line */}
      <View className="w-0.5 h-4 bg-gray-200 ml-2 mb-2" />

      {/* Dropoff */}
      <View className="flex-row items-start mb-4">
        <Ionicons name="location" size={16} color="#ef4444" style={{ marginTop: 2, marginRight: 8 }} />
        <View className="flex-1">
          <Text className="text-xs font-JakartaSemiBold text-gray-400 uppercase tracking-widest mb-0.5">
            Dropoff
          </Text>
          <Text className="text-sm font-JakartaSemiBold text-black" numberOfLines={1}>
            {job.dropoffName}
          </Text>
          <Text className="text-xs font-Jakarta text-gray-500" numberOfLines={1}>
            {job.dropoffAddress}
          </Text>
        </View>
      </View>

      {/* Accept button — only shown on the jobs queue screen */}
      {onAccept && (
        <TouchableOpacity
          onPress={() => onAccept(job)}
          disabled={isAccepting}
          className={`w-full rounded-full p-3 flex-row justify-center items-center ${
            isAccepting ? "bg-gray-300" : "bg-[#0286ff]"
          }`}
        >
          <Text className="text-white font-JakartaBold text-base">
            {isAccepting ? "Accepting…" : "Accept Job"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
