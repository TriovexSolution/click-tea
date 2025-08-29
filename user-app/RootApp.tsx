import { View, Text, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import StackNavigatorScreens from './src/screens/StackNavigatorScreens'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile } from './src/Redux/Slice/profileSlice'
import { RootState } from './src/Redux/store'

const RootApp = () => {
     const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.data);

//   console.log("Redux test profile:", profile);
  useEffect(() => {
    // console.log("Dispatching fetchUserProfile...");
    dispatch(fetchUserProfile()); // ✅ safe, now inside Provider
  }, [dispatch]);
  return (
   <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar hidden />
      <StackNavigatorScreens />
    </SafeAreaView>
  )
}

export default RootApp