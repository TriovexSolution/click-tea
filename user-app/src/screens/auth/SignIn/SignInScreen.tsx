// import React, { useContext, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { Ionicons } from "@expo/vector-icons";
// import { hp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { ParamListBase, useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import axios from "axios";
// import { BASE_URL } from "@/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { AuthContext } from "@/src/context/authContext";
// import axiosClient from "@/src/api/client";

// interface FormData {
//   login_input: string;
//   password: string;
// }

// const SignInScreen: React.FC = () => {
//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>({
//     defaultValues: {
//       login_input: "",
//       password: "",
//     },
//   });

//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const { signIn } = useContext(AuthContext);

// const onSubmit = async (data: FormData) => {
//   setLoading(true);
//   try {
//     const response = await axiosClient.post(`${BASE_URL}/api/auth/signin`, data, {
//       headers: { "Content-Type": "application/json" },
//     });

//     // The API may return either `token` or `accessToken` (or both).
//     const token = response.data?.token ?? response.data?.accessToken ?? null;
//     const refresh = response.data?.refreshToken ?? null;
//     const userId = response.data?.user?.id ?? response.data?.userId ?? null;

//     // Helpful debug log (remove or lower log level in production)
//     // console.log("Sign-in response:", response.data);

//     if (token) {
//       // Pass refresh token if present (optional)
//       await signIn(token, userId, refresh);
//       // After signIn, AuthProvider will fetch profile / re-render to auth stack
//     } else {
//       // still provide helpful debug info & show user-friendly message
//       console.warn("Sign In: no access token in response", response.data);
//       Alert.alert("Login Error", "No access token received from server. Please try again.");
//     }
//   } catch (error: any) {
//     const errMessage = error?.response?.data?.message;
//     if (errMessage === "User not found") {
//       Alert.alert("Account Not Found", "You don't have an account. Please sign up first.", [
//         { text: "Sign Up", onPress: () => navigation.navigate("signUpScreen") },
//         { text: "Cancel", style: "cancel" },
//       ]);
//     } else if (errMessage === "Invalid credentials") {
//       Alert.alert("Login Failed", "Incorrect email or password.");
//     } else {
//       Alert.alert("Error", "Something went wrong. Please try again.");
//     }
    
//     console.log("Sign In failed", errMessage || error);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require("../../../assets/images/FirstLogo-removebg-preview.png")}
//         style={styles.logo}
//         resizeMode="contain"
//       />

//       <Text style={styles.heading}>Welcome Back to ClickTea</Text>

//       <Controller
//         control={control}
//         name="login_input"
//         rules={{ required: "Email or Phone is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             style={styles.input}
//             placeholder="Email or Phone"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={value}
//             onChangeText={onChange}
//           />
//         )}
//       />
//       {errors.login_input && <Text style={styles.error}>{errors.login_input.message}</Text>}

//       <View style={styles.passwordContainer}>
//         <Controller
//           control={control}
//           name="password"
//           rules={{
//             required: "Password is required",
//             minLength: { value: 6, message: "Password must be at least 6 characters" },
//           }}
//           render={({ field: { onChange, value } }) => (
//             <TextInput
//               style={styles.passwordInput}
//               placeholder="Password"
//               secureTextEntry={!showPassword}
//               value={value}
//               onChangeText={onChange}
//               autoCapitalize="none"
//             />
//           )}
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
//         </TouchableOpacity>
//       </View>
//       {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
// <View style={{ alignItems: "flex-end", marginBottom: hp(2) }}>
//   <Text
//     style={{ color: theme.SECONDARY_COLOR, fontSize: 13, fontWeight: "500" }}
//     onPress={() => navigation.navigate("forgotPassWordScreen")}
//   >
//     Forgot Password?
//   </Text>
// </View>
//       <TouchableOpacity
//         style={[styles.signInBtn, loading && { opacity: 0.8 }]}
//         onPress={handleSubmit(onSubmit)}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <Text style={styles.signInText}>Sign In</Text>
//         )}
//       </TouchableOpacity>

//       <View style={styles.orContainer}>
//         <View style={styles.line} />
//         <Text style={styles.orText}>OR</Text>
//         <View style={styles.line} />
//       </View>

//       <TouchableOpacity style={styles.googleBtn}>
//         <Image
//           source={require("../../../assets/images/splashImage.jpg")}
//           style={styles.googleIcon}
//         />
//         <Text style={styles.googleText}>Continue with Google</Text>
//       </TouchableOpacity>

