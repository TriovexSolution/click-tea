// // import { View, Text, ActivityIndicator } from "react-native";
// // import { createNativeStackNavigator } from "@react-navigation/native-stack";
// // import { NavigationContainer } from "@react-navigation/native";
// // import React, { useEffect, useState } from "react";
// // import OnBoardScreen from "./auth/OnBoardScreen";
// // import SignUpScreen from "./auth/SignUp/SignUpScreen";
// // import SignInScreen from "./auth/SignIn/SignInScreen";
// // import BottomTabs from "./Tabs/BottomTabs";
// // import ShopDetailScreen from "./Tabs/Home/ShopDetailScreen";
// // import CartScreen from "./Tabs/Cart/CartScreen";
// // import LoginScreen from "./auth/SignIn/LoginInScreen";
// // import OtpVerificationScreen from "./auth/SignIn/OtpVerification";
// // import LocationScreen from "./auth/SignIn/LocationScreen";
// // import ViewAllCategoryScreen from "./Tabs/Home/AllCategoryScreen/ViewAllCategoryScreen";
// // import ChangeAddressScreen from "./Tabs/Address/ChangeAddressScreen";
// // import AddNewAddressScreen from "./Tabs/Address/AddNewAddressScreen";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import AvailabilityGate from "./AvailabilityService/AvailabilityGate";

// // const StackNavigatorScreens = () => {
// //   const Stack = createNativeStackNavigator();
// //     const [loading, setLoading] = useState(true);
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //    useEffect(() => {
// //     const checkAuth = async () => {
// //       try {
// //         const token = await AsyncStorage.getItem("authToken");
// //         // console.log(token);
        
// //         setIsLoggedIn(!!token);
// //       } catch (err) {
// //         console.log("Error checking token", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     checkAuth();
// //   }, []);
// //     if (loading) {
// //     return (
// //       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
// //         <ActivityIndicator size="large" />
// //       </View>
// //     );
// //   }
// //   return (
// //     <NavigationContainer>
// //       <Stack.Navigator
// //         //  initialRouteName={isLoggedIn ? "bottomTabScreen" : "onBoardScreen"}
// //         initialRouteName={isLoggedIn ? "availabilityGate" : "onBoardScreen"}
// //         screenOptions={{
// //           headerShown: false,
// //         }}
// //       >
// //         <Stack.Screen name="onBoardScreen" component={OnBoardScreen} />
// //         <Stack.Screen name="signUpScreen" component={SignUpScreen} />
// //         <Stack.Screen name="signInScreen" component={SignInScreen} />
// //         <Stack.Screen name="bottomTabScreen" component={BottomTabs} />
// //         <Stack.Screen name="shopDetailScreen" component={ShopDetailScreen} />
// //         <Stack.Screen name="cartScreen" component={CartScreen} />
// //         <Stack.Screen name="loginInScreen" component={LoginScreen} />
// //         <Stack.Screen name="otpVerificatonScreen" component={OtpVerificationScreen} />
// //         <Stack.Screen name="locationScreen" component={LocationScreen} />
// //         <Stack.Screen name="viewAllCategoryScreen" component={ViewAllCategoryScreen} />
// //         <Stack.Screen name="changeAddressScreen" component={ChangeAddressScreen} />
// //         <Stack.Screen name="addNewAddressScreen" component={AddNewAddressScreen} />

// // <Stack.Screen name="availabilityGate" component={AvailabilityGate} />
// //       </Stack.Navigator>
// //     </NavigationContainer>
// //   );
// // };

// // export default StackNavigatorScreens;
// import React from "react";
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


// type Props = { isLoggedIn: boolean };

