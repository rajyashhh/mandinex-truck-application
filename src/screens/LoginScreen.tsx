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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');

interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
];

export default function LoginScreen({ navigation, route }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formSlideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const rideType = route?.params?.rideType || 'new';

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Validate phone number (basic validation for 10 digits)
    const isValid = phoneNumber.length >= 10 && /^\d+$/.test(phoneNumber);
    setIsValidPhone(isValid);
  }, [phoneNumber]);

  const handleSendOTP = () => {
    if (!isValidPhone) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
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

    // TODO: Implement OTP sending logic
    console.log(`Sending OTP to ${selectedCountry.code}${phoneNumber} for ${rideType} ride`);
    Alert.alert(
      'OTP Sent!', 
      `Verification code sent to ${selectedCountry.code}${phoneNumber}`,
      [{ text: 'OK' }]
    );
    // navigation.navigate('OTPVerification', { phone: selectedCountry.code + phoneNumber });
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Background decorative elements */}
          <View style={styles.backgroundDecorations}>
            <Animated.View
              style={[
                styles.decorativeShape,
                styles.shape1,
                { 
                  opacity: fadeAnim,
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            />
            <Animated.View
              style={[
                styles.decorativeShape,
                styles.shape2,
                { opacity: fadeAnim }
              ]}
            />
            <Animated.View
              style={[
                styles.decorativeShape,
                styles.shape3,
                { opacity: fadeAnim }
              ]}
            />
          </View>

          {/* Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.headerIcon}>📱</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              {rideType === 'new' ? 'Ready to start your journey?' : 'Continue where you left off'}
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [{ translateY: formSlideAnim }]
              }
            ]}
          >
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Enter Your Mobile Number</Text>
              <Text style={styles.formSubtitle}>
                We'll send you a verification code
              </Text>

              {/* Country Code Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Country</Text>
                <TouchableOpacity
                  style={styles.countrySelector}
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                >
                  <View style={styles.flagContainer}>
                    <Text style={styles.flag}>{selectedCountry.flag}</Text>
                  </View>
                  <Text style={styles.countryText}>
                    {selectedCountry.code} {selectedCountry.name}
                  </Text>
                  <Text style={[
                    styles.chevronIcon,
                    showCountryPicker && styles.chevronRotated
                  ]}>
                    ↓
                  </Text>
                </TouchableOpacity>

                {/* Country Picker Dropdown */}
                {showCountryPicker && (
                  <View style={styles.countryPicker}>
                    {countryCodes.map((country) => (
                      <TouchableOpacity
                        key={country.code}
                        style={styles.countryOption}
                        onPress={() => handleCountrySelect(country)}
                      >
                        <Text style={styles.flag}>{country.flag}</Text>
                        <Text style={styles.countryOptionText}>
                          {country.code} {country.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.phoneInputContainer}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="98765 43210"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="phone-pad"
                    maxLength={15}
                    value={phoneNumber}
                    onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ''))}
                  />
                  {isValidPhone && (
                    <Animated.View
                      style={[
                        styles.validationIcon,
                        { opacity: fadeAnim }
                      ]}
                    >
                      <Text style={styles.checkIcon}>✓</Text>
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* Send OTP Button */}
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    isValidPhone && styles.sendButtonActive
                  ]}
                  onPress={handleSendOTP}
                  disabled={!isValidPhone}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.sendButtonText,
                    isValidPhone && styles.sendButtonTextActive
                  ]}>
                    Send OTP
                  </Text>
                  {isValidPhone && (
                    <Text style={styles.buttonArrow}>→</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Terms and Privacy */}
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </Animated.View>

          {/* Bottom Branding */}
          <Animated.View
            style={[
              styles.bottomBranding,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.brandingText}>
              Powered by{' '}
              <Text style={styles.brandName}>Mandinext</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  backgroundDecorations: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 0,
  },
  decorativeShape: {
    position: 'absolute',
    borderRadius: 999,
  },
  shape1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
    backgroundColor: 'rgba(142, 245, 90, 0.1)',
  },
  shape2: {
    width: 120,
    height: 120,
    bottom: 100,
    left: -30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  shape3: {
    width: 80,
    height: 80,
    top: height * 0.3,
    left: 20,
    backgroundColor: 'rgba(142, 245, 90, 0.08)',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SIZES.padding,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerIcon: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(142, 245, 90, 0.2)',
  },
  flagContainer: {
    width: 32,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  flag: {
    fontSize: 20,
  },
  countryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  chevronIcon: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  countryPicker: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countryOptionText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(142, 245, 90, 0.2)',
    paddingHorizontal: 16,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: 16,
  },
  validationIcon: {
    marginLeft: 12,
  },
  checkIcon: {
    fontSize: 24,
    color: COLORS.success,
  },
  sendButton: {
    backgroundColor: COLORS.disabled,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  sendButtonActive: {
    backgroundColor: COLORS.accent,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  sendButtonTextActive: {
    color: COLORS.white,
  },
  buttonArrow: {
    fontSize: 20,
    marginLeft: 8,
    color: COLORS.white,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  bottomBranding: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  brandingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  brandName: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});