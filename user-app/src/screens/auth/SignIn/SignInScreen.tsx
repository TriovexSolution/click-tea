import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "@/src/context/authContext";
import axiosClient from "@/src/api/client";

interface FormData {
  login_input: string;
  password: string;
}

const SignInScreen: React.FC = () => {
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
  const [loading, setLoading] = useState(false);

  const { signIn } = useContext(AuthContext);

const onSubmit = async (data: FormData) => {
  setLoading(true);
  try {
    const response = await axiosClient.post(`${BASE_URL}/api/auth/signin`, data, {
      headers: { "Content-Type": "application/json" },
    });

    // The API may return either `token` or `accessToken` (or both).
    const token = response.data?.token ?? response.data?.accessToken ?? null;
    const refresh = response.data?.refreshToken ?? null;
    const userId = response.data?.user?.id ?? response.data?.userId ?? null;

    // Helpful debug log (remove or lower log level in production)
    // console.log("Sign-in response:", response.data);

    if (token) {
      // Pass refresh token if present (optional)
      await signIn(token, userId, refresh);
      // After signIn, AuthProvider will fetch profile / re-render to auth stack
    } else {
      // still provide helpful debug info & show user-friendly message
      console.warn("Sign In: no access token in response", response.data);
      Alert.alert("Login Error", "No access token received from server. Please try again.");
    }
  } catch (error: any) {
    const errMessage = error?.response?.data?.message;
    if (errMessage === "User not found") {
      Alert.alert("Account Not Found", "You don't have an account. Please sign up first.", [
        { text: "Sign Up", onPress: () => navigation.navigate("signUpScreen") },
        { text: "Cancel", style: "cancel" },
      ]);
    } else if (errMessage === "Invalid credentials") {
      Alert.alert("Login Failed", "Incorrect email or password.");
    } else {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
    
    console.log("Sign In failed", errMessage || error);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/FirstLogo-removebg-preview.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.heading}>Welcome Back to ClickTea</Text>

      <Controller
        control={control}
        name="login_input"
        rules={{ required: "Email or Phone is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.login_input && <Text style={styles.error}>{errors.login_input.message}</Text>}

      <View style={styles.passwordContainer}>
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
            />
          )}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
<View style={{ alignItems: "flex-end", marginBottom: hp(2) }}>
  <Text
    style={{ color: theme.SECONDARY_COLOR, fontSize: 13, fontWeight: "500" }}
    onPress={() => navigation.navigate("forgotPassWordScreen")}
  >
    Forgot Password?
  </Text>
</View>
      <TouchableOpacity
        style={[styles.signInBtn, loading && { opacity: 0.8 }]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.signInText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.googleBtn}>
        <Image
          source={require("../../../assets/images/splashImage.jpg")}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don’t have an account?{" "}
        <Text style={styles.signUpLink} onPress={() => navigation.navigate("signUpScreen")}>
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
