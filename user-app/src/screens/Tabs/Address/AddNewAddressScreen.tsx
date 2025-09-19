// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   Modal,
//   FlatList,
//   TouchableWithoutFeedback,
//   Keyboard,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import CommonHeader from "@/src/Common/CommonHeader";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import axios from "axios";
// import { BASE_URL } from "@/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import axiosClient from "@/src/api/client";

// // Dummy data for states and cities, replace with real API or data source
// const STATES = ["Gujrat", "Maharashtra","Delhi","Karnataka",];
// const CITIES = {
// Delhi: ["New Delhi", "Dwarka", "Rohini", "Karol Bagh"],
//   Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
//   Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
//   Gujrat:["Ahmedabad","Gandhinagar","Surat","Rajkot"]
// };

// const AddNewAddressScreen = () => {
//   const navigation = useNavigation();
//   const [authToken, setAuthToken] = useState(null);

//   // For modal controls
//   const [stateModalVisible, setStateModalVisible] = useState(false);
//   const [cityModalVisible, setCityModalVisible] = useState(false);

//   // For storing filtered cities based on selected state
//   const [availableCities, setAvailableCities] = useState([]);

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//     watch,
//   } = useForm({
//     defaultValues: {
//       fullName: "",
//       phoneNumber: "",
//       pincode: "",
//       state: "",
//       city: "",
//       houseNumber: "",
//       roadArea: "",
//       landmark: "",
//       addressType: "Home",
//     },
//   });

//   // Watch selected state to update city list and clear city when state changes
//   const selectedState = watch("state");

//   useEffect(() => {
//     if (selectedState) {
//       setAvailableCities(CITIES[selectedState] || []);
//       setValue("city", ""); // reset city on state change
//     }
//   }, [selectedState, setValue]);

//   // Fetch token once on mount for optimization
//   // useEffect(() => {
//   //   const fetchToken = async () => {
//   //     try {
//   //       const token = await AsyncStorage.getItem("authToken");
//   //       setAuthToken(token);
//   //     } catch (error) {
//   //       console.log("Error fetching token", error);
//   //     }
//   //   };
//   //   fetchToken();
//   // }, []);

//   const onSubmit = async (data) => {
//     try {
//       if (!authToken) {
//         Alert.alert("Authentication Error", "Please login first.");
//         return;
//       }

//       // const response = await axios.post(`${BASE_URL}/api/address/add`, data, {
//       //   headers: { Authorization: `Bearer ${authToken}` },
//       // });
//  const response = await axiosClient.post("/api/address/add", data);
//       if (response.status === 201) {
//         Alert.alert("Success", "Address added successfully!", [
//           {
//             text: "OK",
//             onPress: () => {
//               reset();
//               navigation.goBack();
//             },
//           },
//         ]);
//       } else {
//         Alert.alert("Error", response.data.message || "Something went wrong");
//       }
//     } catch (error) {
//       console.error("Submit error:", error);
//       Alert.alert("Error", "Failed to add address. Please try again.");
//     }
//   };

//   // Render item for modal lists
//   const renderModalItem = (item, onSelect) => (
//     <TouchableOpacity
//       style={styles.modalItem}
//       onPress={() => {
//         onSelect(item);
//         setStateModalVisible(false);
//         setCityModalVisible(false);
//       }}
//     >
//       <Text>{item}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <TouchableWithoutFeedback  onPress={Keyboard.dismiss}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         keyboardShouldPersistTaps="handled"
//       >
//         <CommonHeader title={"Add New Address"} />

//         {/* Full Name */}
//         <Text style={styles.label}>Full Name</Text>
//         <Controller
//           control={control}
//           rules={{ required: "Full Name is required" }}
//           name="fullName"
//           render={({ field: { onChange, onBlur, value } }) => (
//             <TextInput
//               style={[styles.input, errors.fullName && styles.errorInput]}
//               onBlur={onBlur}
//               onChangeText={onChange}
//               value={value}
//               placeholder="Enter your full name"
//               returnKeyType="next"
//             />
//           )}
//         />
//         {errors.fullName && (
//           <Text style={styles.errorText}>{errors.fullName.message}</Text>
//         )}

