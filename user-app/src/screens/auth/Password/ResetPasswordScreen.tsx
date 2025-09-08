// ResetPasswordScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { BASE_URL } from "@/api";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import axiosClient from "@/src/api/client";

type FormData = {
  otp: string;
  newPassword: string;
};

const ResetPasswordScreen = ({ route, navigation }: any) => {
  const { email } = route.params; // email passed from ForgotPasswordScreen
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { otp: "", newPassword: "" },
  });

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60 sec countdown

  // countdown effect
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await axiosClient.post(`${BASE_URL}/api/auth/reset-password`, {
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });

      Alert.alert("Success", "Password reset successful", [
        { text: "OK", onPress: () => navigation.navigate("signInScreen") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResendLoading(true);
    try {
      await axiosClient.post(`${BASE_URL}/api/auth/request-otp`, { email });
      Alert.alert("OTP Resent", "A new OTP has been sent to your email.");
      setTimer(60); // restart countdown
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subTitle}>OTP sent to {email}</Text>

      {/* OTP Input */}
      <Controller
        control={control}
        name="otp"
        rules={{ required: "OTP is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.otp && { borderColor: "red" }]}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.otp && <Text style={styles.error}>{errors.otp.message}</Text>}

      {/* New Password Input */}
      <Controller
        control={control}
        name="newPassword"
        rules={{ required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.newPassword && { borderColor: "red" }]}
            placeholder="New Password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.newPassword && <Text style={styles.error}>{errors.newPassword.message}</Text>}

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset Password</Text>}
      </TouchableOpacity>

      {/* Resend OTP */}
      <TouchableOpacity
        onPress={resendOtp}
        disabled={timer > 0 || resendLoading}
        style={[styles.resendBtn, (timer > 0 || resendLoading) && { opacity: 0.5 }]}
      >
        {resendLoading ? (
          <ActivityIndicator size="small" color={theme.SECONDARY_COLOR} />
        ) : (
          <Text style={styles.resendText}>
            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: hp(2), backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: hp(1), textAlign: "center" },
  subTitle: { fontSize: 14, textAlign: "center", marginBottom: hp(2), color: "#555" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: hp(1.5) },
  error: { color: "red", marginBottom: hp(1) },
  button: { backgroundColor: theme.PRIMARY_COLOR, padding: 15, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" },
  resendBtn: { marginTop: hp(2), alignItems: "center" },
  resendText: { color: theme.SECONDARY_COLOR, fontWeight: "600" },
});
