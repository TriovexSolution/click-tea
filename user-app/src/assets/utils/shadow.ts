import { Platform } from "react-native";

export const SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
});
