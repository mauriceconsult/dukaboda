// app/(root)/(tabs)/active.tsx
//
// Shows the rider's current in-progress job.
// Polls every 10s in case the job is cancelled server-side.
// Rider advances status via StatusStepper.

import {
  View,
  Text,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import StatusStepper from "@/components/StatusStepper";
import JobCard from "@/components/JobCard";
import { useJobPolling } from "@/lib/useJobPolling";
import { getMyJobs, updateJobStatus } from "@/lib/api";
import type { DeliveryJob, DeliveryStep } from "@/types/delivery";

const ACTIVE_STATUSES: DeliveryStep[] = [
  "accepted",
  "picking_up",
  "picked_up",
  "in_transit",
];

export default function ActiveScreen() {
  const { getToken }               = useAuth();
  const [isUpdating, setUpdating]  = useState(false);

  const { jobs, loading, refetch } = useJobPolling(getMyJobs);

  // Only one active job at a time
  const activeJob: DeliveryJob | undefined = jobs.find((j) =>
    ACTIVE_STATUSES.includes(j.status),
  );

  const handleAdvance = useCallback(
    async (nextStatus: DeliveryStep) => {
      if (!activeJob) return;
      try {
        setUpdating(true);
        const token = await getToken();
        if (!token) return;
        await updateJobStatus(token, activeJob.id, { status: nextStatus });
        await refetch();
      } catch (err: any) {
        Alert.alert("Update failed", err.message ?? "Please try again.");
      } finally {
        setUpdating(false);
      }
    },
    [activeJob, getToken, refetch],
  );

  // Open Google Maps directions
  const openMaps = useCallback((lat: number, lng: number, _label: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=bicycling`;
    Linking.openURL(url);
  }, []);

  if (!activeJob) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
          <Text className="text-2xl font-JakartaBold text-black">
            Active Job
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-3">🛵</Text>
          <Text className="text-lg font-JakartaBold text-black">
            No active job
          </Text>
          <Text className="text-sm font-Jakarta text-gray-400 text-center mt-1 mx-8">
            Accept a job from the Jobs tab to get started.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const headingToPickup = activeJob.status === "accepted";
  const navTarget = headingToPickup
    ? { lat: activeJob.pickupLat,  lng: activeJob.pickupLng,  label: activeJob.pickupName }
    : { lat: activeJob.dropoffLat, lng: activeJob.dropoffLng, label: activeJob.dropoffName };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-JakartaBold text-black">Active Job</Text>
        <Text className="text-xs font-mono text-gray-400 mt-0.5 uppercase tracking-widest">
          Order #{activeJob.orderId.slice(0, 8)}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {/* Status stepper */}
        <StatusStepper
          currentStatus={activeJob.status}
          onAdvance={handleAdvance}
          isUpdating={isUpdating}
        />

        {/* Navigate button */}
        <TouchableOpacity
          onPress={() => openMaps(navTarget.lat, navTarget.lng, navTarget.label)}
          className="flex-row items-center justify-center gap-x-2 bg-black rounded-2xl p-4"
        >
          <Ionicons name="navigate" size={18} color="white" />
          <Text className="text-white font-JakartaBold text-base">
            Navigate to {headingToPickup ? "shop" : "customer"}
          </Text>
        </TouchableOpacity>

        {/* Contact buttons */}
        <View className="flex-row gap-x-3">
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${activeJob.pickupPhone}`)}
            className="flex-1 flex-row items-center justify-center gap-x-2 bg-white border border-neutral-200 rounded-2xl p-3"
          >
            <Ionicons name="call" size={16} color="#0286ff" />
            <Text className="text-[#0286ff] font-JakartaSemiBold text-sm">
              Call Shop
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${activeJob.dropoffPhone}`)}
            className="flex-1 flex-row items-center justify-center gap-x-2 bg-white border border-neutral-200 rounded-2xl p-3"
          >
            <Ionicons name="call" size={16} color="#0286ff" />
            <Text className="text-[#0286ff] font-JakartaSemiBold text-sm">
              Call Customer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Job summary card (no accept button) */}
        <JobCard job={activeJob} />
      </ScrollView>
    </SafeAreaView>
  );
}
