// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Pressable,
//   ScrollView,
//   Alert,
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
// interface FormData {
//   username: string;
//   email: string;
//   country_code:string;
//   phone:string;
//   password:string;
// }
// const SignUpScreen = () => {
//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<FormData>({
//     defaultValues:{
//         username:"",
//         email:"",
//         country_code:"",
//         phone:"",
//         password:""
//     }
//   });
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // const onSubmit = async(data:FormData) => {
//   //   // setLoading(true);
//   //   const payload = {
//   //     ...data,
//   //     country_code: "+91",
//   //     role: "shop_owner",
//   //     login_type: "email",
//   //   };
//   //   // console.log("Sign Up Data =>", payload);
//   //   // Send API call here
//   //   try {
//   //       const response =await axios.post(`${BASE_URL}/api/auth/signup`,{
//   //      username:data.username,
//   //      email:data.email,
//   //      country_code:data.country_code,
//   //      phone:data.phone,
//   //      password:data.password,
//   //      role:"shop_owner",
//   //      login_type:"email"
//   //       })
//   //       if(response.status === 201){
//   //           navigation.navigate("signInScreen")
//   //       }
//   //   } catch (error) {
//   //       console.log("🔴 SignUp failed:", error?.response?.data || error.message || error);

//   //   }finally{
//   //       setLoading(false)
//   //   }
//   // };
// const onSubmit = async(data: FormData) => {
//   // console.log(data);

//   try {
//     const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
//       username: data.username,
//       email: data.email,
//       country_code: "+91",
//       phone: data.phone,
//       password: data.password,
//       role: "shop_owner",
//       login_type: "email",
//     });

//     if (response.status === 201) {
//       // const { token, owner_id } = response.data;
//       // await AsyncStorage.setItem("authToken", token);
//       // await AsyncStorage.setItem("owner_id", owner_id.toString());
//       navigation.navigate("signInScreen");
//     }
//   } catch (error) {
//     console.log("🔴 SignUp failed:", error?.response?.data || error.message || error);
//     Alert.alert("Error", "Sign up failed. Try again.");
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <View style={styles.container}>
//       <Pressable
//         onPress={() => {
//           navigation.goBack();
//           reset();
//         }}
//       >
//         <Ionicons
//           name="chevron-back-outline"
//           size={hp(3)}
//           color={theme.PRIMARY_COLOR}
//         />
//       </Pressable>
//       <ScrollView>
//         <Image
//           source={require("../../../assets/images/FirstLogo-removebg-preview.png")} // your ClickTea logo
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <Text style={styles.heading}>Create Your Shop Owner Account</Text>

//         {/* 👤 Username */}
//         <Controller
//           control={control}
//           name="username"
//           rules={{ required: "Name is required" }}
//           render={({ field: { onChange, value } }) => (
//             <TextInput
//               style={styles.input}
//               placeholder="Shop Owner Name"
//               value={value}
//               onChangeText={onChange}
//             />
//           )}
//         />
//         {errors.username && (
//           <Text style={styles.error}>{errors.username.message}</Text>
//         )}

//         {/* 📧 Email */}
//         <Controller
//           control={control}
//           name="email"
//           rules={{ required: "Email is required" }}
//           render={({ field: { onChange, value } }) => (
//             <TextInput
//               style={styles.input}
//               placeholder="Email Address"
//               keyboardType="email-address"
//               value={value}
//               onChangeText={onChange}
//             />
//           )}
//         />
//         {errors.email && (
//           <Text style={styles.error}>{errors.email.message}</Text>
//         )}

//         {/* 📞 Phone */}
//         <View style={styles.phoneContainer}>
//           <Text style={styles.countryCode}>+91</Text>
//           <Controller
//             control={control}
//             name="phone"
//             rules={{ required: "Phone number is required" }}
//             render={({ field: { onChange, value } }) => (
//               <TextInput
//                 style={styles.phoneInput}
//                 placeholder="Phone Number"
//                 keyboardType="phone-pad"
//                 value={value}
//                 onChangeText={onChange}
//               />
//             )}
//           />
//         </View>
//         {errors.phone && (
//           <Text style={styles.error}>{errors.phone.message}</Text>
//         )}

//         {/* 🔒 Password */}
//         <View style={styles.passwordContainer}>
//           <Controller
//             control={control}
//             name="password"
//             rules={{ required: "Password is required", minLength: 6 }}
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
//             <Ionicons
//               name={showPassword ? "eye-off" : "eye"}
//               size={22}
//               color="#999"
//             />
//           </TouchableOpacity>
//         </View>
//         {errors.password && (
//           <Text style={styles.error}>{errors.password.message}</Text>
//         )}

//         {/* ✅ Sign Up Button */}
//         <TouchableOpacity
//           style={styles.signUpBtn}
//           onPress={handleSubmit(onSubmit)}
//         >
//           <Text style={styles.signUpText}>Sign Up</Text>
//         </TouchableOpacity>

//         {/* OR Divider */}
//         <View style={styles.orContainer}>
//           <View style={styles.line} />
//           <Text style={styles.orText}>OR</Text>
//           <View style={styles.line} />
//         </View>

