// app/(auth)/sign-up.tsx
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
import { ReactNativeModal } from "react-native-modal";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (!form.email || !form.password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      // Show the verification modal — don't navigate away
      setVerification({ ...verification, state: "pending" });
    } catch (err: any) {
      Alert.alert(
        "Sign Up Failed",
        err.errors?.[0]?.longMessage ?? "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

 const onPressVerify = async () => {
   if (!isLoaded) return;

   setLoading(true);

   try {
     const result = await signUp.attemptEmailAddressVerification({
       code: verification.code,
     });

     if (result.status === "complete") {
       await setActive({
         session: result.createdSessionId,
       });

       // Give Clerk time to hydrate session state
       await new Promise((resolve) => setTimeout(resolve, 1000));

       // Hide verification modal
       setVerification({
         ...verification,
         state: "success",
       });

       // Show success modal
       setShowSuccessModal(true);
     } else {
       setVerification({
         ...verification,
         error: "Verification failed.",
         state: "failed",
       });
     }
   } catch (err: any) {
     setVerification({
       ...verification,
       error: err.errors?.[0]?.longMessage ?? "Verification failed.",
       state: "failed",
     });
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
              Create your account
            </Text>
          </View>

          <View className="p-5 pb-10">
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              icon={icons.person}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />
            <InputField
              label="Email"
              placeholder="Enter your email"
              icon={icons.email}
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
            />
            <InputField
              label="Password"
              placeholder="Enter your password"
              icon={icons.lock}
              secureTextEntry
              textContentType="password"
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
            />
            <CustomButton
              title={loading ? "Creating account..." : "Sign Up"}
              onPress={onSignUpPress}
              disabled={loading}
              className="mt-6"
            />
            <OAuth />
            <Link
              href="/(auth)/sign-in"
              className="text-lg text-center text-general-200 mt-10"
            >
              Already have an account?{" "}
              <Text className="text-primary-500">Sign In</Text>
            </Link>
          </View>

          {/* ── Verification modal ───────────────────────────────── */}
          <ReactNativeModal
            isVisible={verification.state === "pending"}
            onModalHide={() => {
              if (verification.state === "success") setShowSuccessModal(true);
            }}
          >
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
              <Text className="font-JakartaExtraBold text-2xl mb-2">
                Verification
              </Text>
              <Text className="font-Jakarta mb-5">
                We've sent a code to {form.email}.
              </Text>
              <InputField
                label="Code"
                icon={icons.lock}
                placeholder="12345"
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(code) =>
                  setVerification({ ...verification, code })
                }
              />
              {verification.error && (
                <Text className="text-red-500 text-sm mt-1">
                  {verification.error}
                </Text>
              )}
              <CustomButton
                title={loading ? "Verifying..." : "Verify Email"}
                onPress={onPressVerify}
                disabled={loading}
                className="mt-5 bg-success-500"
              />
            </View>
          </ReactNativeModal>

          {/* ── Success modal ────────────────────────────────────── */}
          <ReactNativeModal isVisible={showSuccessModal}>
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
              <Image
                source={images.check}
                className="w-[110px] h-[110px] mx-auto my-5"
              />
              <Text className="text-3xl font-JakartaBold text-center">
                Verified
              </Text>
              <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                Account verified successfully.
              </Text>
              <CustomButton
                title="Start delivering"
                onPress={() => {
                  setShowSuccessModal(false);
                  router.replace("/");
                }}
                className="mt-5"
              />
            </View>
          </ReactNativeModal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
