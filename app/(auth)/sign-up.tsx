import { useSignUp } from "@clerk/clerk-expo";
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
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignUp = () => {
  const { isLoaded, signUp } = useSignUp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      Alert.alert(
        "Verify Email",
        "Check your email for the verification code.",
      );

      router.push({
        pathname: "/welcome",
        params: { email: form.email },
      });
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
          {/* Header */}
          <View className="relative w-full h-[220px]">
            <Image
              source={images.signUpCar}
              className="w-full h-[220px]"
              resizeMode="cover"
            />
            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
              Create your account
            </Text>
          </View>

          {/* Form */}
          <View className="p-5 pb-10">
            <InputField
              label="Name"
              placeholder="Enter your name"
              icon={icons.person}
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
            />

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
              title={loading ? "Creating account..." : "Sign Up"}
              onPress={onSignUpPress}
              disabled={loading}
              className="mt-6"
            />

            <OAuth />

            <Link
              href="/sign-in"
              className="text-lg text-center text-general-200 mt-10"
            >
              <Text>Already have an account? </Text>
              <Text className="text-primary-500">Sign In</Text>
            </Link>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