//         {/* Phone Number */}
//         <Text style={styles.label}>Phone Number</Text>
//         <Controller
//           control={control}
//           rules={{
//             required: "Phone Number is required",
//             pattern: {
//               value: /^\d{10}$/,
//               message: "Phone Number must be 10 digits",
//             },
//           }}
//           name="phoneNumber"
//           render={({ field: { onChange, onBlur, value } }) => (
//             <TextInput
//               style={[styles.input, errors.phoneNumber && styles.errorInput]}
//               onBlur={onBlur}
//               onChangeText={onChange}
//               value={value}
//               placeholder="Enter 10-digit phone number"
//               keyboardType="phone-pad"
//               maxLength={10}
//               returnKeyType="next"
//             />
//           )}
//         />
//         {errors.phoneNumber && (
//           <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
//         )}

//         {/* Pincode */}
//         <Text style={styles.label}>Pincode</Text>
//         <Controller
//           control={control}
//           rules={{
//             required: "Pincode is required",
//             pattern: {
//               value: /^\d{6}$/,
//               message: "Pincode must be 6 digits",
//             },
//           }}
//           name="pincode"
//           render={({ field: { onChange, onBlur, value } }) => (
//             <TextInput
//               style={[styles.input, errors.pincode && styles.errorInput]}
//               onBlur={onBlur}
//               onChangeText={onChange}
//               value={value}
//               placeholder="000000"
//               keyboardType="number-pad"
//               maxLength={6}
//               returnKeyType="next"
//             />
//           )}
//         />
//         {errors.pincode && (
//           <Text style={styles.errorText}>{errors.pincode.message}</Text>
//         )}

//         {/* State Selector */}
//         <Text style={styles.label}>State</Text>
//         <Controller
//           control={control}
//           rules={{ required: "State is required" }}
//           name="state"
//           render={({ field: { value } }) => (
//             <TouchableOpacity
//               style={[styles.input, errors.state && styles.errorInput]}
//               onPress={() => setStateModalVisible(true)}
//             >
//               <Text style={value ? styles.selectedText : styles.placeholderText}>
//                 {value || "Select State"}
//               </Text>
//             </TouchableOpacity>
//           )}
//         />
//         {errors.state && (
//           <Text style={styles.errorText}>{errors.state.message}</Text>
//         )}

//         {/* City Selector */}
//         <Text style={styles.label}>City</Text>
//         <Controller
//           control={control}
//           rules={{ required: "City is required" }}
//           name="city"
//           render={({ field: { value } }) => (
//             <TouchableOpacity
//               style={[styles.input, errors.city && styles.errorInput]}
//               onPress={() => {
//                 if (!selectedState) {
//                   Alert.alert("Select State First", "Please select a state before choosing a city.");
//                   return;
//                 }
//                 setCityModalVisible(true);
//               }}
//             >
//               <Text style={value ? styles.selectedText : styles.placeholderText}>
//                 {value || "Select City"}
//               </Text>
//             </TouchableOpacity>
//           )}
//         />
//         {errors.city && (
//           <Text style={styles.errorText}>{errors.city.message}</Text>
//         )}

//         {/* House/Flat/Office No */}
//         <Text style={styles.label}>House/Flat/Office No.</Text>
//         <Controller
//           control={control}
//           name="houseNumber"
//           render={({ field: { onChange, onBlur, value } }) => (
//             <TextInput
//               style={styles.input}
//               onBlur={onBlur}
//               onChangeText={onChange}
//               value={value}
//               placeholder="123, Apartment name"
//               returnKeyType="next"
//             />
//           )}
//         />

//         {/* Road/Area/Colony */}
//         <Text style={styles.label}>Road/Area/Colony</Text>
//         <Controller
//           control={control}
//           name="roadArea"
//           render={({ field: { onChange, onBlur, value } }) => (
//             <TextInput
//               style={styles.input}
//               onBlur={onBlur}
//               onChangeText={onChange}
//               value={value}
//               placeholder="HSR Layout, Sector 2"
//               returnKeyType="next"
//             />
//           )}
//         />

//         {/* Landmark */}
//         <Text style={styles.label}>Landmark (Optional)</Text>
//         <Controller
//           control={control}
//           name="landmark"
//           render={({ field: { onChange, onBlur, value } }) => (
//             <TextInput
//               style={styles.input}
//               onBlur={onBlur}
//               onChangeText={onChange}
//               value={value}
//               placeholder="Near Apollo Pharmacy"
//               returnKeyType="done"
//             />
//           )}
//         />

