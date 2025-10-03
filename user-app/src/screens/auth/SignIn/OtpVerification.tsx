// import React from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   StyleSheet, 
//   KeyboardAvoidingView, 
//   Platform 
// } from 'react-native';
// import { useForm, Controller } from 'react-hook-form';
// import { hp, wp } from '@/src/assets/utils/responsive';
// import theme from '@/src/assets/colors/theme';
// import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
// import { useNavigation } from 'expo-router';
// import { useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const PRIMARY = theme?.PRIMARY_COLOR ?? '#562E19';

// const OtpVerificationScreen: React.FC = () => {
//     const route = useRoute();
//   const { otp: sentOtp, phone } = route.params as { otp: string; phone: string };
//   const { control, handleSubmit, formState: { errors } } = useForm({
//     defaultValues: { otp: '' },
//   });
//     const navigation = useNavigation();
// const insets = useSafeAreaInsets();
//    const onSubmit = async (data: any) => {
//     if (data.otp === sentOtp) {
//       // Save token to AsyncStorage
//       await AsyncStorage.setItem("authToken", "dummy_token_for_testing");
//       console.log("OTP verified. Token saved.");

//       navigation.navigate("bottomTabScreen");
//     } else {
//       alert("Invalid OTP");
//     }
//   };

//   return (
//     <SafeAreaView style={[styles.safe,{paddingTop:insets.top}]}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={styles.container}
//       >
//         {/* <View style={styles.topSpacer} /> */}
// <Text>We've sent a 4-digit code to +91 {phone}</Text>
//       <Text style={{ marginTop: 10 }}>Your OTP is: {sentOtp}</Text> {/* TEST ONLY */}
//         <View style={styles.content}>
//           <Text style={styles.title}>Enter OTP</Text>
//           <Text style={styles.subtitle}>
//             We've sent a 6-digit code to +91 6786846547
//           </Text>

//           <Text style={styles.label}>OTP</Text>
//           <Controller
//             control={control}
//             name="otp"
//             rules={{ required: 'OTP is required' }}
//             render={({ field: { onChange, value } }) => (
//               <TextInput
//                 value={value}
//                 onChangeText={onChange}
//                 keyboardType="number-pad"
//                 placeholder="Enter 6-digit OTP"
//                 style={styles.input}
//                 maxLength={6}
//               />
//             )}
//           />
//           {errors.otp && <Text style={styles.error}>{errors.otp.message}</Text>}

//           <TouchableOpacity
//             style={styles.button}
//             onPress={handleSubmit(onSubmit)}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.buttonText}>Verify OTP</Text>
//           </TouchableOpacity>

//           <TouchableOpacity activeOpacity={0.8}>
//             <Text style={styles.resend}>Resend OTP</Text>
//           </TouchableOpacity>
//         </View>

//         {/* <View style={styles.bottomSpacer} /> */}
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#fff' },
//   container: { flex: 1 },
//   // topSpacer: { height: hp(8) },
//   // bottomSpacer: { flex: 1 },
//   content: { paddingHorizontal: wp(5),paddingTop:hp(3) },
//   title: { fontSize: hp(3.5), fontWeight: "700", marginBottom: hp(0.5),fontFamily:theme.PRIMARY_FONT_FAMILY },
//   subtitle: { color: '#444', marginBottom: hp(4), fontSize: hp(1.8) },
//   label: { marginBottom: hp(1), fontSize: hp(1.6), fontWeight: '500' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 8,
//     paddingHorizontal: wp(3),
//     height: hp(6.5),
//     fontSize: hp(1.9),
//     marginBottom: hp(0.8),
//   },
//   error: { color: '#D32F2F', marginBottom: hp(1) },
//   button: {
//     backgroundColor: PRIMARY,
//     paddingVertical: hp(1.6),
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: hp(1.5),
//   },
//   buttonText: { color: '#fff', fontSize: hp(2), fontWeight: '600' },
//   resend: { color: '#999', textAlign: 'center', marginTop: hp(2), textDecorationLine: 'underline' },
// });
// export default OtpVerificationScreen;


import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import axiosClient, { apiRequest } from "@/src/api/client";
import ErrorModal from "@/src/Common/ErrorModal";
import SuccessModal from "@/src/Common/SuccessModal";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import { ROUTES } from "@/src/assets/routes/route";

type FormValues = { email: string; otp: string };
const RESEND_SECONDS = 30;

