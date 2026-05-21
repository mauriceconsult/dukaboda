// app/(root)/_layout.tsx
//
// Guards the root segment:
// - Not signed in → redirect to auth
// - Signed in, no rider profile → onboarding
// - Signed in, rider pending approval → pending screen
// - Signed in, rider approved → tabs (jobs, active, history, profile)

import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getMyProfile } from "@/lib/api";
import type { Rider } from "@/types/delivery";

type RiderState = "loading" | "not_registered" | "pending" | "approved";

export default function RootLayout() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [riderState, setRiderState] = useState<RiderState>("loading");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const checkRider = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const rider: Rider = await getMyProfile(token);
        setRiderState(rider.isApproved ? "approved" : "pending");
      } catch {
        // 404 = not registered yet
        setRiderState("not_registered");
      }
    };

    checkRider();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || riderState === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0286ff" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)"      options={{ headerShown: false }} />
      <Stack.Screen name="onboarding"  options={{ headerShown: false }} />
      <Stack.Screen name="pending"     options={{ headerShown: false }} />
    </Stack>
  );
}
