// app/(root)/pending.tsx
//
// Shown after onboarding while shop owner reviews the application.
// Polls GET /api/riders/me every 15s — redirects to jobs tab once approved.

import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { getMyProfile } from "@/lib/api";

const POLL_MS = 15_000;

export default function PendingScreen() {
  const { getToken } = useAuth();
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const rider = await getMyProfile(token);
        if (rider.isApproved) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace("/(root)/(tabs)/jobs");
        }
      } catch {
        // Not yet registered or network error — keep polling
      }
    };

    check(); // immediate first check
    intervalRef.current = setInterval(check, POLL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [getToken]);

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-5xl mb-6">⏳</Text>

      <Text className="text-2xl font-JakartaBold text-black text-center mb-3">
        Application submitted
      </Text>

      <Text className="text-sm font-Jakarta text-gray-500 text-center leading-6 mb-8">
        Your application is being reviewed by a Vendly shop. This usually
        takes less than 24 hours. You'll be automatically redirected once
        approved — no need to do anything.
      </Text>

      {/* Status card */}
      <View className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
        <View className="flex-row items-center gap-x-3 mb-3">
          <View className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <Text className="text-sm font-JakartaSemiBold text-black">
            Status: Pending review
          </Text>
        </View>
        <Text className="text-xs font-Jakarta text-gray-500 leading-5">
          Checking for approval every 15 seconds. Keep the app open or
          come back later — your status is saved.
        </Text>
      </View>

      {/* What happens next */}
      <View className="w-full">
        <Text className="text-xs font-JakartaSemiBold text-gray-400 uppercase tracking-widest mb-3">
          What happens next
        </Text>
        {[
          { icon: "✅", text: "Shop owner reviews your profile" },
          { icon: "📱", text: "You receive automatic access to the jobs queue" },
          { icon: "🚀", text: "Start accepting deliveries and earning" },
        ].map((step, i) => (
          <View key={i} className="flex-row items-start gap-x-3 mb-3">
            <Text className="text-base">{step.icon}</Text>
            <Text className="text-sm font-Jakarta text-gray-600 flex-1 leading-5">
              {step.text}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
