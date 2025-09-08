// CreateSignUpScreen.tsx
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  ScrollView, Pressable, Alert
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
import axiosClient from "@/src/api/client";

interface FormData {
  username: string;
  email: string;
  country_code: string;
  phone: string;
  password: string;
}

const SignUpScreen = () => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      username: "",
      email: "",
      country_code: "+91",
      phone: "",
      password: "",
    },
  });

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axiosClient.post(`${BASE_URL}/api/auth/signup`, {
        username: data.username,
        email: data.email,
        country_code: "+91",
        phone: data.phone,
        password: data.password,
        role: "user", // ⬅️ Main difference here
        login_type: "email",
      });

     if (response.status === 201) {
//   const { token } = response.data;
    // await AsyncStorage.setItem("authToken", token);
    
    navigation.navigate("signInScreen");

}

    } catch (error) {
      console.log("🔴 User SignUp failed:", error?.response?.data || error.message || error);
      Alert.alert("Error", "Sign up failed. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => { navigation.goBack(); reset(); }}>
        <Ionicons name="chevron-back-outline" size={hp(3)} color={theme.PRIMARY_COLOR} />
      </Pressable>
      <ScrollView>
        <Image
          source={require("../../../assets/images/FirstLogo-removebg-preview.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heading}>Create Your User Account</Text>

        {/* Name */}
        <Controller control={control} name="username" rules={{ required: "Name is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Full Name" value={value} onChangeText={onChange} />
          )}
        />
        {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

        {/* Email */}
        <Controller control={control} name="email" rules={{ required: "Email is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" value={value} onChangeText={onChange} />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        {/* Phone */}
        <View style={styles.phoneContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <Controller control={control} name="phone" rules={{ required: "Phone number is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.phoneInput} placeholder="Phone Number" keyboardType="phone-pad" value={value} onChangeText={onChange} />
            )}
          />
        </View>
        {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

        {/* Password */}
        <View style={styles.passwordContainer}>
          <Controller control={control} name="password" rules={{ required: "Password is required", minLength: 6 }}
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
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpBtn} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Already have account? */}
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.signInLink} onPress={() => navigation.navigate("signInScreen")}>
            Sign In
          </Text>
        </Text>
      </ScrollView>
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
    height: 150,
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
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    marginBottom: hp(1.5),
  },
  countryCode: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#555",
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
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
  signUpBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(1.8),
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    alignItems: "center",
    marginBottom: hp(2),
  },
  signUpText: {
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
  signInLink: {
    color: theme.SECONDARY_COLOR,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: hp(1),
    fontSize: 12,
  },
});

export default SignUpScreen;
