// app/(root)/(tabs)/history.tsx

import { View, Text, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import JobCard from "@/components/JobCard";
import { useJobPolling } from "@/lib/useJobPolling";
import { getJobHistory } from "@/lib/api";

export default function HistoryScreen() {
  const { jobs, loading, refetch } = useJobPolling(getJobHistory);

  const totalEarned = jobs.reduce((sum, j) => sum + j.deliveryCost, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-JakartaBold text-black">History</Text>
        {jobs.length > 0 && (
          <Text className="text-sm font-Jakarta text-gray-400 mt-0.5">
            {jobs.length} deliveries · UGX {totalEarned.toLocaleString()} earned
          </Text>
        )}
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        renderItem={({ item }) => <JobCard job={item} />}
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-4xl mb-3">📋</Text>
              <Text className="text-lg font-JakartaBold text-black">
                No completed deliveries yet
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