//         {/* Address Type */}
//         <Text style={styles.label}>Save Address As</Text>
//         <Controller
//           control={control}
//           name="addressType"
//           render={({ field: { onChange, value } }) => (
//             <View style={styles.radioGroup}>
//               {["Home", "Work", "Other"].map((type) => (
//                 <TouchableOpacity
//                   key={type}
//                   style={[
//                     styles.radioButton,
//                     value === type && styles.radioButtonSelected,
//                   ]}
//                   onPress={() => onChange(type)}
//                 >
//                   <Text style={value === type ? styles.radioTextSelected : styles.radioText}>
//                     {type}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}
//         />

//         {/* Buttons */}
//         <View style={styles.buttonsRow}>
//           <TouchableOpacity
//             style={[styles.button, styles.cancelButton]}
//             onPress={() => reset()}
//             activeOpacity={0.7}
//           >
//             <Text>Cancel</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.button, styles.saveButton]}
//             onPress={handleSubmit(onSubmit)}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.saveButtonText}>Save Address</Text>
//           </TouchableOpacity>
//         </View>

//         {/* State Modal */}
//         <Modal
//           visible={stateModalVisible}
//           transparent
//           animationType="slide"
//           onRequestClose={() => setStateModalVisible(false)}
//         >
//           <TouchableOpacity
//             style={styles.modalBackdrop}
//             activeOpacity={1}
//             onPressOut={() => setStateModalVisible(false)}
//           >
//             <View style={styles.modalContent}>
//               <FlatList
//                 data={STATES}
//                 keyExtractor={(item) => item}
//                 renderItem={({ item }) =>
//                   renderModalItem(item, (selected) => {
//                     setValue("state", selected);
//                     setStateModalVisible(false);
//                   })
//                 }
//               />
//             </View>
//           </TouchableOpacity>
//         </Modal>

//         {/* City Modal */}
//         <Modal
//           visible={cityModalVisible}
//           transparent
//           animationType="slide"
//           onRequestClose={() => setCityModalVisible(false)}
//         >
//           <TouchableOpacity
//             style={styles.modalBackdrop}
//             activeOpacity={1}
//             onPressOut={() => setCityModalVisible(false)}
//           >
//             <View style={styles.modalContent}>
//               <FlatList
//                 data={availableCities}
//                 keyExtractor={(item) => item}
//                 renderItem={({ item }) =>
//                   renderModalItem(item, (selected) => {
//                     setValue("city", selected);
//                     setCityModalVisible(false);
//                   })
//                 }
//                 ListEmptyComponent={
//                   <Text style={{ textAlign: "center", padding: hp(2) }}>
//                     No cities available
//                   </Text>
//                 }
//               />
//             </View>
//           </TouchableOpacity>
//         </Modal>
//       </ScrollView>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingBottom: hp(30),
//     backgroundColor: "white",
//   },
//   label: {
//     marginLeft: wp(5),
//     marginBottom: hp(0.5),
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: 12,
//     marginHorizontal: wp(5),
//     justifyContent: "center",
//   },
//   errorInput: {
//     borderColor: "red",
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 8,
//     marginLeft: wp(5),
//   },
//   placeholderText: {
//     color: "#888",
//   },
//   selectedText: {
//     color: "#000",
//   },
//   radioGroup: {
//     flexDirection: "row",
//     marginBottom: 20,
//     marginLeft: wp(5),
//   },
//   radioButton: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   radioButtonSelected: {
//     backgroundColor: "#562E19",
//     borderColor: "#562E19",
//   },
//   radioText: {
//     color: "black",
//   },
//   radioTextSelected: {
//     color: "white",
//   },
//   buttonsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginHorizontal: wp(5),
//   },
//   button: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 12,
//     borderRadius: 6,
//   },
//   cancelButton: {
//     backgroundColor: "#ddd",
//     marginRight: 10,
//   },
//   saveButton: {
//     backgroundColor: "#562E19",
//   },
//   saveButtonText: {
//     color: "white",
//     fontWeight: "600",
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: "#00000099",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     maxHeight: hp(50),
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//     paddingVertical: hp(2),
//   },
//   modalItem: {
//     paddingVertical: hp(2),
//     paddingHorizontal: wp(6),
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
// });

