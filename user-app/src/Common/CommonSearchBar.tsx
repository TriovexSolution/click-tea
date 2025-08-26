// src/Common/CommonSearchBar.tsx
import React, { memo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  GestureResponderEvent,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconColor?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  inputProps?: TextInputProps;
  onSubmit?: (text?: string) => void; // Called on keyboard submit
  showClear?: boolean; // show clear X button
  onClear?: (e?: GestureResponderEvent) => void;
  rightAccessory?: React.ReactNode; // spinner or custom icon rendered inside input to the right
};

const CommonSearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  iconColor = "#999",
  containerStyle,
  inputProps,
  onSubmit,
  showClear = false,
  onClear,
  rightAccessory,
}) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.inner}>
        <Ionicons name="search-outline" size={20} color={iconColor} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#9b9b9b"
          returnKeyType="search"
          onSubmitEditing={() => onSubmit && onSubmit(value)}
          underlineColorAndroid="transparent"
          {...inputProps}
        />
        {/* right accessory (spinner / custom) */}
        {rightAccessory ? (
          <View style={styles.rightAccessoryContainer}>{rightAccessory}</View>
        ) : showClear && value ? (
          <TouchableOpacity
            onPress={(e) => {
              // clear input and call optional onClear
              onChangeText("");
              onClear && onClear(e);
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="close-circle" size={18} color="#bbb" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default memo(CommonSearchBar);

const styles = StyleSheet.create({
  // wrapper has no horizontal margins - parent should control spacing
  wrapper: {
    width: "100%",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 8, android: 6 }),
    // subtle shadow (optional)
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#222",
    paddingVertical: 0, // keep consistent height
  },
  rightAccessoryContainer: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
