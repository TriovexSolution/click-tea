import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosClient from "@/src/assets/api/client";
import { useAuth } from "@/src/context/authContext";

interface FormData {
  login_input: string;
  password: string;
}

const SignInScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      login_input: "",
      password: "",
    },
  });
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth(); // Get signIn from AuthContext

const onSubmit = async (data: FormData) => {
  console.log("Submitting sign in:", data);

  try {
    const response = await axiosClient.post(
      `${BASE_URL}/api/auth/signin`,
      data,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    console.log("Full server response:", JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      const { accessToken, user, refreshToken, message } = response.data ?? {};
      console.log("Extracted accessToken:", accessToken);
      console.log("Extracted user:", user);
      console.log("Extracted refreshToken:", refreshToken);

      if (!accessToken) {
        Alert.alert("Login failed", "Server did not return an auth token. Contact support.");
        return;
      }

      // Call signIn with accessToken, user.id, user.shopId, and refreshToken
      await signIn(accessToken, user.id, user.shopId, refreshToken);

      // Always navigate to OnBoardScreen
      navigation.replace("onBoardScreen");
    }
  } catch (err: any) {
    console.groupCollapsed("SignIn error");
    if (axiosClient.isCancel?.(err)) {
      console.log("axios error message:", err.message);
      console.log("response.data:", err.response?.data);
      const serverMsg = err.response?.data?.message ?? err.response?.data?.error ?? JSON.stringify(err.response?.data);

      if (serverMsg === "User not found") {
        Alert.alert("Account Not Found", "You don't have an account. Please sign up first.", [
          { text: "Sign Up", onPress: () => navigation.navigate("signUpScreen") },
          { text: "Cancel", style: "cancel" },
        ]);
      } else if (serverMsg === "Invalid credentials") {
        Alert.alert("Login Failed", "Incorrect email or password.");
      } else {
        Alert.alert("Error", serverMsg || "Server error. Please try again.");
      }
    } else {
      console.log("non-axios error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
    console.groupEnd();
  }
};

  return (
    <View style={styles.container}>
      {/* 🧋 Logo */}
      <Image
        source={require("../../../assets/images/FirstLogo-removebg-preview.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.heading}>Welcome Back to ClickTea</Text>

      {/* 📧 / 📞 Email or Phone */}
      <Controller
        control={control}
        name="login_input"
        rules={{ required: "Email or Phone is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            keyboardType="default"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.login_input && (
        <Text style={styles.error}>{errors.login_input.message}</Text>
      )}

      {/* 🔒 Password */}
      <View style={styles.passwordContainer}>
        <Controller
          control={control}
          name="password"
          rules={{ required: "Password is required", minLength: 6 }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      {/* 🔐 Sign In Button */}
      <TouchableOpacity
        style={styles.signInBtn}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      {/* 🔁 OR Divider */}
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* 🟠 Google Sign-in */}
      <TouchableOpacity style={styles.googleBtn}>
        <Image
          source={require("../../../assets/images/FirstTeaBaglog.jpg")}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* ➕ Go to Sign Up */}
      <Text style={styles.footerText}>
        Don’t have an account?{" "}
        <Text
          style={styles.signUpLink}
          onPress={() => navigation.navigate("signUpScreen")}
        >
          Sign Up
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: hp(2),
    backgroundColor: "#fff",
  },
  logo: {
    width: 150,
    height: 100,
    alignSelf: "center",
    marginBottom: hp(2),
  },
  heading: {
    fontSize: 20,
    fontFamily: theme.PRIMARY_FONT_FAMILY,
    textAlign: "center",
    marginBottom: hp(3),
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: hp(1.5),
    fontFamily: theme.PRIMARY_FONT_FAMILY,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    paddingHorizontal: 12,
    marginBottom: hp(2),
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: theme.PRIMARY_FONT_FAMILY,
  },
  signInBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(1.8),
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    alignItems: "center",
    marginBottom: hp(2),
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: theme.PRIMARY_FONT_FAMILY,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 8,
    color: "#666",
    fontFamily: theme.PRIMARY_FONT_FAMILY,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: hp(1.5),
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    fontFamily: theme.PRIMARY_FONT_FAMILY,
    fontSize: 15,
    color: "#333",
  },
  footerText: {
    textAlign: "center",
    marginTop: hp(2),
    fontSize: 14,
    color: "#555",
  },
  signUpLink: {
    color: theme.SECONDARY_COLOR,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: hp(1),
    fontSize: 12,
  },
});

export default SignInScreen;