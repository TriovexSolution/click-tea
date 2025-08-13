import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';


import theme from '@/src/assets/colors/theme';
import { hp, wp } from '@/src/assets/utils/responsive';
import HomeScreen from './Home/HomeScreen';
import OrdersScreen from './Orders/OrdersScreen';
import ProfileScreen from './Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }: any) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });
    rotate.value = withTiming(360, { duration: 500 }, () => {
      rotate.value = 0;
    });
    if (onPress) onPress();
  };

  return (
    <Animated.View style={[styles.floatingButton, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.centerTouchable}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={1}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp(0.5),
            }}
          />
        ),
        tabBarIcon: ({ focused }) => {
          let iconName = '';
          let label = '';

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              label = 'Home';
              break;
            case 'Orders':
              iconName = 'receipt-outline';
              label = 'Orders';
              break;
            case 'Profile':
              iconName = 'person-outline';
              label = 'Profile';
              break;
          }

          return (
            <View style={focused ? styles.focusedTab : styles.defaultTab}>
              <Ionicons
                name={iconName}
                size={hp(2.6)}
                color={focused ? '#fff' : '#ccc'}
              />
              {focused && <Text style={styles.label}>{label}</Text>}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    bottom: hp(1.5),
    left: wp(4),
    right: wp(4),
    height: hp(7),
    borderRadius: 20,
    backgroundColor: theme.PRIMARY_COLOR,
    paddingBottom: Platform.OS === 'android' ? hp(0.6) : 0,
    paddingTop: hp(1),
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    borderTopWidth: 0,
    marginHorizontal:wp(4),
  },
  floatingButton: {
    top: -hp(3.5),
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    borderWidth: 3,
    borderColor: theme.PRIMARY_COLOR,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#943400',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  centerTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedTab: {
    width: wp(14),
    height: hp(6 ),
    borderRadius: 12,
    backgroundColor: '#ffffff30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.3),
    marginTop:hp(0.5)
  },
  defaultTab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(6),
  },
  label: {
    color: '#fff',
    fontSize: hp(1.3),
    fontWeight: '500',
    marginTop: hp(0.2),
    textAlign: 'center',
  },
});