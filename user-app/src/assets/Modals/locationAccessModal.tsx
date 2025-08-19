import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { useEffect } from 'react';

const { height } = Dimensions.get('window');

const LocationAccessModal = ({ visible, onClose, message, onSettings }: any) => {
  const translateY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
    } else {
      translateY.value = withTiming(height, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.modalOverlay, animatedStyle]}>
      <View
       style={styles.modalContent}>
        <Text style={styles.modalText}>{message}</Text>
        <TouchableOpacity
          onPress={onSettings}
          style={styles.modalButton}
        >
          <Text style={styles.modalButtonText}>Go to Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.modalButton, { backgroundColor: '#ccc' }]}
        >
          <Text style={styles.modalButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default LocationAccessModal;

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalText: { fontSize: 16, marginBottom: 15, textAlign: 'center' },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
});
