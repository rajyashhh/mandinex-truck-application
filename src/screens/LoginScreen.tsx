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
import Logo from '../components/Logo';
import { COLORS, SIZES } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation, route }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const illustrationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const rideType = route?.params?.rideType || 'new';

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(illustrationAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for interactive elements
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

    // Keyboard event listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Validate Indian phone number (10 digits)
    const isValid = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
    setIsValidPhone(isValid);
  }, [phoneNumber]);

  const handleSendOTP = async () => {
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

    try {
      // Call our own API to save phone number
      // Using your computer's IP address for mobile testing
      const API_URL = __DEV__ 
        ? 'http://192.168.43.20:3001/api/send-otp'
        : 'https://your-production-api.com/api/send-otp';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Navigate to OTP screen with driver ID
        navigation.navigate('OTPVerification', { 
          phone: '+91' + phoneNumber,
          rideType: rideType,
          driverId: data.driverId
        });
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainContainer}>
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
            </View>

            {/* Top Content - Illustration and Welcome */}
            <ScrollView 
              style={styles.topContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Brand Section */}
              <Animated.View
                style={[
                  styles.brandSection,
                  { opacity: fadeAnim }
                ]}
              >
                <Text style={styles.brandName}>MANDINEXT</Text>
              </Animated.View>

              {/* Main Illustration Section */}
              <Animated.View
                style={[
                  styles.illustrationSection,
                  { 
                    opacity: illustrationAnim,
                    transform: [{ scale: illustrationAnim }]
                  }
                ]}
              >
                <View style={styles.illustrationContainer}>
                  {/* Central Truck Driver Character */}
                  <View style={styles.centralCharacter}>
                    <View style={styles.driverContainer}>
                      <Text style={styles.driverEmoji}>👨‍🚛</Text>
                      <View style={styles.packageContainer}>
                        <Text style={styles.packageEmoji}>📦</Text>
                      </View>
                    </View>
                  </View>

                  {/* Surrounding Agricultural Icons */}
                  <View style={styles.floatingIcons}>
                    <Animated.View 
                      style={[
                        styles.floatingIcon, 
                        styles.icon1,
                        { transform: [{ scale: pulseAnim }] }
                      ]}
                    >
                      <Text style={styles.iconEmoji}>🚛</Text>
                    </Animated.View>
                    <View style={[styles.floatingIcon, styles.icon2]}>
                      <Text style={styles.iconEmoji}>🌾</Text>
                    </View>
                    <View style={[styles.floatingIcon, styles.icon3]}>
                      <Text style={styles.iconEmoji}>🚜</Text>
                    </View>
                    <View style={[styles.floatingIcon, styles.icon4]}>
                      <Text style={styles.iconEmoji}>📍</Text>
                    </View>
                    <View style={[styles.floatingIcon, styles.icon5]}>
                      <Text style={styles.iconEmoji}>🌱</Text>
                    </View>
                    <View style={[styles.floatingIcon, styles.icon6]}>
                      <Text style={styles.iconEmoji}>⚡</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Welcome Section */}
              <Animated.View
                style={[
                  styles.welcomeSection,
                  { 
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.welcomeTitle}>Welcome 👋</Text>
                <Text style={styles.welcomeDescription}>
                  With a valid number, you can access deliveries, and our agricultural logistics services
                </Text>
              </Animated.View>
            </ScrollView>

            {/* Bottom Fixed Input Section - Porter Style */}
            <Animated.View
              style={[
                styles.bottomInputSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  paddingBottom: keyboardHeight > 0 ? 10 : 30, // Adjust for keyboard
                }
              ]}
            >
              {/* Mobile Number Input */}
              <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.countryCodeSection}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <Text style={styles.dropdownArrow}>⌄</Text>
                </TouchableOpacity>
                <View style={styles.numberInputSection}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Mobile Number"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ''))}
                  />
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
                    {isValidPhone ? 'Send OTP' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Terms Text */}
              <Text style={styles.termsText}>
                By clicking on login you agree to the{' '}
                <Text style={styles.termsLink}>terms of service</Text> and{' '}
                <Text style={styles.termsLink}>privacy policy</Text>
              </Text>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1E2B', // Your original dark agritech background
  },
  keyboardView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },

  // Background Elements - Your original style
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

  // Top Content
  topContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Brand Section - Your original colors
  brandSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4CAF50', // Your original green
    letterSpacing: 2,
  },

  // Illustration Section - Your original dark theme
  illustrationSection: {
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: height * 0.35,
    justifyContent: 'center',
  },
  illustrationContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    backgroundColor: 'rgba(76, 175, 80, 0.08)', // Your original green tint
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralCharacter: {
    alignItems: 'center',
  },
  driverContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  driverEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  packageContainer: {
    backgroundColor: '#4CAF50', // Your original green
    borderRadius: 12,
    padding: 8,
    position: 'absolute',
    bottom: -5,
    right: -10,
  },
  packageEmoji: {
    fontSize: 20,
  },

  // Floating Icons - Your original style
  floatingIcons: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingIcon: {
    position: 'absolute',
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Your original translucent style
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  icon1: {
    top: 20,
    left: 20,
  },
  icon2: {
    top: 40,
    right: 30,
  },
  icon3: {
    bottom: 60,
    left: 10,
  },
  icon4: {
    bottom: 30,
    right: 20,
  },
  icon5: {
    top: 100,
    left: -10,
  },
  icon6: {
    top: 80,
    right: -5,
  },
  iconEmoji: {
    fontSize: 24,
  },

  // Welcome Section - Your original colors
  welcomeSection: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF', // Your original white
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)', // Your original secondary text
    lineHeight: 24,
    fontWeight: '400',
  },

  // Bottom Fixed Input Section - Porter structure with your colors
  bottomInputSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#0F1E2B', // Your original background
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Your original input background
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)', // Your original border
    marginBottom: 20,
    overflow: 'hidden',
  },
  countryCodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Your original white text
    marginRight: 8,
  },
  dropdownArrow: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)', // Your original secondary text
  },
  numberInputSection: {
    flex: 1,
  },
  phoneInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF', // Your original white text
    paddingHorizontal: 16,
    paddingVertical: 18,
  },

  // OTP Button - Your original style
  otpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Your original inactive state
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  otpButtonActive: {
    backgroundColor: '#4CAF50', // Your original green
    borderColor: '#4CAF50',
  },
  otpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)', // Your original inactive text
  },
  otpButtonTextActive: {
    color: '#FFFFFF', // Your original active text
  },

  // Terms Section - Your original style
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)', // Your original secondary text
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: 10,
  },
  termsLink: {
    color: '#4CAF50', // Your original green links
    fontWeight: '600',
  },
});
