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
import axios from "axios";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface FormData {
  login_input: string;
  // phone:string;
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
      // phone:""
    },
  });
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [showPassword, setShowPassword] = useState(false);


// put this inside your component to replace the existing onSubmit
const onSubmit = async (data: FormData) => {
  console.log("Submitting sign in:", data);

  // show a basic loading UX if you want (optional)
  // setLoading(true);

  try {
    // you can set a timeout to fail faster on network problems
    const response = await axios.post(
      `${BASE_URL}/api/auth/signin`,
      data,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000, // 15s
      }
    );

    // console.groupCollapsed("SignIn success");
    // console.log("status:", response.status);
    // console.log("data:", response.data);
    // console.groupEnd();
if(response.status === 200){
  const { token, user } = response.data ?? {};
    if (!token) {
      Alert.alert("Login failed", "Server did not return an auth token. Contact support.");
      // setLoading(false);
      return;
    }
    await AsyncStorage.setItem("authToken", token);
    if (user?.id) await AsyncStorage.setItem("owner_id", String(user.id));
    if (user?.shopId) await AsyncStorage.setItem("shop_id", String(user.shopId));

    // navigate after success
    navigation.navigate("onBoardScreen");
}

  


  } catch (err: any) {
    // setLoading(false);
    console.groupCollapsed("SignIn error");
    // axios error (server responded or request made but no response)
    if (axios.isAxiosError(err)) {
      console.log("axios error message:", err.message);
      console.log("config:", err.config);

      if (err.response) {
        // server responded with a status code out of 2xx
        console.log("response.status:", err.response.status);
        console.log("response.data:", err.response.data);
        const serverMsg = err.response.data?.message ?? err.response.data?.error ?? JSON.stringify(err.response.data);

        // handle common server messages
        if (serverMsg === "User not found") {
          Alert.alert("Account Not Found", "You don't have an account. Please sign up first.", [
            { text: "Sign Up", onPress: () => navigation.navigate("signUpScreen") },
            { text: "Cancel", style: "cancel" },
          ]);
        } else if (serverMsg === "Invalid credentials") {
          Alert.alert("Login Failed", "Incorrect email or password.");
        } else {
          // generic server error
          Alert.alert("Error", serverMsg || "Server error. Please try again.");
        }
      } else if (err.request) {
        // request made but no response (network issue)
        console.log("no response, request:", err.request);
        Alert.alert("Network error", "Unable to reach server. Check your connection and BASE_URL.");
      } else {
        // something happened setting up the request
        console.log("request setup error:", err.message);
        Alert.alert("Error", err.message || "An unexpected error occurred.");
      }
    } else {
      // non-axios error (rare)
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
