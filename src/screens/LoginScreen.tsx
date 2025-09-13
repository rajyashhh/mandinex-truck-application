import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');

const SLIDER_TEXTS = [
  "Smart Logistics for Fresh Produce",
  "Real-Time Agricultural Transport",
  "Precision Delivery Solutions",
  "Connecting Farms to Markets",
  "Sustainable Supply Chain"
];

export default function LoginScreen({ navigation, route }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const sliderFadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ScrollView ref for keyboard handling
  const scrollViewRef = useRef<ScrollView>(null);

  const rideType = route?.params?.rideType || 'new';

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Text slider animation
    const sliderInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(sliderFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sliderFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentSliderIndex((prevIndex) => 
        prevIndex === SLIDER_TEXTS.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    // Pulse animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Keyboard event listeners for better handling
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to form section when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: height * 0.4, // Scroll to form area
            animated: true,
          });
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      clearInterval(sliderInterval);
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Validate Indian phone number (10 digits)
    const isValid = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
    setIsValidPhone(isValid);
  }, [phoneNumber]);

  const handleSendOTP = () => {
    if (!isValidPhone) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to OTP screen
    navigation.navigate('OTPVerification', { 
      phone: '+91' + phoneNumber,
      rideType: rideType 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(keyboardHeight, 20) }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Background Elements */}
            <View style={styles.backgroundElements}>
              <Animated.View
                style={[
                  styles.bgCircle,
                  styles.circle1,
                  { 
                    opacity: fadeAnim,
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.bgCircle,
                  styles.circle2,
                  { opacity: fadeAnim }
                ]}
              />
              <View style={styles.gridPattern}>
                {[...Array(6)].map((_, i) => (
                  <View key={i} style={[styles.gridLine, { top: i * 80 }]} />
                ))}
              </View>
            </View>

            {/* Header Section - Reduced padding for keyboard space */}
            <Animated.View
              style={[
                styles.header,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>🚛</Text>
                </View>
                <Text style={styles.brandTitle}>Mandinext</Text>
              </View>
            </Animated.View>

            {/* Premium Text Slider - Mid Section */}
            <Animated.View
              style={[
                styles.sliderSection,
                { opacity: fadeAnim }
              ]}
            >
              <Animated.Text
                style={[
                  styles.sliderText,
                  { opacity: sliderFadeAnim }
                ]}
              >
                {SLIDER_TEXTS[currentSliderIndex]}
              </Animated.Text>
              <View style={styles.sliderDots}>
                {SLIDER_TEXTS.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentSliderIndex && styles.activeDot
                    ]}
                  />
                ))}
              </View>
            </Animated.View>

            {/* Login Form - Below Mid */}
            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Enter Mobile Number</Text>
                  <Text style={styles.formSubtitle}>
                    We'll send you a verification code via SMS
                  </Text>
                </View>

                {/* Mobile Number Input */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <View style={styles.phoneInputContainer}>
                    <View style={styles.countryCodeContainer}>
                      <Text style={styles.countryFlag}>🇮🇳</Text>
                      <Text style={styles.countryCode}>+91</Text>
                    </View>
                    <View style={styles.inputDivider} />
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="98765 43210"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phoneNumber}
                      onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ''))}
                      onFocus={() => {
                        // Scroll to ensure input is visible when focused
                        setTimeout(() => {
                          scrollViewRef.current?.scrollTo({
                            y: height * 0.35,
                            animated: true,
                          });
                        }, 100);
                      }}
                    />
                    {isValidPhone && (
                      <View style={styles.validIcon}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Send OTP Button */}
                <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                  <TouchableOpacity
                    style={[
                      styles.otpButton,
                      isValidPhone && styles.otpButtonActive
                    ]}
                    onPress={handleSendOTP}
                    disabled={!isValidPhone}
                    activeOpacity={0.9}
                  >
                    <Text style={[
                      styles.otpButtonText,
                      isValidPhone && styles.otpButtonTextActive
                    ]}>
                      Send OTP
                    </Text>
                    {isValidPhone && (
                      <View style={styles.buttonIconContainer}>
                        <Text style={styles.buttonIcon}>📱</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {/* Trust Indicators */}
                <View style={styles.trustSection}>
                  <View style={styles.trustItem}>
                    <Text style={styles.trustIcon}>🔒</Text>
                    <Text style={styles.trustText}>Secure & Private</Text>
                  </View>
                  <View style={styles.trustItem}>
                    <Text style={styles.trustIcon}>⚡</Text>
                    <Text style={styles.trustText}>Instant Verification</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Bottom Section */}
            <Animated.View
              style={[
                styles.bottomSection,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.termsText}>
                By continuing, you agree to our Terms & Privacy Policy
              </Text>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1E2B', // Deep agritech background
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  
  // Background Elements
  backgroundElements: {
    position: 'absolute',
    width: width,
    height: height,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
    backgroundColor: 'rgba(76, 175, 80, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.12)',
  },
  circle2: {
    width: 120,
    height: 120,
    bottom: 100,
    left: -30,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.1)',
  },
  gridPattern: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.02,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#4CAF50',
  },

  // Header (reduced padding for keyboard space)
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 15,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  logoIcon: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // Premium Text Slider (Mid Section) - Reduced spacing
  sliderSection: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 30,
    minHeight: 90,
    justifyContent: 'center',
  },
  sliderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 15,
    minHeight: 50,
  },
  sliderDots: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 16,
  },

  // Form Section (Below Mid) - Optimized for keyboard
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Input Section
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  validIcon: {
    marginLeft: 10,
  },
  checkMark: {
    fontSize: 18,
    color: '#4CAF50',
  },

  // OTP Button
  otpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  otpButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  otpButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  otpButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonIconContainer: {
    marginLeft: 6,
  },
  buttonIcon: {
    fontSize: 14,
  },

  // Trust Section
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  trustItem: {
    alignItems: 'center',
  },
  trustIcon: {
    fontSize: 14,
    marginBottom: 3,
  },
  trustText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
