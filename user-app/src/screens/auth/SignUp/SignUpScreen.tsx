// // CreateSignUpScreen.tsx
// import React, { useState } from "react";
// import {
//   View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
//   ScrollView, Pressable, Alert
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
// import axiosClient from "@/src/api/client";

// interface FormData {
//   username: string;
//   email: string;
//   country_code: string;
//   phone: string;
//   password: string;
// }

// const SignUpScreen = () => {
//   const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
//     defaultValues: {
//       username: "",
//       email: "",
//       country_code: "+91",
//       phone: "",
//       password: "",
//     },
//   });

//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const [showPassword, setShowPassword] = useState(false);

//   const onSubmit = async (data: FormData) => {
//     try {
//       const response = await axiosClient.post(`${BASE_URL}/api/auth/signup`, {
//         username: data.username,
//         email: data.email,
//         country_code: "+91",
//         phone: data.phone,
//         password: data.password,
//         role: "user", // ⬅️ Main difference here
//         login_type: "email",
//       });

//      if (response.status === 201) {
// //   const { token } = response.data;
//     // await AsyncStorage.setItem("authToken", token);
    
//     navigation.navigate("signInScreen");

// }

//     } catch (error) {
//       console.log("🔴 User SignUp failed:", error?.response?.data || error.message || error);
//       Alert.alert("Error", "Sign up failed. Try again.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Pressable onPress={() => { navigation.goBack(); reset(); }}>
//         <Ionicons name="chevron-back-outline" size={hp(3)} color={theme.PRIMARY_COLOR} />
//       </Pressable>
//       <ScrollView>
//         <Image
//           source={require("../../../assets/images/FirstLogo-removebg-preview.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />
//         <Text style={styles.heading}>Create Your User Account</Text>

//         {/* Name */}
//         <Controller control={control} name="username" rules={{ required: "Name is required" }}
//           render={({ field: { onChange, value } }) => (
//             <TextInput style={styles.input} placeholder="Full Name" value={value} onChangeText={onChange} />
//           )}
//         />
//         {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

//         {/* Email */}
//         <Controller control={control} name="email" rules={{ required: "Email is required" }}
//           render={({ field: { onChange, value } }) => (
//             <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" value={value} onChangeText={onChange} />
//           )}
//         />
//         {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

//         {/* Phone */}
//         <View style={styles.phoneContainer}>
//           <Text style={styles.countryCode}>+91</Text>
//           <Controller control={control} name="phone" rules={{ required: "Phone number is required" }}
//             render={({ field: { onChange, value } }) => (
//               <TextInput style={styles.phoneInput} placeholder="Phone Number" keyboardType="phone-pad" value={value} onChangeText={onChange} />
//             )}
//           />
//         </View>
//         {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

//         {/* Password */}
//         <View style={styles.passwordContainer}>
//           <Controller control={control} name="password" rules={{ required: "Password is required", minLength: 6 }}
//             render={({ field: { onChange, value } }) => (
//               <TextInput
//                 style={styles.passwordInput}
//                 placeholder="Password"
//                 secureTextEntry={!showPassword}
//                 value={value}
//                 onChangeText={onChange}
//               />
//             )}
//           />
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//             <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
//           </TouchableOpacity>
//         </View>
//         {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

//         {/* Sign Up Button */}
//         <TouchableOpacity style={styles.signUpBtn} onPress={handleSubmit(onSubmit)}>
//           <Text style={styles.signUpText}>Sign Up</Text>
//         </TouchableOpacity>

//         {/* Already have account? */}
//         <Text style={styles.footerText}>
//           Already have an account?{" "}
//           <Text style={styles.signInLink} onPress={() => navigation.navigate("signInScreen")}>
//             Sign In
//           </Text>
//         </Text>
//       </ScrollView>
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
//     height: 150,
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
//   phoneContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     marginBottom: hp(1.5),
//   },
//   countryCode: {
//     paddingHorizontal: 12,
//     fontSize: 16,
//     color: "#555",
//   },
//   phoneInput: {
//     flex: 1,
//     paddingVertical: 10,
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
//   signUpBtn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     paddingVertical: hp(1.8),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     alignItems: "center",
//     marginBottom: hp(2),
//   },
//   signUpText: {
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
//   signInLink: {
//     color: theme.SECONDARY_COLOR,
//     fontWeight: "bold",
//   },
//   error: {
//     color: "red",
//     marginBottom: hp(1),
//     fontSize: 12,
//   },
// });

// export default SignUpScreen;

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axiosClient, { apiRequest } from "@/src/api/client";
import ErrorModal from "@/src/Common/ErrorModal";
import SuccessModal from "@/src/Common/SuccessModal";

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
}

const CreateSignUpScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { control, handleSubmit, reset, formState } = useForm<FormData>({
    defaultValues: { username: "", email: "", phone: "", password: "" },
    mode: "onSubmit",
  });

  const { errors } = formState;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message?: string }>({ visible: false });
  const [successModal, setSuccessModal] = useState<{ visible: boolean; message?: string }>({ visible: false });
  const submittingRef = useRef(false);

  const onSubmit = async (data: FormData) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      const payload = {
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(),
        country_code: "+91",
        phone: data.phone.trim(),
        password: data.password,
        role: "user",
        login_type: "email",
      };

      const res = await apiRequest<any>(() => axiosClient.post("/api/auth/signup", payload));

      // If backend responds with an explicit created flag or message — respect it.
      const message = res?.message ?? "Account created. Please sign in.";
      setSuccessModal({ visible: true, message });

      // on success, reset form and navigate after user closes modal
      reset();
    } catch (rawErr: any) {
      const msg = rawErr?.message ?? rawErr?.response?.data?.message ?? "Sign up failed";
      setErrorModal({ visible: true, message: msg });
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Welcome Again!</Text>
            <Pressable
              onPress={() => {
                navigation.goBack();
                reset();
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back-outline" size={hp(3)} color={theme.PRIMARY_COLOR} />
            </Pressable>
          </View>

          <Text style={styles.sub}>Enter your details</Text>

          <Text style={styles.label}>Enter Your Name</Text>
          <Controller
            control={control}
            name="username"
            rules={{ required: "Name is required", minLength: { value: 2, message: "Enter your full name" } }}
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, errors.username && styles.inputError]} placeholder="Enter Your Name" value={value} onChangeText={onChange} autoCapitalize="words" placeholderTextColor="#9B9B9B" accessibilityLabel="Full name" />
            )}
          />
          {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

          <Text style={styles.label}>Enter Your Mobile Number</Text>
          <View style={[styles.phoneContainer, errors.phone && styles.inputError]}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>+91</Text>
            </View>
            <Controller
              control={control}
              name="phone"
              rules={{
                required: "Phone number is required",
                pattern: { value: /^[0-9]{6,14}$/, message: "Enter a valid phone number" },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput style={styles.phoneInput} placeholder="Your mobile number" keyboardType="phone-pad" value={value} onChangeText={onChange} placeholderTextColor="#9B9B9B" accessibilityLabel="Phone number" />
              )}
            />
          </View>
          {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

          <Text style={styles.label}>Your Email</Text>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="example@gmail.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} placeholderTextColor="#9B9B9B" accessibilityLabel="Email address" />
            )}
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

          <Text style={styles.label}>Password</Text>
          <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
            <Controller
              control={control}
              name="password"
              rules={{ required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } }}
              render={({ field: { onChange, value } }) => (
                <TextInput style={styles.passwordInput} placeholder="Password" secureTextEntry={!showPassword} value={value} onChangeText={onChange} placeholderTextColor="#9B9B9B" accessibilityLabel="Password" />
              )}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)} accessibilityRole="button" accessibilityLabel="Toggle password visibility">
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={hp(2.4)} color="#777" />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

          <TouchableOpacity style={[styles.signUpBtn, loading && { opacity: 0.8 }]} onPress={handleSubmit(onSubmit)} disabled={loading} accessibilityRole="button" accessibilityLabel="Sign up">
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signUpText}>Proceed to Home</Text>}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.signInLink} onPress={() => navigation.navigate("signInScreen" as never)}>
              Sign In
            </Text>
          </Text>
        </ScrollView>

        <ErrorModal visible={errorModal.visible} message={errorModal.message} onClose={() => setErrorModal({ visible: false })} />
        <SuccessModal
          visible={successModal.visible}
          message={successModal.message}
          onClose={() => {
            setSuccessModal({ visible: false });
            navigation.navigate("signInScreen" as never);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: wp(4), paddingTop: hp(2), paddingBottom: hp(6) },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(1) },
  heading: { fontSize: hp(2.6), fontWeight: "700", color: "#222" },
  sub: { fontSize: hp(1.6), color: "#666", marginBottom: hp(2) },
  label: { color: "black", paddingVertical: hp(1), fontWeight: "500", fontSize: hp(1.6) },
  input: { borderWidth: 1, borderColor: "#E6E6E6", borderRadius: hp(1), paddingHorizontal: wp(3.2), paddingVertical: Platform.OS === "ios" ? hp(1.6) : hp(1.2), fontSize: hp(1.9), marginBottom: hp(1), color: "#222" },
  inputError: { borderColor: "#D32F2F" },
  phoneContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E6E6E6", borderRadius: hp(1), overflow: "hidden" },
  codeBox: { paddingHorizontal: wp(3), paddingVertical: Platform.OS === "ios" ? hp(1.6) : hp(1.2), backgroundColor: "#F7F7F7", borderRightWidth: 1, borderRightColor: "#EEE", justifyContent: "center", alignItems: "center" },
  codeText: { fontSize: hp(1.8), color: "#333" },
  phoneInput: { flex: 1, paddingHorizontal: wp(3), paddingVertical: Platform.OS === "ios" ? hp(1.6) : hp(1.2), fontSize: hp(1.9), color: "#222" },
  passwordContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E6E6E6", borderRadius: hp(1), paddingHorizontal: wp(3.2), marginBottom: hp(1.6) },
  passwordInput: { flex: 1, paddingVertical: Platform.OS === "ios" ? hp(1.6) : hp(1.2), fontSize: hp(1.9), color: "#222" },
  signUpBtn: { backgroundColor: theme.PRIMARY_COLOR, paddingVertical: hp(1.9), borderRadius: hp(1), alignItems: "center", marginTop: hp(2) },
  signUpText: { color: "#fff", fontSize: hp(2), fontWeight: "700" },
  footerText: { textAlign: "center", marginTop: hp(2.2), fontSize: hp(1.6), color: "#666" },
  signInLink: { color: theme.SECONDARY_COLOR, fontWeight: "700" },
  error: { color: "#D32F2F", marginBottom: hp(0.8), fontSize: hp(1.5) },
});

export default CreateSignUpScreen;

// Key changes

// Uses apiRequest + axiosClient.post("/api/auth/signup", ...) (no BASE_URL).

// Uses SuccessModal for consistent UX.

// Keeps the guard submittingRef to avoid double submits.