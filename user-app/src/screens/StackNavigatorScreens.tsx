// // // import { View, Text, ActivityIndicator } from "react-native";
// // // import { createNativeStackNavigator } from "@react-navigation/native-stack";
// // // import { NavigationContainer } from "@react-navigation/native";
// // // import React, { useEffect, useState } from "react";
// // // import OnBoardScreen from "./auth/OnBoardScreen";
// // // import SignUpScreen from "./auth/SignUp/SignUpScreen";
// // // import SignInScreen from "./auth/SignIn/SignInScreen";
// // // import BottomTabs from "./Tabs/BottomTabs";
// // // import ShopDetailScreen from "./Tabs/Home/ShopDetailScreen";
// // // import CartScreen from "./Tabs/Cart/CartScreen";
// // // import LoginScreen from "./auth/SignIn/LoginInScreen";
// // // import OtpVerificationScreen from "./auth/SignIn/OtpVerification";
// // // import LocationScreen from "./auth/SignIn/LocationScreen";
// // // import ViewAllCategoryScreen from "./Tabs/Home/AllCategoryScreen/ViewAllCategoryScreen";
// // // import ChangeAddressScreen from "./Tabs/Address/ChangeAddressScreen";
// // // import AddNewAddressScreen from "./Tabs/Address/AddNewAddressScreen";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import AvailabilityGate from "./AvailabilityService/AvailabilityGate";

// // // const StackNavigatorScreens = () => {
// // //   const Stack = createNativeStackNavigator();
// // //     const [loading, setLoading] = useState(true);
// // //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// // //    useEffect(() => {
// // //     const checkAuth = async () => {
// // //       try {
// // //         const token = await AsyncStorage.getItem("authToken");
// // //         // console.log(token);
        
// // //         setIsLoggedIn(!!token);
// // //       } catch (err) {
// // //         console.log("Error checking token", err);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };
// // //     checkAuth();
// // //   }, []);
// // //     if (loading) {
// // //     return (
// // //       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
// // //         <ActivityIndicator size="large" />
// // //       </View>
// // //     );
// // //   }
// // //   return (
// // //     <NavigationContainer>
// // //       <Stack.Navigator
// // //         //  initialRouteName={isLoggedIn ? "bottomTabScreen" : "onBoardScreen"}
// // //         initialRouteName={isLoggedIn ? "availabilityGate" : "onBoardScreen"}
// // //         screenOptions={{
// // //           headerShown: false,
// // //         }}
// // //       >
// // //         <Stack.Screen name="onBoardScreen" component={OnBoardScreen} />
// // //         <Stack.Screen name="signUpScreen" component={SignUpScreen} />
// // //         <Stack.Screen name="signInScreen" component={SignInScreen} />
// // //         <Stack.Screen name="bottomTabScreen" component={BottomTabs} />
// // //         <Stack.Screen name="shopDetailScreen" component={ShopDetailScreen} />
// // //         <Stack.Screen name="cartScreen" component={CartScreen} />
// // //         <Stack.Screen name="loginInScreen" component={LoginScreen} />
// // //         <Stack.Screen name="otpVerificatonScreen" component={OtpVerificationScreen} />
// // //         <Stack.Screen name="locationScreen" component={LocationScreen} />
// // //         <Stack.Screen name="viewAllCategoryScreen" component={ViewAllCategoryScreen} />
// // //         <Stack.Screen name="changeAddressScreen" component={ChangeAddressScreen} />
// // //         <Stack.Screen name="addNewAddressScreen" component={AddNewAddressScreen} />

// // // <Stack.Screen name="availabilityGate" component={AvailabilityGate} />
// // //       </Stack.Navigator>
// // //     </NavigationContainer>
// // //   );
// // // };

// // // export default StackNavigatorScreens;
// // import React from "react";
// // import { createNativeStackNavigator } from "@react-navigation/native-stack";
// // import { NavigationContainer } from "@react-navigation/native";
// // import OnBoardScreen from "./auth/OnBoardScreen";
// // import SignUpScreen from "./auth/SignUp/SignUpScreen";
// // import SignInScreen from "./auth/SignIn/SignInScreen";
// // import BottomTabs from "./Tabs/BottomTabs";
// // import LocationScreen from "./auth/SignIn/LocationScreen";
// // import AvailabilityGate from "./AvailabilityService/AvailabilityGate";
// // import ServiceNotAvailableScreen from "./AvailabilityService/ServiceNotAvailableScreen";
// // import NearestShopScreen from "./AvailabilityService/NearestShopScreen";
// // import ShopDetailScreen from "./Tabs/Home/ShopDetailScreen";
// // import CartScreen from "./Tabs/Cart/CartScreen";
// // import ChangeAddressScreen from "./Tabs/Address/ChangeAddressScreen";
// // import AddNewAddressScreen from "./Tabs/Address/AddNewAddressScreen";
// // import OrderDetailsScreen from "./Tabs/Orders/OrderDetailsScreen";
// // import ViewAllCategoryScreen from "./Tabs/Home/AllCategoryScreen/ViewAllCategoryScreen";


