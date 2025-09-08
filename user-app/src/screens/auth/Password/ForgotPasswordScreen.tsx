import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { BASE_URL } from "@/api";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import axiosClient from "@/src/api/client";

type FormData = { email: string };

const ForgotPasswordScreen = ({ navigation }: any) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ defaultValues: { email: "" } });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await axiosClient.post(`${BASE_URL}/api/auth/request-otp`, { email: data.email });
      Alert.alert("OTP Sent", res.data.message, [
        { text: "OK", onPress: () => navigation.navigate("resetPasswordScreen", { email: data.email }) },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Controller
        control={control}
        name="email"
        rules={{ required: "Email is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && { borderColor: "red" }]}
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: hp(2), backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: hp(2), textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: hp(1.5) },
  error: { color: "red", marginBottom: hp(1) },
  button: { backgroundColor: theme.PRIMARY_COLOR, padding: 15, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" },
});
