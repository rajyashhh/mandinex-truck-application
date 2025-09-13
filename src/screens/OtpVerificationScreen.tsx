import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerification'>;

const { width, height } = Dimensions.get('window');

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Input refs
  const inputRefs = useRef<TextInput[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const { phone, rideType } = route.params;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Keyboard event listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to OTP section when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: 150,
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

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const otpString = otp.join('');
    setIsComplete(otpString.length === 6);
  }, [otp]);

  const handleOTPChange = (value: string, index: number) => {
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (!isComplete) {
      Alert.alert('Incomplete OTP', 'Please enter the complete 6-digit OTP');
      return;
    }
  
    // Button animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  
    // Simulate OTP verification
    const otpString = otp.join('');
    console.log('Verifying OTP:', otpString, 'for phone:', phone);
    
    // Navigate based on ride type
    if (rideType === 'new') {
      // New driver - go to registration screen
      navigation.navigate('DriverRegistration', { phone });
    } else {
      // Continuing driver - go directly to dashboard
      navigation.navigate('Dashboard');
    }
  };
  

  const handleResendOTP = () => {
    if (!canResend) return;
    
    setTimer(30);
    setCanResend(false);
    setOTP(['', '', '', '', '', '']);
    
    // Reset timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    Alert.alert('OTP Sent', 'New verification code sent to your mobile number');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingBottom: Math.max(keyboardHeight, 20) }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <View style={styles.phoneIcon}>
                  <Text style={styles.phoneEmoji}>📱</Text>
                </View>
                <Text style={styles.headerTitle}>Verify Mobile Number</Text>
                <Text style={styles.headerSubtitle}>
                  Enter the 6-digit code sent to
                </Text>
                <Text style={styles.phoneNumber}>{phone}</Text>
              </View>
            </Animated.View>

            {/* OTP Input Section */}
            <Animated.View
              style={[
                styles.otpSection,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.otpLabel}>Enter Verification Code</Text>
              
              {/* OTP Container with better positioning */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      index === 0 && { marginLeft: 0 }
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                    onFocus={() => {
                      // Scroll to ensure input is visible when focused
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({
                          y: 120,
                          animated: true,
                        });
                      }, 100);
                    }}
                  />
                ))}
              </View>

              {/* Display current OTP for user reference */}
              <View style={styles.otpPreview}>
                <Text style={styles.otpPreviewLabel}>Current Code:</Text>
                <Text style={styles.otpPreviewText}>
                  {otp.join('') || '------'}
                </Text>
              </View>

              {/* Timer & Resend */}
              <View style={styles.timerSection}>
                {!canResend ? (
                  <Text style={styles.timerText}>
                    Resend code in {timer}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendButton}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            {/* Verify Button - Always visible */}
            <Animated.View
              style={[
                styles.buttonSection,
                { 
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  isComplete && styles.verifyButtonActive
                ]}
                onPress={handleVerify}
                disabled={!isComplete}
                activeOpacity={0.9}
              >
                <Text style={[
                  styles.verifyButtonText,
                  isComplete && styles.verifyButtonTextActive
                ]}>
                  Verify & Continue
                </Text>
                {isComplete && (
                  <Text style={styles.verifyIcon}>✓</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Security Info */}
            <View style={styles.securitySection}>
              <View style={styles.securityInfo}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>
                  Your information is secure and encrypted
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1E2B',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Header (reduced padding to save space)
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
  },
  phoneIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  phoneEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },

  // OTP Section (optimized for keyboard visibility)
  otpSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  otpInput: {
    width: 42,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  otpInputFilled: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  
  // OTP Preview - Shows current entered digits
  otpPreview: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpPreviewLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  otpPreviewText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  
  timerSection: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  resendButton: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },

  // Button Section (always visible)
  buttonSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  verifyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  verifyButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  verifyButtonTextActive: {
    color: '#FFFFFF',
  },
  verifyIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },

  // Security Section (compact)
  securitySection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  securityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  securityText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
});