// const StackNavigatorScreens: React.FC<Props> = ({ isLoggedIn }) => {
//   const Stack = createNativeStackNavigator();

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//   {!isLoggedIn ? (
//     <>
//       <Stack.Screen name="onBoardScreen" component={OnBoardScreen} />
//       <Stack.Screen name="signUpScreen" component={SignUpScreen} />
//       <Stack.Screen name="signInScreen" component={SignInScreen} />
//     </>
//   ) : (
//     <>
//       <Stack.Screen name="availabilityGate" component={AvailabilityGate} />
//       <Stack.Screen name="locationScreen" component={LocationScreen} />
//       <Stack.Screen name="serviceNotAvailable" component={ServiceNotAvailableScreen} />
//       <Stack.Screen name="nearestShopScreen" component={NearestShopScreen} />
//       <Stack.Screen name="shopDetailScreen" component={ShopDetailScreen} />
//       <Stack.Screen name="cartScreen" component={CartScreen} />
//       <Stack.Screen name="changeAddressScreen" component={ChangeAddressScreen} />
//       <Stack.Screen name="addNewAddressScreen" component={AddNewAddressScreen} />
//       <Stack.Screen name="orderDetailScreen" component={OrderDetailsScreen} />
//       <Stack.Screen name="viewAllCategoryScreen" component={ViewAllCategoryScreen} />
//       <Stack.Screen name="bottomTabScreen" component={BottomTabs} />
//     </>
//   )}
// </Stack.Navigator>

//     </NavigationContainer>
//   );
// };

// export default StackNavigatorScreens;
// src/screens/StackNavigatorScreens.tsx
import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import OnBoardScreen from "./auth/OnBoardScreen";
import SignUpScreen from "./auth/SignUp/SignUpScreen";
import SignInScreen from "./auth/SignIn/SignInScreen";
import BottomTabs from "./Tabs/BottomTabs";
import LocationScreen from "./auth/SignIn/LocationScreen";
import AvailabilityGate from "./AvailabilityService/AvailabilityGate";
import ServiceNotAvailableScreen from "./AvailabilityService/ServiceNotAvailableScreen";
import NearestShopScreen from "./AvailabilityService/NearestShopScreen";
import ShopDetailScreen from "./Tabs/Home/ShopDetailScreen";
import CartScreen from "./Tabs/Cart/CartScreen";
import ChangeAddressScreen from "./Tabs/Address/ChangeAddressScreen";
import AddNewAddressScreen from "./Tabs/Address/AddNewAddressScreen";
import OrderDetailsScreen from "./Tabs/Orders/OrderDetailsScreen";
import ViewAllCategoryScreen from "./Tabs/Home/AllCategoryScreen/ViewAllCategoryScreen";
import { AuthContext } from "../context/authContext";
import OrdersScreen from "./Tabs/Orders/OrdersScreen";
import CategoryDetailScreen from "./Tabs/Home/AllCategoryScreen/CategoryDetailScreen";
import MenuDetailScreen from "./Tabs/Home/Menu/MenuDetailScreen";
import SearchScreen from "./Tabs/Home/Search/SearchScreen";

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
            <Stack.Screen name="onBoardScreen" component={OnBoardScreen} />
            <Stack.Screen name="signUpScreen" component={SignUpScreen} />
            <Stack.Screen name="signInScreen" component={SignInScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="availabilityGate" component={AvailabilityGate} />
            <Stack.Screen name="locationScreen" component={LocationScreen} />
            <Stack.Screen name="serviceNotAvailable" component={ServiceNotAvailableScreen} />
            <Stack.Screen name="nearestShopScreen" component={NearestShopScreen} />
            <Stack.Screen name="shopDetailScreen" component={ShopDetailScreen} />
            <Stack.Screen name="cartScreen" component={CartScreen} />
            <Stack.Screen name="changeAddressScreen" component={ChangeAddressScreen} />
            <Stack.Screen name="addNewAddressScreen" component={AddNewAddressScreen} />
            <Stack.Screen name="orderScreen" component={OrdersScreen} />
            <Stack.Screen name="orderDetailScreen" component={OrderDetailsScreen} />
            <Stack.Screen name="viewAllCategoryScreen" component={ViewAllCategoryScreen} />
            <Stack.Screen name="categoryDetailScreen" component={CategoryDetailScreen} />
            <Stack.Screen name="menuDetailScreen" component={MenuDetailScreen} />
            <Stack.Screen name="searchScreen" component={SearchScreen} />
            <Stack.Screen name="bottomTabScreen" component={BottomTabs} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigatorScreens;
