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
    // Only check rider if signed in
    if (!isLoaded) return;
    if (!isSignedIn) {
      setRiderState("not_registered"); // ← unblock the render
      return;
    }

    const checkRider = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setRiderState("not_registered");
          return;
        }
        const rider = await getMyProfile(token);
        setRiderState(rider.isApproved ? "approved" : "pending");
      } catch {
        setRiderState("not_registered");
      }
    };

    checkRider();
  }, [isLoaded, isSignedIn, getToken]);

  // Show spinner only while Clerk is loading OR while checking rider profile
  if (!isLoaded || riderState === "loading") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#0286ff" />
      </View>
    );
  }

  // Not signed in → welcome screen
  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;

  // Signed in — route by rider state
  if (riderState === "not_registered")
    return <Redirect href="/(root)/onboarding" />;
  if (riderState === "pending") return <Redirect href="/(root)/pending" />;
  return <Redirect href="/(root)/(tabs)/jobs" />;
};

export default Page;
