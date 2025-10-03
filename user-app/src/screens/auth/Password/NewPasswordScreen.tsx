
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import axiosClient, { apiRequest } from "@/src/api/client";

import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "@/src/assets/routes/route";
import ErrorModal from "@/src/Common/ErrorModal";
import SuccessModal from "@/src/Common/SuccessModal";

type FormValues = { password: string; confirmPassword: string };
type RouteParams = { email?: string; otp?: string };

const TRANS_Y = 12;
const DURATION = 420;

const NewPasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otp } = (route.params as RouteParams) || {};

  const { control, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onSubmit",
  });
  const { errors } = formState;
  const passwordValue = watch("password");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // separate modals
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message?: string }>({ visible: false });
  const [successModal, setSuccessModal] = useState<{ visible: boolean; message?: string }>({ visible: false });

  const entrance = useSharedValue(0);
  const success = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) });
  }, [entrance]);

  const containerAnim = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * TRANS_Y }],
  }));

  const successAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + success.value * 0.05 }],
  }));

  const onSubmit = useCallback(
    async (data: FormValues) => {
      if (!email || !otp) {
        setErrorModal({ visible: true, message: "Missing email or OTP. Please retry the reset flow." });
        return;
      }
      if (data.password.length < 6) {
        setErrorModal({ visible: true, message: "Password must be at least 6 characters." });
        return;
      }

      setLoading(true);
      try {
        const payload = { email: String(email).trim(), otp: String(otp).trim(), newPassword: data.password };
        const res = await apiRequest<any>(() => axiosClient.post("/api/auth/reset-password", payload));

        success.value = withDelay(80, withTiming(1, { duration: 360, easing: Easing.out(Easing.back(1.0)) }));
        setSuccessModal({ visible: true, message: res?.message ?? "Password updated successfully." });
      } catch (err: any) {
        setErrorModal({ visible: true, message: err?.message ?? err?.response?.data?.message ?? "Failed to reset password" });
      } finally {
        setLoading(false);
      }
    },
    [email, otp, success]
  );

  return (
    <SafeAreaContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Animated.View style={[styles.root, containerAnim as any]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>New Password</Text>

            <Pressable
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  // If this screen is root (because we reset the stack), send user to SignIn.
                  navigation.reset({ index: 0, routes: [{ name: ROUTES.SIGN_IN as never }] });
                }
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back-outline" size={hp(3)} color="#111" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>Create New Password</Text>

          <Text style={styles.label}>Enter Password</Text>
          <Controller
            control={control}
            name="password"
            rules={{ required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputRow, errors.password && styles.inputError]}>
                <TextInput placeholder="••••••••" placeholderTextColor="#9B9B9B" secureTextEntry={!showPassword} value={value} onChangeText={onChange} style={styles.input} autoCapitalize="none" accessibilityLabel="Enter new password" />
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8} accessibilityRole="button">
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
                </Pressable>
              </View>
            )}
          />
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

          <Text style={[styles.label, { marginTop: hp(1.2) }]}>Re-Enter Password</Text>
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: "Please confirm password",
              validate: (val) => (val === passwordValue ? true : "Passwords do not match"),
            }}
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputRow, errors.confirmPassword && styles.inputError]}>
                <TextInput placeholder="••••••••" placeholderTextColor="#9B9B9B" secureTextEntry={!showConfirm} value={value} onChangeText={onChange} style={styles.input} autoCapitalize="none" accessibilityLabel="Confirm password" />
                <Pressable onPress={() => setShowConfirm((s) => !s)} hitSlop={8} accessibilityRole="button">
                  <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#666" />
                </Pressable>
              </View>
            )}
          />
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

          <Animated.View style={[styles.ctaWrap, successAnimStyle as any]}>
            <Pressable style={[styles.cta, loading && { opacity: 0.8 }]} onPress={handleSubmit(onSubmit)} disabled={loading} accessibilityRole="button">
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Proceed to Home</Text>}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>

      <ErrorModal visible={errorModal.visible} message={errorModal.message} onClose={() => setErrorModal({ visible: false })} />
      <SuccessModal
        visible={successModal.visible}
        message={successModal.message}
        onClose={() => {
          setSuccessModal({ visible: false });
          // When success modal closed, reset to SignIn so user can't navigate back here
          navigation.reset({ index: 0, routes: [{ name: ROUTES.SIGN_IN as never }] });
        }}
      />
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: wp(4), paddingTop: hp(2), backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(1) },
  title: { fontSize: hp(3), fontWeight: "700", color: "#111" },
  subtitle: { color: "#444", marginBottom: hp(2.2), fontSize: hp(1.6) },
  label: { fontSize: hp(1.6), fontWeight: "500", color: "#222", marginBottom: hp(0.6) },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E6E6E6", borderRadius: hp(1), paddingHorizontal: wp(3.2), paddingVertical: Platform.OS === "ios" ? hp(1.4) : hp(1.0) },
  input: { flex: 1, fontSize: hp(1.9), color: "#222", paddingVertical: 0 },
  inputError: { borderColor: "#D32F2F" },
  error: { color: "#D32F2F", marginTop: hp(0.6), fontSize: hp(1.4) },
  ctaWrap: { marginTop: hp(3) },
  cta: { backgroundColor: theme.PRIMARY_COLOR, paddingVertical: hp(1.8), borderRadius: hp(1), alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: hp(1.9) },
});

export default NewPasswordScreen;
