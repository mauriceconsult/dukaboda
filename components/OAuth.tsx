import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import * as Linking from "expo-linking";
import { icons } from "@/constants";

export default function OAuth() {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/(root)/(tabs)/jobs", { scheme: "dukaboda" }),
      });
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/(root)/(tabs)/jobs");
      }
    } catch (err: any) {
      Alert.alert("Google sign in failed", err.message ?? "Please try again.");
    }
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        className="flex flex-row items-center justify-center mt-5 w-full border border-neutral-300 rounded-full p-3"
      >
        <Image source={icons.google} resizeMode="contain" className="w-5 h-5 mx-2" />
        <Text className="text-base text-black font-JakartaSemiBold">
          Continue with Google
        </Text>
      </TouchableOpacity>
    </View>
  );
}
