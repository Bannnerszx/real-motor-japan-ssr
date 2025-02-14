import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const variantStyles = {
  default: {
    container: { backgroundColor: '#edf2f7', borderColor: '#cbd5e0' },
    text: { color: '#2d3748' },
    icon: { color: '#2d3748' },
  },
  destructive: {
    container: { backgroundColor: '#fed7d7', borderColor: '#feb2b2' },
    text: { color: '#c53030' },
    icon: { color: '#c53030' },
  },
  success: {
    container: { backgroundColor: '#c6f6d5', borderColor: '#68d391' },
    text: { color: '#2f855a' },
    icon: { color: '#2f855a' },
  },
  warning: {
    container: { backgroundColor: '#faf089', borderColor: '#ecc94b' },
    text: { color: '#975a16' },
    icon: { color: '#975a16' },
  },
  info: {
    container: { backgroundColor: '#bee3f8', borderColor: '#63b3ed' },
    text: { color: '#2b6cb0' },
    icon: { color: '#2b6cb0' },
  },
};

/**
 * GlobalAlert is rendered as an overlay that slides down from the top of the screen.
 *
 * @param {string} variant - Variant style ("default", "destructive", "success", "warning", "info").
 * @param {string} title - Alert title text.
 * @param {string} description - Additional alert description.
 * @param {function} onClose - Callback when the close button is pressed.
 * @param {object} style - Optional additional style overrides.
 */
const Alert = ({ variant = 'default', title, description, onClose, style }) => {
  // Create an animated value that starts off-screen above.
  const slideAnim = useRef(new Animated.Value(-150)).current;

  // Animate the alert into view on mount.
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const stylesForVariant = variantStyles[variant] || variantStyles.default;

  return (
    <Animated.View
      style={[
        overlayStyles.absoluteContainer,
        { transform: [{ translateY: slideAnim }] },
        style,
      ]}
    >
      <View style={[overlayStyles.alertContainer, stylesForVariant.container]}>
        {/* Icon */}
        <View style={overlayStyles.iconContainer}>
          <Ionicons
            name="alert-circle"
            size={24}
            color={stylesForVariant.icon.color}
          />
        </View>

        {/* Text Content */}
        <View style={overlayStyles.textContainer}>
          {title && (
            <Text style={[overlayStyles.title, stylesForVariant.text]}>
              {title}
            </Text>
          )}
          {description && (
            <Text style={[overlayStyles.description, stylesForVariant.text]}>
              {description}
            </Text>
          )}
        </View>

        {/* Optional Close Button */}
        {onClose && (
          <TouchableOpacity onPress={onClose} style={overlayStyles.closeButton}>
            <Ionicons name="close" size={20} color={stylesForVariant.icon.color} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const overlayStyles = StyleSheet.create({
  // Absolute container to position the alert at the top over other content.
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  alertContainer: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    marginLeft: 8,
  },
});

export default Alert;
