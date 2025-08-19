// src/utils/reverseGeocode.ts
import axios from "axios";

export const getAddressFromCoords = async (lat: number, lng: number) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "your-app-name" }, // required by Nominatim
    });

    return res.data?.display_name || "Unknown location";
  } catch (error) {
    console.log("Reverse geocode error:", error);
    return "Unknown location";
  }
};
