// app/(root)/(tabs)/jobs.tsx
//
// Available delivery jobs — polls every 10s.
// Rider taps "Accept Job" to claim one.

import { View, Text, FlatList, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";

import JobCard from "@/components/JobCard";
import { useJobPolling } from "@/lib/useJobPolling";
import { getAvailableJobs, acceptJob } from "@/lib/api";
import type { DeliveryJob } from "@/types/delivery";

export default function JobsScreen() {
  const { getToken }               = useAuth();
  const router                     = useRouter();
  const [acceptingId, setAccepting] = useState<string | null>(null);

  const { jobs, loading, error, refetch } = useJobPolling(getAvailableJobs);

  const handleAccept = useCallback(
    async (job: DeliveryJob) => {
      try {
        setAccepting(job.id);
        const token = await getToken();
        if (!token) return;
        await acceptJob(token, job.id);
        // Navigate to active tab where they'll see the accepted job
        router.replace("/(root)/(tabs)/active");
      } catch (err: any) {
        Alert.alert(
          "Could not accept job",
          err.message ?? "Please try again.",
        );
      } finally {
        setAccepting(null);
      }
    },
    [getToken, router],
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-JakartaBold text-black">
          Available Jobs
        </Text>
        <Text className="text-sm font-Jakarta text-gray-400 mt-0.5">
          Updates every 10 seconds
        </Text>
      </View>

      {/* Error banner */}
      {error && (
        <View className="mx-5 mt-3 p-3 bg-red-50 rounded-xl">
          <Text className="text-red-600 font-JakartaSemiBold text-sm">
            {error}
          </Text>
        </View>
      )}

      {/* Job list */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onAccept={handleAccept}
            isAccepting={acceptingId === item.id}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-4xl mb-3">📦</Text>
              <Text className="text-lg font-JakartaBold text-black">
                No jobs right now
              </Text>
              <Text className="text-sm font-Jakarta text-gray-400 text-center mt-1 mx-8">
                New delivery requests will appear here automatically.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
