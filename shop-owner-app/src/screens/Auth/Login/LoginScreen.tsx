// // LoginScreen.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useAuth } from "@/src/context/authContext";

// type Props = {
//   route: { params: { identifier: string } };
//   navigation: any;
// };

// const COOLDOWN_SECONDS = 60;

// const LoginScreen: React.FC<Props> = ({ route, navigation }) => {
//   const identifier = route.params?.identifier ?? "";
//   const [phone, setPhone] = useState(identifier);
//   const [otp, setOtp] = useState("");
//   const [devOtp, setDevOtp] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [cooldown, setCooldown] = useState(0);
//   const { signIn } = useAuth();

//   useEffect(() => {
//     // start cooldown timer
//     if (cooldown <= 0) return;
//     const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
//     return () => clearInterval(t);
//   }, [cooldown]);

//   useEffect(() => {
//     // request on mount
//     if (phone) requestOtp();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const requestOtp = async () => {
//     try {
//       setLoading(true);
//       const body = { phone, country_code: "+91" }; // adjust country code logic as needed
//       const res = await axios.post("/api/auth/request-otp", body);

//       // In dev/staging server you might get otp back (do NOT do this in prod)
//       if (res.data?.otp) {
//         setDevOtp(String(res.data.otp));
//         setOtp(String(res.data.otp)); // auto-fill for dev
//         Alert.alert("DEV OTP", `OTP (dev only): ${res.data.otp}`);
//       } else {
//         setDevOtp(null);
//       }

//       setCooldown(COOLDOWN_SECONDS);
//       Alert.alert("Info", res.data?.message || "OTP requested");
//     } catch (err: any) {
//       Alert.alert("Error", err?.response?.data?.message || "Failed to request OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOtp = async () => {
//     if (otp.length !== 6) {
//       Alert.alert("Invalid OTP", "Enter 6-digit OTP");
//       return;
//     }
//     try {
//       setLoading(true);
//       const body = { phone, otp };
//       const res = await axios.post("/api/auth/verify-otp", body);

//       // Case 1: server returned tokens -> login
//       if (res.data?.accessToken) {
//         const { accessToken, refreshToken, user } = res.data;
//         // signIn should persist tokens & user (see auth context example below)
//         await signIn(accessToken, user?.id ?? null, user?.shopId ?? null, refreshToken, user);
//         // navigate onward (your signIn or Onboard flow can decide)
//         navigation.replace("onBoardScreen");
//         return;
//       }

//       // Case 2: OTP verified but no account (server signals verified)
//       if (res.data?.verified && !res.data?.accessToken) {
//         Alert.alert("Verified", "Please create an account.");
//         navigation.navigate("signUpScreen", { identifier: phone });
//         return;
//       }

//       // generic success message (if any)
//       Alert.alert("Success", res.data?.message || "OTP verified");
//     } catch (err: any) {
//       Alert.alert("Error", err?.response?.data?.message || err.message || "Verification failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resendPressed = () => {
//     if (cooldown > 0) return;
//     requestOtp();
//   };

//   const verifyDisabled = loading || otp.length !== 6;
//   const resendDisabled = loading || cooldown > 0;

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       style={styles.container}
//     >
//       <View style={styles.card}>
//         <Text style={styles.title}>{otp ? "Enter OTP" : "Welcome Back!"}</Text>
//         <Text style={styles.subtitle}>
//           {otp
//             ? `We sent a 6-digit code to ${phone}`
//             : "Enter your mobile number to continue"}
//         </Text>

//         {/* Phone input */}
//         <Text style={styles.label}>Phone Number</Text>
//         <TextInput
//           value={phone}
//           onChangeText={setPhone}
//           keyboardType="phone-pad"
//           placeholder="+91 98765 43210"
//           style={styles.input}
//           editable={!loading && !otp} // lock phone after OTP requested
//         />

//         {/* OTP input */}
//         <Text style={[styles.label, { marginTop: 14 }]}>OTP</Text>
//         <TextInput
//           value={otp}
//           onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, "").slice(0, 6))}
//           keyboardType="number-pad"
//           placeholder="Enter 6-digit OTP"
//           maxLength={6}
//           style={styles.input}
//         />

