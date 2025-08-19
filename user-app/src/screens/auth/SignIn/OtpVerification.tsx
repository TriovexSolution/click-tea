import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { hp, wp } from '@/src/assets/utils/responsive';
import theme from '@/src/assets/colors/theme';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY = theme?.PRIMARY_COLOR ?? '#562E19';

const OtpVerificationScreen: React.FC = () => {
    const route = useRoute();
  const { otp: sentOtp, phone } = route.params as { otp: string; phone: string };
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { otp: '' },
  });
    const navigation = useNavigation();
const insets = useSafeAreaInsets();
   const onSubmit = async (data: any) => {
    if (data.otp === sentOtp) {
      // Save token to AsyncStorage
      await AsyncStorage.setItem("authToken", "dummy_token_for_testing");
      console.log("OTP verified. Token saved.");

      navigation.navigate("bottomTabScreen");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <SafeAreaView style={[styles.safe,{paddingTop:insets.top}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* <View style={styles.topSpacer} /> */}
<Text>We've sent a 4-digit code to +91 {phone}</Text>
      <Text style={{ marginTop: 10 }}>Your OTP is: {sentOtp}</Text> {/* TEST ONLY */}
        <View style={styles.content}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to +91 6786846547
          </Text>

          <Text style={styles.label}>OTP</Text>
          <Controller
            control={control}
            name="otp"
            rules={{ required: 'OTP is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                placeholder="Enter 6-digit OTP"
                style={styles.input}
                maxLength={6}
              />
            )}
          />
          {errors.otp && <Text style={styles.error}>{errors.otp.message}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.resend}>Resend OTP</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.bottomSpacer} /> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  // topSpacer: { height: hp(8) },
  // bottomSpacer: { flex: 1 },
  content: { paddingHorizontal: wp(5),paddingTop:hp(3) },
  title: { fontSize: hp(3.5), fontWeight: "700", marginBottom: hp(0.5),fontFamily:theme.PRIMARY_FONT_FAMILY },
  subtitle: { color: '#444', marginBottom: hp(4), fontSize: hp(1.8) },
  label: { marginBottom: hp(1), fontSize: hp(1.6), fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: wp(3),
    height: hp(6.5),
    fontSize: hp(1.9),
    marginBottom: hp(0.8),
  },
  error: { color: '#D32F2F', marginBottom: hp(1) },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: hp(1.6),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp(1.5),
  },
  buttonText: { color: '#fff', fontSize: hp(2), fontWeight: '600' },
  resend: { color: '#999', textAlign: 'center', marginTop: hp(2), textDecorationLine: 'underline' },
});
export default OtpVerificationScreen;

