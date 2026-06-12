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
    const checkRider = async () => {
      // Wait for Clerk to initialize
      if (!isLoaded) return;

      const token = await getToken();

      // Not signed in → show welcome
      if (!isSignedIn || !token) {
        setRiderState("not_registered");
        return;
      }
      

      try {
        const token = await getToken();

        // Session not fully ready yet
        if (!token) {
          setRiderState("not_registered");
          return;
        }

        const rider = await getMyProfile(token);

        setRiderState(rider.isApproved ? "approved" : "pending");
      } catch (error) {
        console.log("getMyProfile failed:", error);
        setRiderState("not_registered");
      }
    };

    // Small delay allows Clerk session to settle after sign-up
     const timer = setTimeout(() => {
       checkRider();
     }, 1000);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, getToken]);

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

  if (!isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (riderState === "not_registered") {
    return <Redirect href="/(root)/onboarding" />;
  }

  if (riderState === "pending") {
    return <Redirect href="/(root)/pending" />;
  }

  return <Redirect href="/(root)/(tabs)/jobs" />;
};

export default Page;
