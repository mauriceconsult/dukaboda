// components/StatusStepper.tsx
//
// Shows the current delivery step and a CTA button to advance to the next one.

import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DeliveryStep } from "@/types/delivery";

interface StatusStepperProps {
  currentStatus: DeliveryStep;
  onAdvance:     (nextStatus: DeliveryStep) => void;
  isUpdating:    boolean;
}

interface Step {
  status:      DeliveryStep;
  label:       string;
  icon:        keyof typeof Ionicons.glyphMap;
  nextStatus?: DeliveryStep;
  nextLabel?:  string;
}

const STEPS: Step[] = [
  {
    status:     "accepted",
    label:      "Heading to shop",
    icon:       "bicycle",
    nextStatus: "picking_up",
    nextLabel:  "I've arrived at the shop",
  },
  {
    status:     "picking_up",
    label:      "At the shop",
    icon:       "storefront",
    nextStatus: "picked_up",
    nextLabel:  "Package collected",
  },
  {
    status:     "picked_up",
    label:      "Package collected",
    icon:       "cube",
    nextStatus: "in_transit",
    nextLabel:  "Heading to customer",
  },
  {
    status:     "in_transit",
    label:      "On the way",
    icon:       "navigate",
    nextStatus: "delivered",
    nextLabel:  "Mark as delivered",
  },
  {
    status: "delivered",
    label:  "Delivered",
    icon:   "checkmark-circle",
  },
];

export default function StatusStepper({
  currentStatus,
  onAdvance,
  isUpdating,
}: StatusStepperProps) {
  const stepIndex  = STEPS.findIndex((s) => s.status === currentStatus);
  const currentStep = STEPS[stepIndex];

  if (!currentStep) return null;

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">

      {/* Progress dots */}
      <View className="flex-row justify-center items-center mb-4 gap-x-2">
        {STEPS.slice(0, -1).map((step, i) => (
          <View key={step.status} className="flex-row items-center">
            <View
              className={`w-3 h-3 rounded-full ${
                i <= stepIndex ? "bg-[#0286ff]" : "bg-gray-200"
              }`}
            />
            {i < STEPS.length - 2 && (
              <View
                className={`w-8 h-0.5 ${
                  i < stepIndex ? "bg-[#0286ff]" : "bg-gray-200"
                }`}
              />
            )}
          </View>
        ))}
      </View>

      {/* Current status label */}
      <View className="flex-row items-center justify-center gap-x-2 mb-4">
        <Ionicons name={currentStep.icon} size={20} color="#0286ff" />
        <Text className="text-base font-JakartaSemiBold text-black">
          {currentStep.label}
        </Text>
      </View>

      {/* Advance button — hidden once delivered */}
      {currentStep.nextStatus && currentStep.nextLabel && (
        <TouchableOpacity
          onPress={() => onAdvance(currentStep.nextStatus!)}
          disabled={isUpdating}
          className={`w-full rounded-full p-3 flex-row justify-center items-center ${
            isUpdating ? "bg-gray-300" : "bg-[#0286ff]"
          }`}
        >
          <Text className="text-white font-JakartaBold text-base">
            {isUpdating ? "Updating…" : currentStep.nextLabel}
          </Text>
        </TouchableOpacity>
      )}

      {/* Delivered state */}
      {currentStatus === "delivered" && (
        <View className="flex-row items-center justify-center gap-x-2 bg-green-50 rounded-full p-3">
          <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
          <Text className="text-green-700 font-JakartaBold text-base">
            Delivery complete
          </Text>
        </View>
      )}
    </View>
  );
}
