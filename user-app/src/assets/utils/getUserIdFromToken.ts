import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export const getUserIdFromToken = async (): Promise<number | null> => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    // console.log(token, "token");

    if (!token) return null;

    const decoded: any = jwtDecode(token);
    // console.log(decoded, "decoded");

    return decoded?.id || null;  // ✅ Use id instead of userId
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