// // type Props = { isLoggedIn: boolean };

// // const StackNavigatorScreens: React.FC<Props> = ({ isLoggedIn }) => {
// //   const Stack = createNativeStackNavigator();

// //   return (
// //     <NavigationContainer>
// //       <Stack.Navigator screenOptions={{ headerShown: false }}>
// //   {!isLoggedIn ? (
// //     <>
// //       <Stack.Screen name="onBoardScreen" component={OnBoardScreen} />
// //       <Stack.Screen name="signUpScreen" component={SignUpScreen} />
// //       <Stack.Screen name="signInScreen" component={SignInScreen} />
// //     </>
// //   ) : (
// //     <>
// //       <Stack.Screen name="availabilityGate" component={AvailabilityGate} />
// //       <Stack.Screen name="locationScreen" component={LocationScreen} />
// //       <Stack.Screen name="serviceNotAvailable" component={ServiceNotAvailableScreen} />
// //       <Stack.Screen name="nearestShopScreen" component={NearestShopScreen} />
// //       <Stack.Screen name="shopDetailScreen" component={ShopDetailScreen} />
// //       <Stack.Screen name="cartScreen" component={CartScreen} />
// //       <Stack.Screen name="changeAddressScreen" component={ChangeAddressScreen} />
// //       <Stack.Screen name="addNewAddressScreen" component={AddNewAddressScreen} />
// //       <Stack.Screen name="orderDetailScreen" component={OrderDetailsScreen} />
// //       <Stack.Screen name="viewAllCategoryScreen" component={ViewAllCategoryScreen} />
// //       <Stack.Screen name="bottomTabScreen" component={BottomTabs} />
// //     </>
// //   )}
// // </Stack.Navigator>

// //     </NavigationContainer>
// //   );
// // };

// // export default StackNavigatorScreens;
// // src/screens/StackNavigatorScreens.tsx
// import React, { useContext } from "react";
// import { View, ActivityIndicator } from "react-native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { NavigationContainer } from "@react-navigation/native";
// import OnBoardScreen from "./auth/OnBoardScreen";
// import SignUpScreen from "./auth/SignUp/SignUpScreen";
// import SignInScreen from "./auth/SignIn/SignInScreen";
// import BottomTabs from "./Tabs/BottomTabs";
// import LocationScreen from "./auth/SignIn/LocationScreen";
// import AvailabilityGate from "./AvailabilityService/AvailabilityGate";
// import ServiceNotAvailableScreen from "./AvailabilityService/ServiceNotAvailableScreen";
// import NearestShopScreen from "./AvailabilityService/NearestShopScreen";
// import ShopDetailScreen from "./Tabs/Home/ShopDetailScreen";
// import CartScreen from "./Tabs/Cart/CartScreen";
// import ChangeAddressScreen from "./Tabs/Address/ChangeAddressScreen";
// import AddNewAddressScreen from "./Tabs/Address/AddNewAddressScreen";
// import OrderDetailsScreen from "./Tabs/Orders/OrderDetailsScreen";
// import ViewAllCategoryScreen from "./Tabs/Home/AllCategoryScreen/ViewAllCategoryScreen";
// import { AuthContext } from "../context/authContext";
// import OrdersScreen from "./Tabs/Orders/OrdersScreen";
// import CategoryDetailScreen from "./Tabs/Home/AllCategoryScreen/CategoryDetailScreen";
// import MenuDetailScreen from "./Tabs/Home/Menu/MenuDetailScreen";
// import SearchScreen from "./Tabs/Home/Search/SearchScreen";
// import ChangePasswordScreen from "./Tabs/Profile/ChangePassword/ChangePasswordScreen";
// import CoinWalletScreen from "./Tabs/Profile/CoinWallet/CoinWalletScreen";
// import ForgotPasswordScreen from "./auth/Password/ForgotPasswordScreen";
// import ResetPasswordScreen from "./auth/Password/ResetPasswordScreen";
// import EditProfileScreen from "./Tabs/Profile/EditProfileScreen";
// import TeaAndCoffeeScreen from "./Tabs/Home/Menu/TeaAndCoffeeScreen";
// import OfferScreen from "./Tabs/Profile/OfferScreen/OfferScreen";
// import TermsAndCondition from "./Tabs/Profile/Terms&Condition/TermsAndCondition";
// import FaqScreen from "./Tabs/Profile/FAQ/FaqScreen";
// import AboutUsScreen from "./Tabs/Profile/About Us/AboutUsScreen";

