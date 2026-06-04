// app/(root)/onboarding.tsx
//
// Shown once after sign-up — collects rider profile.
// On submit, calls POST /api/riders to register with Zuria.
// On success, redirects to the approval-pending screen.

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { registerRider } from "@/lib/api";

type VehicleType = "motorcycle" | "bicycle" | "car";

const VEHICLES: { type: VehicleType; icon: string; label: string; description: string }[] = [
  {
    type:        "motorcycle",
    icon:        "🏍️",
    label:       "Motorcycle / Boda",
    description: "Fast, ideal for small packages",
  },
  {
    type:        "bicycle",
    icon:        "🚲",
    label:       "Bicycle",
    description: "Eco-friendly, short distances",
  },
  {
    type:        "car",
    icon:        "🚗",
    label:       "Car",
    description: "Large or fragile items",
  },
];

export default function OnboardingScreen() {
  const { getToken, userId } = useAuth();
  const { user } = useUser();

  const [name,        setName]        = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ?? ""
  );
  const [phone,       setPhone]       = useState("");
  const [vehicle,     setVehicle]     = useState<VehicleType>("motorcycle");
  const [submitting,  setSubmitting]  = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      Alert.alert("Required", "Please enter a valid phone number.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      // Format phone to E.164 if needed
      const formatted = phone.startsWith("+")
        ? phone
        : `+256${phone.replace(/^0/, "")}`;     

      console.log("TOKEN EXISTS:", !!token);
      console.log("TOKEN:", token?.slice(0, 50));

      await registerRider(
        token,
        {
          name: name.trim(),
          phone: formatted,
          email: user?.primaryEmailAddress?.emailAddress ?? "",
          vehicleType: vehicle,
        },
        userId!,
      ); // ← pass clerkId

      router.replace("/(root)/pending");
    } catch (err: any) {
      Alert.alert(
        "Registration failed",
        err.message ?? "Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-JakartaBold text-black mb-2">
            Join Dukaboda 🛵
          </Text>
          <Text className="text-sm font-Jakarta text-gray-500">
            Complete your profile to start receiving delivery jobs from
            Vendly shops near you.
          </Text>
        </View>

        {/* Name */}
        <InputField
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          containerStyle="mb-4"
        />

        {/* Phone */}
        <InputField
          label="Phone Number (used for MoMo payouts)"
          placeholder="e.g. 0700000000 or +256700000000"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          containerStyle="mb-6"
        />

        {/* Vehicle type */}
        <Text className="text-base font-JakartaSemiBold text-black mb-3">
          Vehicle Type
        </Text>
        <View className="gap-y-3 mb-8">
          {VEHICLES.map((v) => {
            const selected = vehicle === v.type;
            return (
              <TouchableOpacity
                key={v.type}
                onPress={() => setVehicle(v.type)}
                className={`flex-row items-center p-4 rounded-2xl border-2 ${
                  selected
                    ? "border-[#0286ff] bg-blue-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <Text className="text-2xl mr-4">{v.icon}</Text>
                <View className="flex-1">
                  <Text
                    className={`text-base font-JakartaSemiBold ${
                      selected ? "text-[#0286ff]" : "text-black"
                    }`}
                  >
                    {v.label}
                  </Text>
                  <Text className="text-xs font-Jakarta text-gray-400 mt-0.5">
                    {v.description}
                  </Text>
                </View>
                {selected && (
                  <Ionicons name="checkmark-circle" size={22} color="#0286ff" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Earnings info */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-8">
          <Text className="text-sm font-JakartaSemiBold text-black mb-1">
            💰 How earnings work
          </Text>
          <Text className="text-xs font-Jakarta text-gray-500 leading-5">
            You earn the full delivery fee for each completed job, paid
            directly to your MoMo number above. Dukaboda takes no
            commission — the fee shown is yours.
          </Text>
        </View>

        <CustomButton
          title={submitting ? "Submitting…" : "Submit application"}
          onPress={handleSubmit}
          disabled={submitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
