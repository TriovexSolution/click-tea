import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import axios from "axios";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type FormData = { phone: string };

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { phone: "" },
  });

  const [sending, setSending] = useState(false);
const insets = useSafeAreaInsets();

  const onSubmit = async (data: FormData) => {
    // production: normalize E.164 on backend or here before send

    navigation.navigate("otpVerificatonScreen");
  };

  return (
    <SafeAreaView style={[styles.safe,{paddingTop:insets.top}]} >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* <View style={styles.topSpacer} /> */}

        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to continue
          </Text>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <TouchableOpacity accessibilityRole="button" style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </TouchableOpacity>

            <Controller
              control={control}
              rules={{
                required: "Phone number is required",
                // pattern: {
                //   value: /^[6-9]\d{9}$/,
                //   message: "Invalid Indian phone number",
                // },
              }}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={(t) => onChange(t.replace(/\D/g, ""))}
                  keyboardType="phone-pad"
                  placeholder="85236 85236"
                  style={styles.input}
                  maxLength={10}
                  returnKeyType="done"
                />
              )}
            />
          </View>

          {errors.phone && (
            <Text style={styles.error}>{errors.phone.message}</Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              // (sending || !!errors.phone) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            // disabled={sending}
            // accessibilityRole="button"
            // accessibilityLabel="Send OTP"
          >
            {/* <Text style={styles.buttonText}>
              {sending ? "Sending..." : "Send OTP"}
            </Text> */}
                 <Text style={styles.buttonText}>
              Send OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.bottomSpacer} /> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" ,},
  container: { flex: 1 },
  // topSpacer: { height: hp(8) }, // matches screenshot top space
  // bottomSpacer: { flex: 1 },
  content: { paddingHorizontal: wp(5),paddingTop:hp(3) },
  title: { fontSize: hp(3.5), fontWeight: "700", marginBottom: hp(0.5),fontFamily:theme.PRIMARY_FONT_FAMILY },
  subtitle: { color: "#444", marginBottom: hp(4), fontSize: hp(1.8) },
  label: { marginBottom: hp(1), fontSize: hp(1.6), fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: wp(3),
    height: hp(6.5),
    marginBottom: hp(0.8),
    backgroundColor: "#fff",
  },
  prefix: { paddingRight: wp(3) },
  prefixText: { fontSize: hp(1.8), color: "#111" },
  input: { flex: 1, fontSize: hp(1.9), height: "100%" },
  error: { color: "#D32F2F", marginBottom: hp(1) },
  button: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(1.6),
    borderRadius: 8,
    alignItems: "center",
    marginTop: hp(2),
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#fff", fontSize: hp(2), fontWeight: "600" },
});
export default LoginScreen;

