// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
//   Pressable,
//   StatusBar,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { Ionicons } from "@expo/vector-icons"; // ✅ works with Expo
// import axiosClient from "@/src/api/client";
// import { useAuth } from "@/src/context/authContext";
// import CommonHeader from "@/src/Common/CommonHeader";
// import PrimaryButton from "@/src/Common/CommonBtn";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import { SafeAreaView } from "react-native-safe-area-context";
// import theme from "@/src/assets/colors/theme";

// type FormData = {
//   oldPassword: string;
//   newPassword: string;
// };

// const ChangePasswordScreen: React.FC = () => {
//   const { token } = useAuth();
//   const [loading, setLoading] = useState(false);

//   // local states for password visibility
//   const [showOld, setShowOld] = useState(false);
//   const [showNew, setShowNew] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<FormData>({
//     defaultValues: { oldPassword: "", newPassword: "" },
//   });

//   const onSubmit = async (data: FormData) => {
//     if (!token) {
//       Alert.alert("Error", "You must be logged in");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axiosClient.post(
//         "/api/auth/change-password",
//         {
//           oldPassword: data.oldPassword,
//           newPassword: data.newPassword,
//         },
//         // { headers: { Authorization: `Bearer ${token}` } }
//       );

//       Alert.alert("Success", response.data.message);
//       reset();
//     } catch (error: any) {
//       console.error("Change password error:", error.response?.data || error.message);
//       Alert.alert("Error", error.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//             <StatusBar
//         barStyle="dark-content"   // or "light-content" depending on your background
//         backgroundColor="#F6F4F1" // same as your screen background
//         translucent={false}       // false ensures the content is below status bar
//       />
//       <CommonHeader title="Change Password" />

//       <View style={styles.formWrapper}>
//         {/* Old Password */}
//         <Controller
//           control={control}
//           name="oldPassword"
//           rules={{
//             required: "Old password is required",
//             minLength: { value: 6, message: "Min 6 characters" },
//           }}
//           render={({ field: { onChange, value } }) => (
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 style={[styles.input, errors.oldPassword && styles.errorInput]}
//                 placeholder="Old Password"
//                 secureTextEntry={!showOld}
//                 value={value}
//                 onChangeText={onChange}
//               />
//               <Pressable onPress={() => setShowOld(!showOld)} style={styles.iconWrapper}>
//                 <Ionicons
//                   name={showOld ? "eye-off" : "eye"}
//                   size={20}
//                   color="grey"
//                 />
//               </Pressable>
//             </View>
//           )}
//         />
//         {errors.oldPassword && (
//           <Text style={styles.error}>{errors.oldPassword.message}</Text>
//         )}

//         {/* New Password */}
//         <Controller
//           control={control}
//           name="newPassword"
//           rules={{
//             required: "New password is required",
//             minLength: { value: 6, message: "Min 6 characters" },
//           }}
//           render={({ field: { onChange, value } }) => (
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 style={[styles.input, errors.newPassword && styles.errorInput]}
//                 placeholder="New Password"
//                 secureTextEntry={!showNew}
//                 value={value}
//                 onChangeText={onChange}
//               />
//               <Pressable onPress={() => setShowNew(!showNew)} style={styles.iconWrapper}>
//                 <Ionicons
//                   name={showNew ? "eye-off" : "eye"}
//                   size={20}
//                    color="grey"
//                 />
//               </Pressable>
//             </View>
//           )}
//         />
//         {errors.newPassword && (
//           <Text style={styles.error}>{errors.newPassword.message}</Text>
//         )}

//         {/* Submit button */}
//         {loading ? (
//           <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//         ) : (
//           <PrimaryButton title="Change Password" onPress={handleSubmit(onSubmit)} />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default ChangePasswordScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },
//   formWrapper: { marginTop: hp(3), marginHorizontal: wp(5) },
//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     marginBottom: 8,
//     paddingRight: 10,
//   },
//   input: {
//     flex: 1,
//     padding: 12,
//     fontSize: 15,
//   },
//   iconWrapper: {
//     paddingLeft: 6,
//   },
//   errorInput: { borderColor: "red" },
//   error: { color: "red", marginBottom: 10, fontSize: 13 },
// });
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  StatusBar,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons"; // ✅ works with Expo
import axiosClient from "@/src/api/client";
import { useAuth } from "@/src/context/authContext";
import CommonHeader from "@/src/Common/CommonHeader";
import PrimaryButton from "@/src/Common/CommonBtn";
import { hp, wp } from "@/src/assets/utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "@/src/assets/colors/theme";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

type FormData = {
  oldPassword: string;
  newPassword: string;
};

const ChangePasswordScreen: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  // local states for password visibility
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: { oldPassword: "", newPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosClient.post(
        "/api/auth/change-password",
        {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        },
        // { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", response.data.message);
      reset();
    } catch (error: any) {
      console.error("Change password error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaContainer >
            <StatusBar
        barStyle="dark-content"   // or "light-content" depending on your background
        backgroundColor="#fff" // same as your screen background
        translucent={false}       // false ensures the content is below status bar
      />
      <CommonHeader title="Change Password" />

      <View style={styles.formWrapper}>
        {/* Old Password */}
        <Controller
          control={control}
          name="oldPassword"
          rules={{
            required: "Old password is required",
            minLength: { value: 6, message: "Min 6 characters" },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, errors.oldPassword && styles.errorInput]}
                placeholder="Old Password"
                secureTextEntry={!showOld}
                value={value}
                onChangeText={onChange}
              />
              <Pressable onPress={() => setShowOld(!showOld)} style={styles.iconWrapper}>
                <Ionicons
                  name={showOld ? "eye-off" : "eye"}
                  size={20}
                  color="grey"
                />
              </Pressable>
            </View>
          )}
        />
        {errors.oldPassword && (
          <Text style={styles.error}>{errors.oldPassword.message}</Text>
        )}

        {/* New Password */}
        <Controller
          control={control}
          name="newPassword"
          rules={{
            required: "New password is required",
            minLength: { value: 6, message: "Min 6 characters" },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, errors.newPassword && styles.errorInput]}
                placeholder="New Password"
                secureTextEntry={!showNew}
                value={value}
                onChangeText={onChange}
              />
              <Pressable onPress={() => setShowNew(!showNew)} style={styles.iconWrapper}>
                <Ionicons
                  name={showNew ? "eye-off" : "eye"}
                  size={20}
                   color="grey"
                />
              </Pressable>
            </View>
          )}
        />
        {errors.newPassword && (
          <Text style={styles.error}>{errors.newPassword.message}</Text>
        )}

        {/* Submit button */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
        ) : (
          <PrimaryButton title="Change Password" onPress={handleSubmit(onSubmit)} />
        )}
      </View>
    </SafeAreaContainer>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  formWrapper: { marginTop: hp(3), marginHorizontal: wp(5) },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 8,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  iconWrapper: {
    paddingLeft: 6,
  },
  errorInput: { borderColor: "red" },
  error: { color: "red", marginBottom: 10, fontSize: 13 },
});
