// app/index.tsx
//
// Entry point — routes based on auth + rider registration state.

import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getMyProfile } from "@/lib/api";

type RiderState = "loading" | "not_registered" | "pending" | "approved";

const Page = () => {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [riderState, setRiderState] = useState<RiderState>("loading");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setRiderState("loading");
      return;
    }

    const checkRider = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const rider = await getMyProfile(token);
        setRiderState(rider.isApproved ? "approved" : "pending");
      } catch {
        setRiderState("not_registered");
      }
    };

    checkRider();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || (isSignedIn && riderState === "loading")) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0286ff" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;

  if (riderState === "not_registered") return <Redirect href="/(root)/onboarding" />;
  if (riderState === "pending")        return <Redirect href="/(root)/pending" />;
  return <Redirect href="/(root)/(tabs)/jobs" />;
};

export default Page;
