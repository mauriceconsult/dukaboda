// lib/auth.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const webStorage = {
  async getToken(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

const nativeStorage = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {}
  },
};

export const tokenCache = Platform.OS === "web" ? webStorage : nativeStorage;
