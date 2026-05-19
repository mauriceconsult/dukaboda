// app/(auth)/sign-in.tsx
import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/jobs");
      } else {
        Alert.alert("Error", "Sign in could not be completed.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.longMessage ?? "Something went wrong.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header image with title overlay */}
      <View className="relative w-full h-[250px]">
        <Image
          source={images.signUpCar}
          className="w-full h-[250px]"
          resizeMode="cover"
        />
        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
          Welcome back
        </Text>
      </View>

      <View className="p-5">
        <InputField
          label="Email"
          placeholder="Enter your email"
          icon={icons.email}
          textContentType="emailAddress"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />
        <InputField
          label="Password"
          placeholder="Enter your password"
          icon={icons.lock}
          secureTextEntry
          textContentType="password"
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />
        <CustomButton
          title="Sign In"
          onPress={onSignInPress}
          className="mt-6"
        />

        <OAuth />

        <Link
          href="/sign-up"               // ← fixed: was pointing to /sign-in (itself)
          className="text-lg text-center text-general-200 mt-10"
        >
          <Text>Don't have an account? </Text>
          <Text className="text-primary-500">Sign Up</Text>
        </Link>
      </View>
    </ScrollView>
  );
};

export default SignIn;