//         {/* DEV OTP helper */}
//         {devOtp ? <Text style={styles.devOtp}>DEV OTP: {devOtp}</Text> : null}

//         {/* Buttons */}
//         <TouchableOpacity
//           style={[styles.btn, verifyDisabled && styles.btnDisabled]}
//           onPress={verifyOtp}
//           disabled={verifyDisabled}
//         >
//           {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Verify OTP</Text>}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.link, resendDisabled && styles.linkDisabled]}
//           onPress={resendPressed}
//           disabled={resendDisabled}
//         >
//           <Text style={styles.linkText}>
//             {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 16 },
//   card: { backgroundColor: "#fff", padding: 20 },
//   title: { fontSize: 20, fontWeight: "600", marginBottom: 6 },
//   subtitle: { fontSize: 12, color: "#666", marginBottom: 12 },
//   label: { fontSize: 12, color: "#444", marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 12,
//     borderRadius: 6,
//     marginBottom: 8,
//   },
//   devOtp: { color: "gray", marginBottom: 8 },
//   btn: {
//     backgroundColor: "#5a2e1a",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   btnDisabled: { opacity: 0.6 },
//   btnText: { color: "#fff", fontWeight: "600" },
//   link: { marginTop: 12, alignItems: "center" },
//   linkDisabled: { opacity: 0.6 },
//   linkText: { color: "#777" },
// });
// AnimatedLoginReanimated.tsx
// SimpleAnimatedLogin.tsx
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   useWindowDimensions,
// } from "react-native";
// import axios from "axios"; // replace with your axiosClient if needed
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
// import { useAuth } from "@/src/context/authContext";

// type Props = {
//   route?: { params?: { identifier?: string } };
//   navigation: any;
// };

// const COOLDOWN_SECONDS = 60;
// const OTP_LENGTH = 6;
// const ANIM_MS = 280;

// const SimpleAnimatedLogin: React.FC<Props> = ({ route, navigation }) => {
//   const initialIdentifier = route?.params?.identifier ?? "";
//   const { width: screenWidth } = useWindowDimensions();
//   const { signIn } = useAuth();

//   // form state
//   const [phone, setPhone] = useState(initialIdentifier);
//   const [otp, setOtp] = useState("");
//   const [devOtp, setDevOtp] = useState<string | null>(null);

//   // ui state
//   const [loading, setLoading] = useState(false);
//   const [cooldown, setCooldown] = useState(0);
//   const [isOtpVisible, setIsOtpVisible] = useState(false);

//   // refs
//   const otpRef = useRef<TextInput | null>(null);

//   // animation: translateX of two-panel container
//   const translateX = useSharedValue(0);
//   const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

//   // cooldown timer
//   useEffect(() => {
//     if (cooldown <= 0) return;
//     const t = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
//     return () => clearInterval(t);
//   }, [cooldown]);

//   // helper: slide to OTP or back
//   const slide = useCallback(
//     (toOtp: boolean) => {
//       const dest = toOtp ? -screenWidth : 0;
//       translateX.value = withTiming(dest, { duration: ANIM_MS }, (finished) => {
//         if (finished) {
//           runOnJS(setIsOtpVisible)(toOtp);
//           if (toOtp) {
//             // focus OTP after animation (small delay for keyboard)
//             runOnJS(() => setTimeout(() => otpRef.current?.focus(), 60))();
//           }
//         }
//       });
//     },
//     [screenWidth, translateX]
//   );

//   // request OTP
//   const requestOtp = useCallback(async () => {
//     if (!phone || phone.trim().length < 6) {
//       Alert.alert("Invalid phone", "Enter a valid phone number.");
//       return;
//     }
//     if (loading) return;
//     setLoading(true);
//     try {
//       const body = { phone: phone.trim(), country_code: "+91" };
//       const res = await axios.post("/api/auth/request-otp", body);
//       // dev-only OTP returned from server (do not use in prod)
//       if (res.data?.otp) {
//         setDevOtp(String(res.data.otp));
//         setOtp(String(res.data.otp)); // auto-fill for dev/testing
//       } else {
//         setDevOtp(null);
//       }
//       setCooldown(COOLDOWN_SECONDS);
//       slide(true); // show OTP panel
//       Alert.alert("OTP sent", res.data?.message || "Please check your messages.");
//     } catch (err: any) {
//       Alert.alert("Error", err?.response?.data?.message || err.message || "Failed to request OTP");
//     } finally {
//       setLoading(false);
//     }
//   }, [phone, loading, slide]);

