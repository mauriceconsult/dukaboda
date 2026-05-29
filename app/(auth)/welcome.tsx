// app/(auth)/welcome.tsx
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";

const { width } = Dimensions.get("window");

const Onboarding = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = activeIndex === onboarding.length - 1;

  const goNext = () => {
    if (isLastSlide) {
      router.replace("/(auth)/sign-up");     
    } else {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-between">
      <TouchableOpacity
        onPress={() => router.replace("/sign-up")}  
        className="w-full flex justify-end items-end p-5"
      >
        <Text className="text-black text-md font-JakartaBold">Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={onboarding}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={{ width }}
            className="flex items-center justify-center p-5"
          >
            <Image
              source={item.image}
              style={{ width: width - 40, height: 280 }}  // ← fixed: no overflow
              resizeMode="contain"
            />
            <Text className="text-black text-3xl font-bold mx-10 text-center mt-10">
              {item.title}
            </Text>
            <Text className="text-sm font-JakartaSemiBold text-center text-[#858585] mx-10 mt-3">
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Progress dots */}
      <View className="flex-row justify-center mb-4 gap-x-2">
        {onboarding.map((_, i) => (
          <View
            key={i}
            style={{
              height: 4,
              width: 32,
              borderRadius: 2,
              backgroundColor: i === activeIndex ? "#0286FF" : "#E2E8F0",
            }}
          />
        ))}
      </View>

      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={goNext}
        className="w-11/12 mb-5"
      />
    </SafeAreaView>
  );
};

export default Onboarding;
