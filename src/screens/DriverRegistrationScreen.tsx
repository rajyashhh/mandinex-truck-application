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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker'; // Use expo-image-picker
import Logo from '../components/Logo';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverRegistration'>;

const { width, height } = Dimensions.get('window');

interface VehiclePermitFile {
  uri: string;
  name: string;
  type: string;
}

export default function DriverRegistrationScreen({ navigation, route }: Props) {
  const [driverName, setDriverName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehiclePermitFile, setVehiclePermitFile] = useState<VehiclePermitFile | null>(null);
  const [isAllFieldsValid, setIsAllFieldsValid] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const scrollViewRef = useRef<ScrollView>(null);
  const { phone } = route.params;

  useEffect(() => {
    // Request permissions on component mount
    requestPermissions();

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

    // Pulse animation for success elements
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
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: height * 0.3,
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
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      // Request media library permissions
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // Request camera permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library permissions are required to upload vehicle permits.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  useEffect(() => {
    // Validate all fields
    const nameValid = driverName.trim().length >= 2;
    const licenseValid = licenseNumber.trim().length >= 8;
    const permitValid = vehiclePermitFile !== null;
    
    setIsAllFieldsValid(nameValid && licenseValid && permitValid);
  }, [driverName, licenseNumber, vehiclePermitFile]);

  const selectVehiclePermitImage = () => {
    Alert.alert(
      'Upload Vehicle Permit',
      'Choose how you want to upload your vehicle permit document',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
  
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]; // ✅ FIX: Add [0] to get the first asset
        setVehiclePermitFile({
          uri: asset.uri,
          name: `permit_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
      console.error('Camera error:', error);
    }
  };
  
  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
setVehiclePermitFile({
  uri: asset.uri,
  name: asset.fileName || `permit_${Date.now()}.jpg`,
  type: 'image/jpeg',
});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
      console.error('Gallery error:', error);
    }
  };

// In DriverRegistrationScreen.tsx - handleContinue function
const handleContinue = () => {
    if (!isAllFieldsValid) {
      Alert.alert('Incomplete Information', 'Please fill all the required fields correctly');
      return;
    }
  
    // Navigate to Dashboard with driver name
    navigation.navigate('Dashboard', { 
      driverName: driverName.trim(),
      phone,
      license: licenseNumber,
      permitFile: vehiclePermitFile
    });
  };
  

  // Rest of your component JSX remains the same...
  return (
    <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <View style={styles.logoIcon}>
                <Logo size={35} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to Mandinext!</Text>
              <Text style={styles.subtitle}>
                Complete your profile to start your agricultural logistics journey
              </Text>
            </Animated.View>

            {/* Registration Form */}
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
                  <Text style={styles.formTitle}>Driver Information</Text>
                  <Text style={styles.formSubtitle}>
                    Please provide your details to complete registration
                  </Text>
                </View>

                {/* Driver Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>👤</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your full name"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={driverName}
                      onChangeText={setDriverName}
                      autoCapitalize="words"
                    />
                    {driverName.trim().length >= 2 && (
                      <View style={styles.validIcon}>
                        <Logo size={16} />
                      </View>
                    )}
                  </View>
                </View>

                {/* License Number Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>License Number</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>🪪</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter driving license number"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={licenseNumber}
                      onChangeText={(text) => setLicenseNumber(text.toUpperCase())}
                      autoCapitalize="characters"
                    />
                    {licenseNumber.trim().length >= 8 && (
                      <View style={styles.validIcon}>
                        <Logo size={16} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Vehicle Permit Upload */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vehicle Permit</Text>
                  <TouchableOpacity
                    style={styles.fileUploadContainer}
                    onPress={selectVehiclePermitImage}
                    activeOpacity={0.8}
                  >
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>📄</Text>
                    </View>
                    <View style={styles.fileUploadTextContainer}>
                      {vehiclePermitFile ? (
                        <View style={styles.fileSelectedContainer}>
                          <Text style={styles.fileSelectedText}>
                            {vehiclePermitFile.name}
                          </Text>
                          <Text style={styles.fileSelectedSubtext}>
                            Tap to change
                          </Text>
                        </View>
                      ) : (
                        <View>
                          <Text style={styles.fileUploadText}>
                            Upload Vehicle Permit
                          </Text>
                          <Text style={styles.fileUploadSubtext}>
                            Tap to take photo or select from gallery
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.uploadActionContainer}>
                      {vehiclePermitFile ? (
                        <View style={styles.validIcon}>
                          <Logo size={16} />
                        </View>
                      ) : (
                        <View style={styles.uploadIcon}>
                          <Text style={styles.uploadIconText}>📷</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {/* Show preview if file is selected */}
                  {vehiclePermitFile && (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: vehiclePermitFile.uri }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setVehiclePermitFile(null)}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Progress Indicator */}
                <View style={styles.progressSection}>
                  <View style={styles.progressContainer}>
                    <View style={[
                      styles.progressStep,
                      (driverName.trim().length >= 2) && styles.progressStepComplete
                    ]}>
                      <Text style={styles.progressStepNumber}>1</Text>
                    </View>
                    <View style={[
                      styles.progressLine,
                      (licenseNumber.trim().length >= 8) && styles.progressLineComplete
                    ]} />
                    <View style={[
                      styles.progressStep,
                      (licenseNumber.trim().length >= 8) && styles.progressStepComplete
                    ]}>
                      <Text style={styles.progressStepNumber}>2</Text>
                    </View>
                    <View style={[
                      styles.progressLine,
                      vehiclePermitFile && styles.progressLineComplete
                    ]} />
                    <View style={[
                      styles.progressStep,
                      vehiclePermitFile && styles.progressStepComplete
                    ]}>
                      <Text style={styles.progressStepNumber}>3</Text>
                    </View>
                  </View>
                  <Text style={styles.progressText}>
                    {isAllFieldsValid ? 'Ready to continue!' : 'Complete all fields to proceed'}
                  </Text>
                </View>

                {/* Continue Button */}
                <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                  <TouchableOpacity
                    style={[
                      styles.continueButton,
                      isAllFieldsValid && styles.continueButtonActive
                    ]}
                    onPress={handleContinue}
                    disabled={!isAllFieldsValid}
                    activeOpacity={0.9}
                  >
                    <Text style={[
                      styles.continueButtonText,
                      isAllFieldsValid && styles.continueButtonTextActive
                    ]}>
                      Complete Registration
                    </Text>
                    {isAllFieldsValid && (
                      <View style={styles.buttonIconContainer}>
                        <Text style={styles.buttonIcon}>🚛</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>

            {/* Security Notice */}
            <Animated.View
              style={[
                styles.securitySection,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.securityInfo}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>
                  Your information is encrypted and secure
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Your existing styles remain the same...






const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1E2B',
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

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoIcon: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form Section
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

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputIcon: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  validIcon: {
    marginLeft: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // File Upload Container
  fileUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  fileUploadTextContainer: {
    flex: 1,
  },
  fileUploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fileUploadSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  fileSelectedContainer: {
    flex: 1,
  },
  fileSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  fileSelectedSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  uploadActionContainer: {
    marginLeft: 12,
  },
  uploadIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconText: {
    fontSize: 18,
  },

  // Image Preview
  imagePreviewContainer: {
    marginTop: 12,
    position: 'relative',
    alignSelf: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Progress Section
  progressSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressStepComplete: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  progressStepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  progressLineComplete: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },

  // Continue Button
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonIconContainer: {
    marginLeft: 8,
  },
  buttonIcon: {
    fontSize: 16,
  },

  // Security Section
  securitySection: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