const OtpVerification: React.FC = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { control, handleSubmit, getValues, setValue, formState } = useForm<FormValues>({
    defaultValues: { email: "", otp: "" },
    mode: "onSubmit",
  });
  const { errors } = formState;

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(0);

  // separate modal states
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message?: string }>({ visible: false });
  const [successModal, setSuccessModal] = useState<{ visible: boolean; message?: string }>({ visible: false });

  const submittingRef = useRef(false);
  const isMountedRef = useRef(true);
  const currentOtpRef = useRef<string | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);

  // animations
  const entrance = useSharedValue(0);
  const successAnim = useSharedValue(0);

  useEffect(() => {
    isMountedRef.current = true;
    entrance.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });

    return () => {
      isMountedRef.current = false;
      if (activeControllerRef.current) activeControllerRef.current.abort();
    };
  }, [entrance]);

  const containerAnim = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 10 }],
  }));

  const successAnimStyle = useAnimatedStyle(() => ({
    opacity: successAnim.value,
    transform: [{ scale: 0.95 + successAnim.value * 0.1 }],
  }));

  // resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const startResendTimer = useCallback(() => setResendTimer(RESEND_SECONDS), []);

  const sendCode = useCallback(
    async (vals?: { email?: string }) => {
      const email = (vals?.email ?? getValues("email") ?? "").trim();
      if (!email) {
        setErrorModal({ visible: true, message: "Please enter an email address." });
        return;
      }
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSending(true);

      // abort previous
      if (activeControllerRef.current) activeControllerRef.current.abort();
      const controller = new AbortController();
      activeControllerRef.current = controller;

      try {
        const res = await apiRequest<any>(() =>
          axiosClient.post("/api/auth/request-otp", { email }, { signal: controller.signal } as any)
        );

        if (!isMountedRef.current) return;

        // mark sent and show success modal
        setEmailSent(true);
        startResendTimer();
        setSuccessModal({ visible: true, message: res?.message ?? "OTP sent to your email." });
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.message === "canceled") {
          // aborted - ignore
        } else {
          setErrorModal({ visible: true, message: err?.message ?? "Failed to send code" });
        }
      } finally {
        setSending(false);
        submittingRef.current = false;
      }
    },
    [getValues, startResendTimer]
  );

  const verifyOtp = useCallback(
    async (vals: { otp: string }) => {
      const email = (getValues("email") ?? "").trim();
      const otp = (vals?.otp ?? "").trim();
      if (!email) {
        setErrorModal({ visible: true, message: "Email is required." });
        return;
      }
      if (!otp || otp.length < 4) {
        setErrorModal({ visible: true, message: "Enter a valid OTP." });
        return;
      }

      if (submittingRef.current) return;
      submittingRef.current = true;
      setVerifying(true);

      if (activeControllerRef.current) activeControllerRef.current.abort();
      const controller = new AbortController();
      activeControllerRef.current = controller;

      try {
        const res = await apiRequest<any>(() =>
          axiosClient.post("/api/auth/verify-otp", { email, otp }, { signal: controller.signal } as any)
        );

        if (!isMountedRef.current) return;
        currentOtpRef.current = otp;
        setEmailVerified(true);

        successAnim.value = withDelay(80, withTiming(1, { duration: 420, easing: Easing.out(Easing.back(1.1)) }));
        setSuccessModal({ visible: true, message: res?.message ?? "Email verified." });
      } catch (err: any) {
        setEmailVerified(false);
        setErrorModal({ visible: true, message: err?.message ?? "OTP verification failed" });
      } finally {
        setVerifying(false);
        submittingRef.current = false;
      }
    },
    [getValues, successAnim]
  );

  // Option A: reset stack so NewPassword becomes root (user cannot go back to OTP)
  const proceedToReset = useCallback(() => {
    if (!emailVerified) {
      setErrorModal({ visible: true, message: "Please verify your email before proceeding." });
      return;
    }
    const email = (getValues("email") ?? "").trim();
    const otp = currentOtpRef.current;
    if (!email || !otp) {
      setErrorModal({ visible: true, message: "Missing email or OTP. Please retry the reset flow." });
      return;
    }

    // IMPORTANT: ensure ROUTES.NEW_PASSWORD is the exact registered name in your navigator
    nav.reset({
      index: 0,
      routes: [{ name: ROUTES.NEW_PASSWORD as never, params: { email, otp } as never }],
    });
  }, [emailVerified, getValues, nav]);

  const onEmailChange = useCallback(
    (text: string) => {
      if (emailSent) {
        setEmailSent(false);
        setEmailVerified(false);
        setValue("otp", "");
        currentOtpRef.current = null;
        setResendTimer(0);
      }
      setValue("email", text);
    },
    [emailSent, setValue]
  );

  return (
    <SafeAreaContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Animated.View style={[styles.root, containerAnim as any]}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter your email address</Text>

          <Controller
            control={control}
            name="email"
            rules={{ required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } }}
            render={({ field: { value } }) => (
              <TextInput
                value={value}
                onChangeText={onEmailChange}
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="example@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9B9B9B"
                accessibilityLabel="Email"
              />
            )}
          />
          {errors.email && <Text style={styles.err}>{errors.email.message}</Text>}

          <Pressable
            style={[styles.primary, (sending || emailSent) && { opacity: 0.8 }]}
            onPress={() => handleSubmit(sendCode)()}
            disabled={sending || emailSent}
            accessibilityRole="button"
          >
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{emailSent ? "Code Sent" : "Send Code"}</Text>}
          </Pressable>

          {emailSent && (
            <>
              <Text style={[styles.subtitle, { marginTop: hp(2) }]}>Enter OTP</Text>

              <Controller
                control={control}
                name="otp"
                rules={{ required: "OTP required", minLength: { value: 4, message: "Enter a valid OTP" } }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    style={[styles.input, errors.otp && styles.inputError]}
                    placeholder="Enter 6-digit OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholderTextColor="#9B9B9B"
                    accessibilityLabel="OTP"
                  />
                )}
              />
              {errors.otp && <Text style={styles.err}>{errors.otp.message}</Text>}

              <View style={styles.row}>
                <Pressable
                  style={[styles.primary, styles.verifyBtn, verifying && { opacity: 0.8 }]}
                  onPress={() => handleSubmit(verifyOtp)()}
                  disabled={verifying}
                  accessibilityRole="button"
                >
                  {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Verify Code</Text>}
                </Pressable>

                <Pressable onPress={() => sendCode()} disabled={resendTimer > 0 || sending} accessibilityRole="button">
                  <Text style={[styles.resend, resendTimer > 0 ? styles.resendDisabled : null]}>
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
                  </Text>
                </Pressable>
              </View>

              {emailVerified && (
                <Animated.View style={[styles.verifiedBox, successAnimStyle as any]}>
                  <Text style={styles.verifiedText}>Email verified ✅</Text>
                </Animated.View>
              )}

              <Pressable
                style={[styles.primary, !emailVerified && { opacity: 0.5 }]}
                onPress={proceedToReset}
                disabled={!emailVerified}
                accessibilityRole="button"
              >
                <Text style={styles.primaryText}>Proceed to New Password</Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      <ErrorModal visible={errorModal.visible} message={errorModal.message} onClose={() => setErrorModal({ visible: false })} />
      <SuccessModal visible={successModal.visible} message={successModal.message} onClose={() => setSuccessModal({ visible: false })} />
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: wp(4), paddingTop: hp(2), backgroundColor: "#fff" },
  title: { fontSize: hp(3), fontWeight: "700", color: "#222" },
  subtitle: { color: "#444", marginBottom: hp(1.2), fontSize: hp(1.8) },
  input: { borderWidth: 1, borderColor: "#E6E6E6", borderRadius: hp(1), paddingHorizontal: wp(3.2), paddingVertical: Platform.OS === "ios" ? hp(1.6) : hp(1.2), fontSize: hp(1.9), marginBottom: hp(0.8), color: "#222" },
  inputError: { borderColor: "#D32F2F" },
  err: { color: "#D32F2F", marginBottom: hp(0.8), fontSize: hp(1.5) },
  primary: { backgroundColor: theme.PRIMARY_COLOR, paddingVertical: hp(1.6), borderRadius: hp(1), alignItems: "center", marginTop: hp(1) },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: hp(1.9) },
  row: { marginTop: hp(1.2), flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  verifyBtn: { flex: 0.6, marginRight: wp(2) },
  resend: { color: theme.PRIMARY_COLOR, textDecorationLine: "underline", fontSize: hp(1.6) },
  resendDisabled: { color: "#999", textDecorationLine: "none" },
  verifiedBox: { marginTop: hp(1.2), alignItems: "center" },
  verifiedText: { color: "green", fontWeight: "700" },
});

export default OtpVerification;