//       <Text style={styles.footerText}>
//         Don’t have an account?{" "}
//         <Text style={styles.signUpLink} onPress={() => navigation.navigate("signUpScreen")}>
//           Sign Up
//         </Text>
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: hp(2),
//     backgroundColor: "#fff",
//   },
//   logo: {
//     width: 150,
//     height: 100,
//     alignSelf: "center",
//     marginBottom: hp(2),
//   },
//   heading: {
//     fontSize: 20,
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     textAlign: "center",
//     marginBottom: hp(3),
//     color: "#333",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: hp(1.5),
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//   },
//   passwordContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     paddingHorizontal: 12,
//     marginBottom: hp(2),
//   },
//   passwordInput: {
//     flex: 1,
//     paddingVertical: 10,
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//   },
//   signInBtn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     paddingVertical: hp(1.8),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     alignItems: "center",
//     marginBottom: hp(2),
//   },
//   signInText: {
//     color: "#fff",
//     fontSize: 16,
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//   },
//   orContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: hp(2),
//   },
//   line: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "#ccc",
//   },
//   orText: {
//     marginHorizontal: 8,
//     color: "#666",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//   },
//   googleBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     paddingVertical: hp(1.5),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     justifyContent: "center",
//   },
//   googleIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 10,
//   },
//   googleText: {
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     fontSize: 15,
//     color: "#333",
//   },
//   footerText: {
//     textAlign: "center",
//     marginTop: hp(2),
//     fontSize: 14,
//     color: "#555",
//   },
//   signUpLink: {
//     color: theme.SECONDARY_COLOR,
//     fontWeight: "bold",
//   },
//   error: {
//     color: "red",
//     marginBottom: hp(1),
//     fontSize: 12,
//   },
// });

// export default SignInScreen;

import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

import axiosClient, { apiRequest } from "@/src/api/client";
import theme from "@/src/assets/colors/theme";
import ErrorModal from "@/src/Common/ErrorModal";
import SuccessModal from "@/src/Common/SuccessModal";
import { AuthContext } from "@/src/context/authContext";
import { hp, wp } from "@/src/assets/utils/responsive";

type FormValues = { login_input: string; password: string };

const SignInScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);

  const { control, handleSubmit, formState, reset } = useForm<FormValues>({
    defaultValues: { login_input: "", password: "" },
    mode: "onSubmit",
  });
  const { errors } = formState;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message?: string }>({ visible: false });
  const [successModal, setSuccessModal] = useState<{ visible: boolean; message?: string }>({ visible: false });

  const { width } = useWindowDimensions();

  const fade = useSharedValue(0);
  useEffect(() => {
    fade.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: (1 - fade.value) * 10 }],
  }));

  const onSignIn = useCallback(
    async (payload: FormValues) => {
      setLoading(true);
      try {
        // use apiRequest wrapper for consistent error normalization (optional)
        const res = await apiRequest<{ token?: string; accessToken?: string; refreshToken?: string; user?: any; userId?: string }>(() =>
          axiosClient.post("/api/auth/signin", payload)
        );

        // server may return different key names
        const token = res.token ?? res.accessToken ?? null;
        const refreshToken = res.refreshToken ?? null;
        const userId = res.user?.id ?? res.userId ?? null;

        if (!token) {
          setErrorModal({ visible: true, message: "No access token received from server." });
          return;
        }

        // delegate actual auth flow to AuthContext
        await signIn(token, userId, refreshToken);

        // optionally show a success modal (if you want a confirmation before redirect)
        setSuccessModal({ visible: true, message: "Signed in successfully." });

        // reset form (good UX)
        reset();
      } catch (rawErr: any) {
        // apiRequest throws normalized objects, but also handle axios errors directly
        const serverMsg = rawErr?.message ?? (rawErr?.response?.data?.message ?? null);
        const normalized = typeof serverMsg === "string" ? serverMsg : (rawErr?.response?.data?.message ?? null);

        if (normalized === "User not found") {
          setErrorModal({ visible: true, message: "Account not found. Please sign up." });
        } else if (normalized === "Invalid credentials") {
          setErrorModal({ visible: true, message: "Invalid email or password." });
        } else {
          setErrorModal({ visible: true, message: normalized ?? "Unable to sign in. Try again later." });
        }
      } finally {
        setLoading(false);
      }
    },
    [signIn, reset]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: wp(5), paddingTop: hp(2), paddingBottom: hp(4), flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={[{ flex: 1 }, animStyle as any]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(1) }}>
              <Text style={{ fontSize: hp(2.6), fontWeight: "700", color: "#222" }}>Welcome Again!</Text>
              <Pressable onPress={() => navigation.navigate("signUpScreen" as never)} accessibilityRole="button" accessibilityLabel="Go back">
                <Ionicons name="chevron-forward-outline" size={hp(3)} color={theme.PRIMARY_COLOR} />
              </Pressable>
            </View>

            <Text style={{ fontSize: hp(1.6), color: "#666", marginBottom: hp(2) }}>Enter your email and password</Text>

            <Text style={{ color: "black", paddingVertical: hp(1), fontWeight: "500", fontSize: hp(1.6) }}>Your Email</Text>
            <Controller
              control={control}
              name="login_input"
              rules={{
                required: "Email or phone is required",
                minLength: { value: 3, message: "Enter a valid email or phone" },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[{
                    borderWidth: 1, borderColor: "#EAEAEA", borderRadius: hp(1.2),
                    paddingHorizontal: wp(3.5), paddingVertical: Platform.OS === "ios" ? hp(1.6) : hp(1.3),
                    fontSize: hp(1.9), marginBottom: hp(1), color: "#222"
                  }, errors.login_input && { borderColor: "#D32F2F" }]}
                  placeholder="example@mail.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  accessibilityLabel="Email or Phone"
                  placeholderTextColor="#9B9B9B"
                />
              )}
            />
            {errors.login_input && <Text style={{ color: "#D32F2F", marginBottom: hp(0.8), fontSize: hp(1.5) }}>{errors.login_input.message}</Text>}

            <Text style={{ color: "black", paddingVertical: hp(1), fontWeight: "500", fontSize: hp(1.6) }}>Your Password</Text>
            <View style={{
              flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EAEAEA",
              borderRadius: hp(1.2), paddingHorizontal: wp(3.5), marginBottom: hp(1)
            }}>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={{ flex: 1, paddingVertical: Platform.OS === "ios" ? hp(1.6) : hp(1.3), fontSize: hp(1.9), color: "#222" }}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    accessibilityLabel="Password"
                    placeholderTextColor="#9B9B9B"
                  />
                )}
              />
              <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Toggle password visibility">
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#777" />
              </Pressable>
            </View>
            {errors.password && <Text style={{ color: "#D32F2F", marginBottom: hp(0.8), fontSize: hp(1.5) }}>{errors.password.message}</Text>}

            <Pressable style={{ alignItems: "flex-end", marginBottom: hp(1.6) }} onPress={() => navigation.navigate("otpVerificationScreen" as never)}>
              <Text style={{ color: theme.PRIMARY_COLOR, fontSize: hp(1.6), fontWeight: "500" }}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              style={{ backgroundColor: theme.PRIMARY_COLOR, paddingVertical: hp(1.9), borderRadius: hp(1), alignItems: "center", marginBottom: hp(2), opacity: loading ? 0.85 : 1 }}
              onPress={handleSubmit(onSignIn)}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Proceed to Home"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: hp(2) }}>Proceed to Home</Text>}
            </Pressable>

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hp(1.6) }}>
              <View style={{ flex: 1, height: 1, backgroundColor: "#EEE" }} />
              <Text style={{ marginHorizontal: wp(2.5), color: "#777", fontSize: hp(1.6) }}>Or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#EEE" }} />
            </View>

            <Pressable style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EAEAEA", paddingVertical: hp(1.4), borderRadius: hp(1), justifyContent: "center" }} onPress={() => {/* implement Google sign-in flow */}}>
              <Ionicons name="logo-google" size={20} style={{ marginRight: 8 }} color="#DB4437" />
              <Text style={{ fontSize: hp(1.9), color: "#222" }}>Continue with Google</Text>
            </Pressable>

            <Text style={{ textAlign: "center", marginTop: hp(2), color: "#666", fontSize: hp(1.6) }}>
              Don’t have an account?{" "}
              <Text style={{ color: theme.PRIMARY_COLOR, fontWeight: "700" }} onPress={() => navigation.navigate("signUpScreen" as never)}>Sign Up</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ErrorModal visible={errorModal.visible} message={errorModal.message} onClose={() => setErrorModal({ visible: false })} />
      <SuccessModal visible={successModal.visible} message={successModal.message} onClose={() => setSuccessModal({ visible: false })} />
    </SafeAreaView>
  );
};

export default SignInScreen;