// const Stack = createNativeStackNavigator();

// const StackNavigatorScreens: React.FC = () => {
//   const { isLoading, isLoggedIn } = useContext(AuthContext);

//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {!isLoggedIn ? (
//           <>
//             <Stack.Screen name="onBoardScreen" component={OnBoardScreen} />
//             <Stack.Screen name="signUpScreen" component={SignUpScreen} />
//             <Stack.Screen name="signInScreen" component={SignInScreen} />
//                   <Stack.Screen name="forgotPassWordScreen" component={ForgotPasswordScreen} />
//             <Stack.Screen name="resetPasswordScreen" component={ResetPasswordScreen} />
//           </>
//         ) : (
//           <>
//             <Stack.Screen name="availabilityGate" component={AvailabilityGate} />
//             <Stack.Screen name="locationScreen" component={LocationScreen} />
//             <Stack.Screen name="serviceNotAvailable" component={ServiceNotAvailableScreen} />
//             <Stack.Screen name="nearestShopScreen" component={NearestShopScreen} />
//             <Stack.Screen name="teaAndCoffeeScreen" component={TeaAndCoffeeScreen} />
//             <Stack.Screen name="shopDetailScreen" component={ShopDetailScreen} />
//             <Stack.Screen name="cartScreen" component={CartScreen} />
//             <Stack.Screen name="changeAddressScreen" component={ChangeAddressScreen} />
//             <Stack.Screen name="addNewAddressScreen" component={AddNewAddressScreen} />
//             <Stack.Screen name="orderScreen" component={OrdersScreen} />
//             <Stack.Screen name="orderDetailScreen" component={OrderDetailsScreen} />
//             <Stack.Screen name="viewAllCategoryScreen" component={ViewAllCategoryScreen} />
//             <Stack.Screen name="categoryDetailScreen" component={CategoryDetailScreen} />
//             <Stack.Screen name="menuDetailScreen" component={MenuDetailScreen} />
//             <Stack.Screen name="searchScreen" component={SearchScreen} />
//             <Stack.Screen name="changePasswordScreen" component={ChangePasswordScreen} />
//             <Stack.Screen name="coinWalletScreen" component={CoinWalletScreen} />
//             <Stack.Screen name="offferScreen" component={OfferScreen} />
//             <Stack.Screen name="editProfileScreen" component={EditProfileScreen} />
//             <Stack.Screen name="termsAndConditionScreen" component={TermsAndCondition} />
//             <Stack.Screen name="faqScreen" component={FaqScreen} />
//             <Stack.Screen name="aboutUsScreen" component={AboutUsScreen} />
      
//             <Stack.Screen name="bottomTabScreen" component={BottomTabs} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default StackNavigatorScreens;

import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import { AuthContext } from "../context/authContext";

// Auth / onboarding
import OnBoardScreen from "./auth/OnBoardScreen";
import SignUpScreen from "./auth/SignUp/SignUpScreen";
import SignInScreen from "./auth/SignIn/SignInScreen";
import OtpVerification from "./auth/SignIn/OtpVerification";
import ForgotPasswordScreen from "./auth/Password/ForgotPasswordScreen";
import ResetPasswordScreen from "./auth/Password/ResetPasswordScreen";

