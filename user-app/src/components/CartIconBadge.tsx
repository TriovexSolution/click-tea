// src/components/CartIconWithBadge.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectSelectedShopId } from '../Redux/Slice/selectedShopSlice';
import { fetchCartAsync, selectCartCount } from '../Redux/Slice/cartSlice';
import theme from '../assets/colors/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  shopId: number;
};
const CartIconWithBadge = () => {
  // console.log(shopId,"carticon");
      const shopId = useSelector(selectSelectedShopId);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const cartCount = useSelector(selectCartCount);
const [cartLoaded, setCartLoaded] = useState(false);
const dispatch = useDispatch();
useEffect(() => {
  (async () => {
    const id = await AsyncStorage.getItem("userId");
    // console.log(id);
    
    if (id) {
      await dispatch(fetchCartAsync(id));
    }
    setCartLoaded(true);
  })();
}, []);

if (!cartLoaded) return null; // or show empty icon without badge
  return (
    // console.log("Cart count from selector:", cartCount),
    <TouchableOpacity onPress={() => navigation.navigate('cartScreen')}>
    <View style={{ position: 'relative', padding: 4 }}>
      <Ionicons name="cart-outline" size={24} color={theme.PRIMARY_COLOR} />
      {cartCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -4,
          backgroundColor: 'red',
          borderRadius: 10,
          width: 18,
          height: 18,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {cartCount}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
  );
};

export default CartIconWithBadge;
