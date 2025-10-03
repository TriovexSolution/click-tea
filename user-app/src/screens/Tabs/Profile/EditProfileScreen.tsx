// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { BASE_URL } from "@/api";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import CommonHeader from "@/src/Common/CommonHeader";
// import axiosClient from "@/src/api/client";

// type FormData = {
//   username: string;
//   email: string;
//   phone: string;
// };

// const EditProfileScreen = ({ navigation, route }: any) => {
//   const profile = route.params?.profile;

//   const [image, setImage] = useState<string | null>(profile?.userImage || null);
//   const [loading, setLoading] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>({
//     defaultValues: {
//       username: profile?.username || "",
//       email: profile?.userEmail || "",
//       phone: profile?.userPhone || "",
//     },
//   });

//   /* -------- Pick Profile Image -------- */
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   /* -------- Submit Update -------- */
//   const onSubmit = async (data: FormData) => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//         Alert.alert("Error", "You must be logged in");
//         return;
//       }

//       const formData = new FormData();
//       formData.append("username", data.username);
//       formData.append("email", data.email);
//       formData.append("phone", data.phone);

//       if (image && !image.startsWith("http")) {
//         const fileName = image.split("/").pop() || "profile.jpg";
//         const fileType = fileName.split(".").pop();
//         formData.append("userImage", {
//           uri: image,
//           name: fileName,
//           type: `image/${fileType}`,
//         } as any);
//       }

//       const res = await axiosClient.put('/api/profile/edit', formData, {
//         headers: {
//         //   Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       Alert.alert("Success", res.data.message || "Profile updated successfully");
//       navigation.goBack();
//     } catch (err: any) {
//       console.error("Update profile error:", err.response?.data || err.message);
//       Alert.alert("Error", err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <CommonHeader title="Edit Profile" />

//       {/* Profile Image */}
//       <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
//         <Image
//           source={{
//             uri: image || "https://i.pravatar.cc/150",
//           }}
//           style={styles.avatar}
//         />
//         <Text style={styles.changePhoto}>Change Photo</Text>
//       </TouchableOpacity>

//       {/* Username */}
//       <Controller
//         control={control}
//         name="username"
//         rules={{ required: "Username is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             style={[styles.input, errors.username && styles.errorInput]}
//             placeholder="Username"
//             value={value}
//             onChangeText={onChange}
//           />
//         )}
//       />
//       {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

//       {/* Email */}
//       <Controller
//         control={control}
//         name="email"
//         rules={{
//           required: "Email is required",
//           pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
//         }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             style={[styles.input, errors.email && styles.errorInput]}
//             placeholder="Email"
//             keyboardType="email-address"
//             value={value}
//             onChangeText={onChange}
//           />
//         )}
//       />
//       {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

//       {/* Phone */}
//       <Controller
//         control={control}
//         name="phone"
//         rules={{ required: "Phone number is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             style={[styles.input, errors.phone && styles.errorInput]}
//             placeholder="Phone"
//             keyboardType="phone-pad"
//             value={value}
//             onChangeText={onChange}
//           />
//         )}
//       />
//       {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

//       {/* Submit Button */}
//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleSubmit(onSubmit)}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Save Changes</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default EditProfileScreen;

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", padding: wp(5) },
//   imageWrapper: { alignItems: "center", marginBottom: hp(2) },
//   avatar: {
//     width: wp(28),
//     height: wp(28),
//     borderRadius: wp(14),
//     marginBottom: hp(1),
//   },
//   changePhoto: { color: theme.PRIMARY_COLOR, fontSize: hp(1.8), fontWeight: "500" },

//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: hp(1.5),
//   },
//   errorInput: { borderColor: "red" },
//   error: { color: "red", marginBottom: hp(1), fontSize: hp(1.6) },

//   button: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: hp(2),
//   },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: hp(2) },
// });
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@/api";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import CommonHeader from "@/src/Common/CommonHeader";
import axiosClient from "@/src/api/client";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

type FormData = {
  username: string;
  email: string;
  phone: string;
};

const EditProfileScreen = ({ navigation, route }: any) => {
  const profile = route.params?.profile;

  const [image, setImage] = useState<string | null>(profile?.userImage || null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: profile?.username || "",
      email: profile?.userEmail || "",
      phone: profile?.userPhone || "",
    },
  });

  /* -------- Pick Profile Image -------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* -------- Submit Update -------- */
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("phone", data.phone);

      if (image && !image.startsWith("http")) {
        const fileName = image.split("/").pop() || "profile.jpg";
        const fileType = fileName.split(".").pop();
        formData.append("userImage", {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        } as any);
      }

      const res = await axiosClient.put('/api/profile/edit', formData, {
        headers: {
        //   Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", res.data.message || "Profile updated successfully");
      navigation.goBack();
    } catch (err: any) {
      console.error("Update profile error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaContainer>
      <CommonHeader title="Edit Profile" />

      {/* Profile Image */}
      <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
        <Image
          source={{
            uri: image || "https://i.pravatar.cc/150",
          }}
          style={styles.avatar}
        />
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

      {/* Username */}
      <Controller
        control={control}
        name="username"
        rules={{ required: "Username is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.username && styles.errorInput]}
            placeholder="Username"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

      {/* Email */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            placeholder="Email"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Phone */}
      <Controller
        control={control}
        name="phone"
        rules={{ required: "Phone number is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.phone && styles.errorInput]}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </SafeAreaContainer>
  );
};

export default EditProfileScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: wp(5) },
  imageWrapper: { alignItems: "center", marginBottom: hp(2) },
  avatar: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    marginBottom: hp(1),
  },
  changePhoto: { color: theme.PRIMARY_COLOR, fontSize: hp(1.8), fontWeight: "500" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: hp(1.5),
    marginHorizontal:wp(5)
  },
  errorInput: { borderColor: "red" },
  error: { color: "red", marginBottom: hp(1), fontSize: hp(1.6) },

  button: {
    backgroundColor: theme.PRIMARY_COLOR,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: hp(2),
    marginHorizontal:wp(5)
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: hp(2) },
});