// Availability / main app
import AvailabilityGate from "./AvailabilityService/AvailabilityGate";
import LocationScreen from "./auth/SignIn/LocationScreen";
import ServiceNotAvailableScreen from "./AvailabilityService/ServiceNotAvailableScreen";
import NearestShopScreen from "./AvailabilityService/NearestShopScreen";
import TeaAndCoffeeScreen from "./Tabs/Home/Menu/TeaAndCoffeeScreen";
import ShopDetailScreen from "./Tabs/Home/ShopDetailScreen";
import CartScreen from "./Tabs/Cart/CartScreen";
import ChangeAddressScreen from "./Tabs/Address/ChangeAddressScreen";
import AddNewAddressScreen from "./Tabs/Address/AddNewAddressScreen";
import OrdersScreen from "./Tabs/Orders/OrdersScreen";
import OrderDetailsScreen from "./Tabs/Orders/OrderDetailsScreen";
import ViewAllCategoryScreen from "./Tabs/Home/AllCategoryScreen/ViewAllCategoryScreen";
import MenuDetailScreen from "./Tabs/Home/Menu/MenuDetailScreen";
import SearchScreen from "./Tabs/Home/Search/SearchScreen";
import ChangePasswordScreen from "./Tabs/Profile/ChangePassword/ChangePasswordScreen";
import CoinWalletScreen from "./Tabs/Profile/CoinWallet/CoinWalletScreen";
import OfferScreen from "./Tabs/Profile/OfferScreen/OfferScreen";
import EditProfileScreen from "./Tabs/Profile/EditProfileScreen";
import TermsAndCondition from "./Tabs/Profile/Terms&Condition/TermsAndCondition";
import FaqScreen from "./Tabs/Profile/FAQ/FaqScreen";
import AboutUsScreen from "./Tabs/Profile/About Us/AboutUsScreen";
import BottomTabs from "./Tabs/BottomTabs";
import CategoryDetailScreen from "./Tabs/Home/AllCategoryScreen/CategoryDetailScreen";
import { ROUTES } from "../assets/routes/route";
import PayLaterScreen from "./Tabs/PayLater/PayLaterScreen";
import SinglePayLaterScreen from "./Tabs/PayLater/SinglePayLaterScreen";
import NewPasswordScreen from "./auth/Password/NewPasswordScreen";

const Stack = createNativeStackNavigator();

const StackNavigatorScreens: React.FC = () => {
  const { isLoading, isLoggedIn } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name={ROUTES.ONBOARD} component={OnBoardScreen} />
            <Stack.Screen name={ROUTES.SIGN_UP} component={SignUpScreen} />
            <Stack.Screen name={ROUTES.SIGN_IN} component={SignInScreen} />
            <Stack.Screen
              name={ROUTES.OTP_VERIFICATION}
              component={OtpVerification}
            />
            <Stack.Screen name={ROUTES.NEW_PASSWORD} component={NewPasswordScreen} />
            <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
            <Stack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name={ROUTES.AVAILABILITY_GATE} component={AvailabilityGate} />
            <Stack.Screen name={ROUTES.LOCATION} component={LocationScreen} />
            <Stack.Screen name={ROUTES.SERVICE_NOT_AVAILABLE} component={ServiceNotAvailableScreen} />
            <Stack.Screen name={ROUTES.NEAREST_SHOP} component={NearestShopScreen} />
            <Stack.Screen name={ROUTES.TEA_AND_COFFEE} component={TeaAndCoffeeScreen} />
            <Stack.Screen name={ROUTES.SHOP_DETAIL} component={ShopDetailScreen} />
            <Stack.Screen name={ROUTES.CART} component={CartScreen} />
            <Stack.Screen name={ROUTES.CHANGE_ADDRESS} component={ChangeAddressScreen} />
            <Stack.Screen name={ROUTES.ADD_NEW_ADDRESS} component={AddNewAddressScreen} />
            <Stack.Screen name={ROUTES.ORDERS} component={OrdersScreen} />
            <Stack.Screen name={ROUTES.ORDER_DETAILS} component={OrderDetailsScreen} />
            <Stack.Screen name={ROUTES.VIEW_ALL_CATEGORY} component={ViewAllCategoryScreen} />
            <Stack.Screen name={ROUTES.CATEGORY_DETAIL} component={CategoryDetailScreen} />
            <Stack.Screen name={ROUTES.MENU_DETAIL} component={MenuDetailScreen} />
            <Stack.Screen name={ROUTES.SEARCH} component={SearchScreen} />
            <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
            <Stack.Screen name={ROUTES.COIN_WALLET} component={CoinWalletScreen} />
            <Stack.Screen name={ROUTES.OFFER} component={OfferScreen} />
            <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
            <Stack.Screen name={ROUTES.TERMS_AND_CONDITIONS} component={TermsAndCondition} />
            <Stack.Screen name={ROUTES.FAQ} component={FaqScreen} />
            <Stack.Screen name={ROUTES.ABOUT_US} component={AboutUsScreen} />
            <Stack.Screen name={ROUTES.PAY_LATER} component={PayLaterScreen} />
            <Stack.Screen name={ROUTES.SINGLE_PAY_LATER} component={SinglePayLaterScreen} />
            <Stack.Screen name={ROUTES.BOTTOM_TABS} component={BottomTabs} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigatorScreens;