//         {/* 🟠 Google Button */}
//         <TouchableOpacity style={styles.googleBtn}>
//           <Image
//             source={require("../../../assets/images/FirstTeaBaglog.jpg")} // add google icon in assets
//             style={styles.googleIcon}
//           />
//           <Text style={styles.googleText}>Continue with Google</Text>
//         </TouchableOpacity>

//         {/* Already have an account */}
//         <Text style={styles.footerText}>
//           Already have an account?{" "}
//           <Text
//             style={styles.signInLink}
//             onPress={() => navigation.navigate("signInScreen")}
//           >
//             Sign In
//           </Text>
//         </Text>
//       </ScrollView>
//       {/* 🧋 Logo */}
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
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import axiosClient from "@/src/assets/api/client"; // shared client with interceptors
import { AuthContext } from "@/src/context/authContext";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "@/src/Redux/slice/profileSlice";

type FormData = {
  username: string;
  email: string;
  country_code: string;
  phone: string;
  password: string;
};

const SignUpScreen: React.FC = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
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
  const [loading, setLoading] = useState(false);

  const { signIn } = useContext(AuthContext);
  const dispatch = useDispatch();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Use axiosClient so interceptors/refresh logic are consistent across app
      const res = await axiosClient.post(
        "/api/auth/signup",
        {
          username: data.username,
          email: data.email,
          country_code: data.country_code ?? "+91",
          phone: data.phone,
          password: data.password,
          role: "shop_owner", // change to "user" if this is user signup
          login_type: "email",
        },
        { timeout: 15000 }
      );

      // Some APIs return 201 (created) without tokens. Some return tokens directly.
      // Handle both cases:
      if (res.status === 201 || res.status === 200) {
        const accessToken = res.data?.accessToken ?? res.data?.token ?? null;
        const refreshToken = res.data?.refreshToken ?? null;
        const userId = res.data?.user?.id ?? res.data?.userId ?? null;

        if (accessToken && signIn) {
          // Preferred: auto sign-in the user if server returned tokens
          await signIn(
            accessToken,
            userId ?? undefined,
            refreshToken ?? undefined
          );
          // populate redux profile (fire-and-forget)
          dispatch(fetchUserProfile() as any);
          // navigate to onboarding or home
          navigation.navigate("onBoardScreen" as never);
          return;
        }

        // fallback: no token returned — navigate to SignIn so user can login
        Alert.alert("Account created", "Please sign in to continue.");
        navigation.navigate("signInScreen" as never);
        return;
      }

      // Unexpected status -> show server message if present
      const msg = res.data?.message ?? "Sign up failed. Please try again.";
      Alert.alert("Sign Up", String(msg));
    } catch (err: any) {
      // nice, user-friendly error handling
      const serverMsg =
        err?.response?.data?.message ?? err?.message ?? "Something went wrong";
      console.warn("SignUp error:", err?.response ?? err);
      if (
        serverMsg === "User already exists" ||
        serverMsg.toLowerCase().includes("exists")
      ) {
        Alert.alert(
          "Sign Up Failed",
          "An account with this email/phone already exists. Try signing in."
        );
      } else {
        Alert.alert("Error", String(serverMsg));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          navigation.goBack();
          reset();
        }}
      >
        <Ionicons
          name="chevron-back-outline"
          size={hp(3)}
          color={theme.PRIMARY_COLOR}
        />
      </Pressable>
      <ScrollView>
        <Image
          source={require("../../../assets/images/FirstLogo-removebg-preview.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heading}>Create Your Shop Owner Account</Text>

        <Controller
          control={control}
          name="username"
          rules={{ required: "Name is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Shop Owner Name"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.username && (
          <Text style={styles.error}>{errors.username.message}</Text>
        )}

        <Controller
          control={control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}

        <View style={styles.phoneContainer}>
          <Controller
            control={control}
            name="country_code"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.countryCodeInput}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            rules={{ required: "Phone number is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
        {errors.phone && (
          <Text style={styles.error}>{errors.phone.message}</Text>
        )}

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

        <TouchableOpacity
          style={styles.signUpBtn}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.googleBtn}>
          <Image
            source={require("../../../assets/images/FirstTeaBaglog.jpg")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text
            style={styles.signInLink}
            onPress={() => navigation.navigate("signInScreen" as never)}
          >
            Sign In
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: hp(2), backgroundColor: "#fff" },
  logo: { width: 150, height: 150, alignSelf: "center", marginBottom: hp(2) },
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
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    marginBottom: hp(1.5),
  },
  countryCodeInput: { paddingHorizontal: 12, paddingVertical: 10, width: 70 },
  phoneInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    paddingHorizontal: 12,
    marginBottom: hp(2),
  },
  passwordInput: { flex: 1, paddingVertical: 10 },
  signUpBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(1.8),
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    alignItems: "center",
    marginBottom: hp(2),
  },
  signUpText: { color: "#fff", fontSize: 16 },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  line: { flex: 1, height: 1, backgroundColor: "#ccc" },
  orText: { marginHorizontal: 8, color: "#666" },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: hp(1.5),
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    justifyContent: "center",
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleText: { fontSize: 15, color: "#333" },
  footerText: {
    textAlign: "center",
    marginTop: hp(2),
    fontSize: 14,
    color: "#555",
  },
  signInLink: { color: theme.SECONDARY_COLOR, fontWeight: "bold" },
  error: { color: "red", marginBottom: hp(1), fontSize: 12 },
});

export default SignUpScreen;