//   // verify otp
//   const verifyOtp = useCallback(async () => {
//     if (otp.length !== OTP_LENGTH) {
//       Alert.alert("Invalid OTP", `Please enter ${OTP_LENGTH}-digit OTP`);
//       return;
//     }
//     if (loading) return;
//     setLoading(true);
//     try {
//       const res = await axios.post("/api/auth/verify-otp", { phone: phone.trim(), otp: otp.trim() });
//       if (res.data?.accessToken) {
//         const { accessToken, refreshToken, user } = res.data;
//         await signIn(accessToken, user?.id ?? null, user?.shopId ?? null, refreshToken, user);
//         navigation.replace("onBoardScreen");
//         return;
//       }
//       if (res.data?.verified && !res.data?.accessToken) {
//         Alert.alert("Verified", "Please create an account.");
//         navigation.navigate("signUpScreen", { identifier: phone });
//         return;
//       }
//       Alert.alert("Success", res.data?.message || "OTP verified");
//     } catch (err: any) {
//       Alert.alert("Error", err?.response?.data?.message || err.message || "Verification failed");
//     } finally {
//       setLoading(false);
//     }
//   }, [otp, phone, signIn, navigation, loading]);

//   // auto-submit on full otp
//   useEffect(() => {
//     if (otp.length === OTP_LENGTH) {
//       const t = setTimeout(() => verifyOtp(), 250);
//       return () => clearTimeout(t);
//     }
//   }, [otp, verifyOtp]);

//   const onSendPress = () => {
//     Keyboard.dismiss();
//     requestOtp();
//   };

//   const onResend = () => {
//     if (cooldown > 0 || loading) return;
//     requestOtp();
//   };

//   const onEditPhone = () => {
//     slide(false);
//     setOtp("");
//   };

//   // layout: two panels side-by-side, width = screenWidth each
//   const containerWidth = screenWidth * 2;

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
//         <View style={styles.center}>
//           <Animated.View style={[styles.row, { width: containerWidth }, animatedStyle]}>
//             {/* Phone panel */}
//             <View style={[styles.panel, { width: screenWidth }]}>
//               <Text style={styles.title}>Welcome Back!</Text>
//               <Text style={styles.sub}>Enter your mobile number to continue</Text>

//               <Text style={styles.label}>Phone Number</Text>
//               <TextInput
//                 value={phone}
//                 onChangeText={setPhone}
//                 keyboardType="phone-pad"
//                 placeholder="+91 98765 43210"
//                 style={styles.input}
//                 editable={!loading}
//                 returnKeyType="send"
//                 onSubmitEditing={onSendPress}
//               />

//               <TouchableOpacity onPress={onSendPress} style={[styles.button, (loading || !phone) && styles.buttonDisabled]} disabled={loading || !phone}>
//                 {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
//               </TouchableOpacity>
//             </View>

//             {/* OTP panel */}
//             <View style={[styles.panel, { width: screenWidth }]}>
//               <Text style={styles.title}>Enter OTP</Text>
//               <Text style={styles.sub}>We sent a 6-digit code to {phone}</Text>

//               <Text style={styles.label}>OTP</Text>
//               <TextInput
//                 ref={otpRef}
//                 value={otp}
//                 onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH))}
//                 keyboardType="number-pad"
//                 placeholder="Enter 6-digit OTP"
//                 maxLength={OTP_LENGTH}
//                 style={styles.input}
//               />

//               {devOtp ? <Text style={styles.dev}>DEV OTP: {devOtp}</Text> : null}

//               <TouchableOpacity onPress={verifyOtp} style={[styles.button, (loading || otp.length !== OTP_LENGTH) && styles.buttonDisabled]} disabled={loading || otp.length !== OTP_LENGTH}>
//                 {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
//               </TouchableOpacity>

//               <TouchableOpacity onPress={onResend} disabled={cooldown > 0} style={styles.resend}>
//                 <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity onPress={onEditPhone} style={styles.edit}>
//                 <Text style={styles.editText}>Edit phone number</Text>
//               </TouchableOpacity>
//             </View>
//           </Animated.View>
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// };

