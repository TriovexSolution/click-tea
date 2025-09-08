import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import { Stack } from 'expo-router'
import OnBoardScreen from './Auth/OnBoardScreen'
import SignInScreen from './Auth/SignIn/SignInScreen'
import SignUpScreen from './Auth/SignUp/SignUpScreen'
import EnterShopDetailScreen from './Shops/EnterShopDetailScreen'
import BottomTabs from './Tabs/BottomTabs'
import AddCategoryScreen from './Tabs/Home/category/AddcategoryScreen'
import AddMenuScreen from './Tabs/Home/menu/AddMenuScreen'
import MenuItemScreen from './Tabs/Home/menu/MenuItemsScreen'
import ManageBestSellerScreen from './Tabs/Home/BestSeller/ManageBestSellerScreen'


const StackNavigationScreens = () => {
    const Stack = createNativeStackNavigator()
  return (
<NavigationContainer>
    <Stack.Navigator  initialRouteName="onBoardScreen" screenOptions={{
        headerShown: false
      }} >
        <Stack.Screen name='onBoardScreen' component={OnBoardScreen}/>
        <Stack.Screen name='signInScreen' component={SignInScreen}/>
        <Stack.Screen name='signUpScreen' component={SignUpScreen}/>
        <Stack.Screen name='enterShopDetailScreen' component={EnterShopDetailScreen}/>
        <Stack.Screen name='bottamTabScreen' component={BottomTabs}/>
        <Stack.Screen name='addCategoryScreen' component={AddCategoryScreen}/>
        <Stack.Screen name='addMenuScreen' component={AddMenuScreen}/>
        <Stack.Screen name='menuItemsScreen' component={MenuItemScreen} />
        <Stack.Screen name='manageBestSellerScreen' component={ManageBestSellerScreen} />
    </Stack.Navigator>
</NavigationContainer>
  )
}

export default StackNavigationScreens