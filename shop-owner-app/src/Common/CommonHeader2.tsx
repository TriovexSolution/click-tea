import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '@/src/assets/utils/responsive';
import theme from '@/src/assets/colors/theme';

interface CommonHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const CommonHeader2: React.FC<CommonHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightComponent,
  containerStyle,
  titleStyle,
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Back Button */}
      {showBackButton && (
        <TouchableOpacity
          onPress={onBackPress || (() => navigation.goBack())}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={hp(3.5)}
            color="#943400"
          />
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>

      {/* Optional Right-side content */}
      <View style={styles.rightPlaceholder}>
        {rightComponent || null}
      </View>
    </View>
  );
};

export default CommonHeader2;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fff',
    marginVertical: hp(1),
  },
  backButton: {
    position: 'absolute',
    left: wp(3),
    zIndex: 1,
  },
  title: {
    color: theme.PRIMARY_COLOR,
    fontSize: hp(3),
    fontWeight: '600',
    textAlign: 'center',
  },
  rightPlaceholder: {
    position: 'absolute',
    right: wp(3),
    zIndex: 1,
  },
});