// export default SimpleAnimatedLogin;

// const styles = StyleSheet.create({
//   page: { flex: 1, backgroundColor: "#fff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   row: { flexDirection: "row" },
//   panel: { paddingHorizontal: 24, paddingTop: 36, paddingBottom: 32, minHeight: "100%" },
//   title: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 6 },
//   sub: { fontSize: 13, color: "#666", marginBottom: 18 },
//   label: { fontSize: 12, color: "#444", marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#e7e7e7",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     backgroundColor: "#fff",
//   },
//   dev: { color: "#777", marginBottom: 8, fontSize: 12 },
//   button: {
//     backgroundColor: "#5a2e1a",
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   buttonDisabled: { opacity: 0.6 },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
//   resend: { marginTop: 12, alignItems: "center" },
//   resendText: { color: "#999", fontSize: 13 },
//   resendDisabled: { opacity: 0.6 },
//   edit: { marginTop: 10, alignItems: "center" },
//   editText: { color: "#777", fontSize: 13 },
// });
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import axios from "axios";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { useAuth } from "@/src/context/authContext";
import axiosClient from "@/src/assets/api/client";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

type Props = {
  route?: { params?: { identifier?: string } };
  navigation: any;
};

const COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;
const ANIM_MS = 280;

const SimpleAnimatedLogin: React.FC<Props> = ({ route, navigation }) => {
  const initialIdentifier = route?.params?.identifier ?? "";
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { signIn } = useAuth();

  // form state
  const [phone, setPhone] = useState(initialIdentifier);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // ui state
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isOtpVisible, setIsOtpVisible] = useState(false);

  // refs
  const otpRef = useRef<TextInput | null>(null);

  // animation: translateX of two-panel container
  const translateX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // helper: slide to OTP or back
  const slide = useCallback(
    (toOtp: boolean) => {
      const dest = toOtp ? -screenWidth : 0;
      translateX.value = withTiming(dest, { duration: ANIM_MS }, (finished) => {
        if (finished) {
          runOnJS(setIsOtpVisible)(toOtp);
          if (toOtp) {
            // focus OTP after animation (small delay for keyboard)
            runOnJS(() => setTimeout(() => otpRef.current?.focus(), 80))();
          }
        }
      });
    },
    [screenWidth, translateX]
  );

  // request OTP

  const requestOtpDebug = useCallback(async () => {
    if (!phone || phone.trim().length < 6) {
      Alert.alert("Invalid phone", "Enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const body = { phone: phone.trim(), country_code: "+91" };
  
      // use axiosClient if available so baseURL/interceptors apply
      const client = axiosClient ?? axios;
  
      console.log("[OTP] sending request to:", (client.defaults?.baseURL ?? "") + "/api/auth/request-otp");
      const res = await client.post("/api/auth/request-otp", body, { timeout: 30000 });
      console.log("[OTP] success", res?.data);
      if (res.data?.otp) {
        setDevOtp(String(res.data.otp));
        setOtp(String(res.data.otp));
      } else {
        setDevOtp(null);
      }
      setCooldown(COOLDOWN_SECONDS);
      slide(true);
      Alert.alert("OTP sent", res.data?.message || "Check your messages");
    } catch (err: any) {
      // Very important: inspect these three properties
      console.error("[OTP] request error:", {
        message: err.message,
        code: err.code,
        configUrl: err?.config?.url,
        configBase: err?.config?.baseURL,
        isAxiosError: err.isAxiosError,
        response: err?.response && {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data,
        },
        request: !!err?.request,
      });
  
      // User friendly error
      if (err?.response) {
        // server responded with non-2xx
        Alert.alert("Server error", err.response?.data?.message || `Status ${err.response.status}`);
      } else if (err?.request) {
        // request made but no response received
        Alert.alert(
          "Network error",
          "No response from server. Check your server is running and reachable from this device/emulator."
        );
      } else {
        // something else happened
        Alert.alert("Error", err.message || "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, [phone, slide]);
  // verify otp
  const verifyOtp = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert("Invalid OTP", `Please enter ${OTP_LENGTH}-digit OTP`);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verify-otp", { phone: phone.trim(), otp: otp.trim() });
      if (res.data?.accessToken) {
        const { accessToken, refreshToken, user } = res.data;
        await signIn(accessToken, user?.id ?? null, user?.shopId ?? null, refreshToken, user);
        navigation.replace("onBoardScreen");
        return;
      }
      if (res.data?.verified && !res.data?.accessToken) {
        Alert.alert("Verified", "Please create an account.");
        navigation.navigate("signUpScreen", { identifier: phone });
        return;
      }
      Alert.alert("Success", res.data?.message || "OTP verified");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [otp, phone, signIn, navigation, loading]);

  // auto-submit on full otp
  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      const t = setTimeout(() => verifyOtp(), 250);
      return () => clearTimeout(t);
    }
  }, [otp, verifyOtp]);

  const onSendPress = () => {
    Keyboard.dismiss();
    requestOtpDebug();
  };

  const onResend = () => {
    if (cooldown > 0 || loading) return;
    requestOtpDebug();
  };

  const onEditPhone = () => {
    slide(false);
    setOtp("");
  };

  // layout: two panels side-by-side, width = screenWidth each
  const containerWidth = screenWidth * 2;
  const panelHeight = Math.max(520, screenHeight); // ensure full-bleed vertical feel similar to screenshot

  return (
    <SafeAreaContainer >
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.center, { minHeight: panelHeight }]}>
              <Animated.View style={[styles.row, { width: containerWidth, height: panelHeight }, animatedStyle]}>
                {/* Phone panel */}
                <View style={[styles.panel, { width: screenWidth }]}>
                  <Text style={styles.title}>Welcome Back!</Text>
                  <Text style={styles.sub}>Enter your mobile number to continue</Text>

                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#bdbdbd"
                    style={styles.input}
                    editable={!loading}
                    returnKeyType="send"
                    onSubmitEditing={onSendPress}
                  />

                  <TouchableOpacity
                    onPress={onSendPress}
                    style={[styles.button, (loading || !phone) && styles.buttonDisabled]}
                    disabled={loading || !phone}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
                  </TouchableOpacity>
                </View>

                {/* OTP panel */}
                <View style={[styles.panel, { width: screenWidth }]}>
                  <Text style={styles.titleRight}>Enter OTP</Text>
                  <Text style={styles.subRight}>We sent a 6-digit code to {phone || "your phone"}</Text>

                  <Text style={styles.label}>OTP</Text>
                  <TextInput
                    ref={otpRef}
                    value={otp}
                    onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH))}
                    keyboardType="number-pad"
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#bdbdbd"
                    maxLength={OTP_LENGTH}
                    style={[styles.input, styles.inputOtp]}
                  />

                  {devOtp ? <Text style={styles.dev}>DEV OTP: {devOtp}</Text> : null}

                  <TouchableOpacity
                    onPress={verifyOtp}
                    style={[styles.button, (loading || otp.length !== OTP_LENGTH) && styles.buttonDisabled]}
                    disabled={loading || otp.length !== OTP_LENGTH}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onResend} disabled={cooldown > 0} style={styles.resend}>
                    <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onEditPhone} style={styles.edit}>
                    <Text style={styles.editText}>Edit phone number</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaContainer>
  );
};

export default SimpleAnimatedLogin;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  page: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row" },
  panel: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#111", marginBottom: 6, textAlign: "left" },
  titleRight: { fontSize: 30, fontWeight: "800", color: "#111", marginBottom: 8, textAlign: "left" },
  sub: { fontSize: 13, color: "#666", marginBottom: 18 },
  subRight: { fontSize: 14, color: "#666", marginBottom: 20 },
  label: { fontSize: 12, color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#efefef",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 0,
  },
  inputOtp: {
    letterSpacing: 8,
    textAlign: "left",
    // keep single-line look
  },
  dev: { color: "#777", marginBottom: 8, fontSize: 12 },
  button: {
    backgroundColor: "#9a6f67", // brown-ish like screenshot
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  resend: { marginTop: 14, alignItems: "center" },
  resendText: { color: "#999", fontSize: 13 },
  resendDisabled: { opacity: 0.6 },
  edit: { marginTop: 12, alignItems: "center" },
  editText: { color: "#777", fontSize: 13 },
});
