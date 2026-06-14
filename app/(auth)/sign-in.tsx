import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
// import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const attempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(root)/(tabs)/jobs");
      } else {
        Alert.alert("Error", "Sign in could not be completed.");
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.errors?.[0]?.longMessage ?? "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1 bg-white"
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="relative w-full h-[220px]">
            <Image
              source={images.signUpCar}
              className="w-full h-[220px]"
              resizeMode="cover"
            />
            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
              Welcome back
            </Text>
          </View>

          <View className="p-5 pb-10">
            <InputField
              label="Email"
              placeholder="Enter your email"
              icon={icons.email}
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCapitalize="none"
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
              title={loading ? "Signing in..." : "Sign In"}
              onPress={onSignInPress}
              disabled={loading}
              className="mt-6"
            />
            {/* <OAuth /> */}
            <Link
              href="/sign-up"
              className="text-lg text-center text-general-200 mt-10"
            >
              <Text>Don't have an account? </Text>
              <Text className="text-primary-500">Sign Up</Text>
            </Link>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