// export default AddNewAddressScreen;
// src/screens/AddNewAddressScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import CommonHeader from "@/src/Common/CommonHeader";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import axiosClient from "@/src/api/client";

// Dummy data (move to constants/file when real data available)
const STATES = ["Gujrat", "Maharashtra", "Delhi", "Karnataka"];
const CITIES: Record<string, string[]> = {
  Delhi: ["New Delhi", "Dwarka", "Rohini", "Karol Bagh"],
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Gujrat: ["Ahmedabad", "Gandhinagar", "Surat", "Rajkot"],
};

const ModalListItem = React.memo(function ModalListItem({
  label,
  onPress,
}: {
  label: string;
  onPress: (v: string) => void;
}) {
  return (
    <TouchableOpacity style={styles.modalItem} onPress={() => onPress(label)}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
});

const AddNewAddressScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      pincode: "",
      state: "",
      city: "",
      houseNumber: "",
      roadArea: "",
      landmark: "",
      addressType: "Home",
    },
  });

  const selectedState = watch("state");

  // update cities when state changes
  useEffect(() => {
    if (selectedState) {
      setAvailableCities(CITIES[selectedState] ?? []);
      // clear city if state changed
      setValue("city", "");
    } else {
      setAvailableCities([]);
      setValue("city", "");
    }
  }, [selectedState, setValue]);

  // memorized modal renderers
  const renderStateItem = useCallback(
    ({ item }: { item: string }) => <ModalListItem label={item} onPress={(v) => { setValue("state", v); setStateModalVisible(false); }} />,
    [setValue]
  );

  const renderCityItem = useCallback(
    ({ item }: { item: string }) => <ModalListItem label={item} onPress={(v) => { setValue("city", v); setCityModalVisible(false); }} />,
    [setValue]
  );

  const onSubmit = useCallback(
    async (data: any) => {
      // basic validation already handled by react-hook-form
      setSubmitting(true);
      try {
        const res = await axiosClient.post("/api/address/add", data, { timeout: 15000 });
        if (res.status === 201 || res.status === 200) {
          Alert.alert("Success", "Address added successfully!", [
            {
              text: "OK",
              onPress: () => {
                reset();
                navigation.goBack();
              },
            },
          ]);
        } else {
          Alert.alert("Error", (res.data && res.data.message) || "Something went wrong");
        }
      } catch (err: any) {
        console.error("Submit error:", err);
        Alert.alert("Error", err?.response?.data?.message || "Failed to add address. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [navigation, reset]
  );

  // small UI helpers
  const openStateModal = useCallback(() => setStateModalVisible(true), []);
  const openCityModal = useCallback(() => {
    if (!selectedState) {
      Alert.alert("Select State First", "Please select a state before choosing a city.");
      return;
    }
    setCityModalVisible(true);
  }, [selectedState]);

  // computed values to show placeholders
  const statePlaceholder = useMemo(() => "Select State", []);
  const cityPlaceholder = useMemo(() => "Select City", []);

  return (
    <SafeAreaView style={[styles.safeContainer,]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={insets.top + 44}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <CommonHeader title={"Add New Address"} />
<View style={{marginTop:hp(2)}}/>
            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              rules={{ required: "Full Name is required" }}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.errorInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your full name"
                  returnKeyType="next"
                />
              )}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}

            {/* Phone Number */}
            <Text style={styles.label}>Phone Number</Text>
            <Controller
              control={control}
              rules={{
                required: "Phone Number is required",
                pattern: { value: /^\d{10}$/, message: "Phone Number must be 10 digits" },
              }}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.phoneNumber && styles.errorInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter 10-digit phone number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="next"
                />
              )}
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>}

            {/* Pincode */}
            <Text style={styles.label}>Pincode</Text>
            <Controller
              control={control}
              rules={{
                required: "Pincode is required",
                pattern: { value: /^\d{6}$/, message: "Pincode must be 6 digits" },
              }}
              name="pincode"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.pincode && styles.errorInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="next"
                />
              )}
            />
            {errors.pincode && <Text style={styles.errorText}>{errors.pincode.message}</Text>}

            {/* State Selector */}
            <Text style={styles.label}>State</Text>
            <Controller
              control={control}
              rules={{ required: "State is required" }}
              name="state"
              render={({ field: { value } }) => (
                <TouchableOpacity accessibilityRole="button" style={[styles.input, errors.state && styles.errorInput]} onPress={openStateModal}>
                  <Text style={value ? styles.selectedText : styles.placeholderText}>{value || statePlaceholder}</Text>
                </TouchableOpacity>
              )}
            />
            {errors.state && <Text style={styles.errorText}>{errors.state.message}</Text>}

            {/* City Selector */}
            <Text style={styles.label}>City</Text>
            <Controller
              control={control}
              rules={{ required: "City is required" }}
              name="city"
              render={({ field: { value } }) => (
                <TouchableOpacity accessibilityRole="button" style={[styles.input, errors.city && styles.errorInput]} onPress={openCityModal}>
                  <Text style={value ? styles.selectedText : styles.placeholderText}>{value || cityPlaceholder}</Text>
                </TouchableOpacity>
              )}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}

            {/* House/Flat/Office No */}
            <Text style={styles.label}>House/Flat/Office No.</Text>
            <Controller
              control={control}
              name="houseNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="123, Apartment name" returnKeyType="next" />
              )}
            />

            {/* Road/Area/Colony */}
            <Text style={styles.label}>Road/Area/Colony</Text>
            <Controller
              control={control}
              name="roadArea"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="HSR Layout, Sector 2" returnKeyType="next" />
              )}
            />

            {/* Landmark */}
            <Text style={styles.label}>Landmark (Optional)</Text>
            <Controller
              control={control}
              name="landmark"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Near Apollo Pharmacy" returnKeyType="done" />
              )}
            />

            {/* Address Type */}
            <Text style={styles.label}>Save Address As</Text>
            <Controller
              control={control}
              name="addressType"
              render={({ field: { onChange, value } }) => (
                <View style={styles.radioGroup}>
                  {["Home", "Work", "Other"].map((type) => (
                    <TouchableOpacity key={type} style={[styles.radioButton, value === type && styles.radioButtonSelected]} onPress={() => onChange(type)}>
                      <Text style={value === type ? styles.radioTextSelected : styles.radioText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => reset()} activeOpacity={0.8}>
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, (!isValid || submitting) && { opacity: 0.7 }]}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.8}
                disabled={!isValid || submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Address</Text>}
              </TouchableOpacity>
            </View>

            {/* State Modal */}
            <Modal visible={stateModalVisible} transparent animationType="slide" onRequestClose={() => setStateModalVisible(false)}>
              <TouchableWithoutFeedback onPress={() => setStateModalVisible(false)}>
                <View style={styles.modalBackdrop}>
                  <View style={styles.modalContent}>
                    <FlatList data={STATES} keyExtractor={(i) => i} renderItem={renderStateItem} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            {/* City Modal */}
            <Modal visible={cityModalVisible} transparent animationType="slide" onRequestClose={() => setCityModalVisible(false)}>
              <TouchableWithoutFeedback onPress={() => setCityModalVisible(false)}>
                <View style={styles.modalBackdrop}>
                  <View style={styles.modalContent}>
                    <FlatList data={availableCities} keyExtractor={(i) => i} renderItem={renderCityItem} ListEmptyComponent={<Text style={{ textAlign: "center", padding: hp(2) }}>No cities available</Text>} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "white" },
  container: {
    paddingBottom: hp(30),
    backgroundColor: "white",
  },
  label: {
    marginLeft: wp(5),
    marginBottom: hp(0.5),
    fontWeight: "600",
    fontSize: 14,

  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    marginHorizontal: wp(5),
    justifyContent: "center",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginLeft: wp(5),
  },
  placeholderText: {
    color: "#888",
  },
  selectedText: {
    color: "#000",
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 20,
    marginLeft: wp(5),
  },
  radioButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  radioButtonSelected: {
    backgroundColor: "#562E19",
    borderColor: "#562E19",
  },
  radioText: {
    color: "black",
  },
  radioTextSelected: {
    color: "white",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: wp(5),
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#562E19",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    maxHeight: hp(50),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: hp(2),
  },
  modalItem: {
    paddingVertical: hp(2),
    paddingHorizontal: wp(6),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default AddNewAddressScreen;
