import { View, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import OnBoardScreen from "./auth/OnBoardScreen";
import SignUpScreen from "./auth/SignUp/SignUpScreen";
import SignInScreen from "./auth/SignIn/SignInScreen";
import BottomTabs from "./Tabs/BottomTabs";
import ShopDetailScreen from "./Tabs/Home/ShopDetailScreen";
import CartScreen from "./Tabs/Cart/CartScreen";
import LoginScreen from "./auth/SignIn/LoginInScreen";
import OtpVerificationScreen from "./auth/SignIn/OtpVerification";
import LocationScreen from "./auth/SignIn/LocationScreen";
import ViewAllCategoryScreen from "./Tabs/Home/AllCategoryScreen/ViewAllCategoryScreen";
import ChangeAddressScreen from "./Tabs/Address/ChangeAddressScreen";
import AddNewAddressScreen from "./Tabs/Address/AddNewAddressScreen";

const StackNavigatorScreens = () => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="onBoardScreen"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="onBoardScreen" component={OnBoardScreen} />
        <Stack.Screen name="signUpScreen" component={SignUpScreen} />
        <Stack.Screen name="signInScreen" component={SignInScreen} />
        <Stack.Screen name="bottomTabScreen" component={BottomTabs} />
        <Stack.Screen name="shopDetailScreen" component={ShopDetailScreen} />
        <Stack.Screen name="cartScreen" component={CartScreen} />
        <Stack.Screen name="loginInScreen" component={LoginScreen} />
        <Stack.Screen name="otpVerificatonScreen" component={OtpVerificationScreen} />
        <Stack.Screen name="locationScreen" component={LocationScreen} />
        <Stack.Screen name="viewAllCategoryScreen" component={ViewAllCategoryScreen} />
        <Stack.Screen name="changeAddressScreen" component={ChangeAddressScreen} />
        <Stack.Screen name="addNewAddressScreen" component={AddNewAddressScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigatorScreens;
