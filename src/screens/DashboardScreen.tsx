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
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: Props) {
  const [tripOTP, setTripOTP] = useState('');
  const [isTripStarted, setIsTripStarted] = useState(false);
  const [isOTPValid, setIsOTPValid] = useState(false);
  const [tripProgress, setTripProgress] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('Delhi, India');
  const [destination, setDestination] = useState('Mumbai, Maharashtra');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sosAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse for active elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

    // SOS button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sosAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Validate OTP (simple 4-digit validation)
    const isValid = tripOTP.length === 4 && /^\d+$/.test(tripOTP);
    setIsOTPValid(isValid);
  }, [tripOTP]);

  useEffect(() => {
    if (isTripStarted) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: tripProgress / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [tripProgress, isTripStarted]);

  const handleStartTrip = () => {
    if (!isOTPValid) {
      Alert.alert('Invalid OTP', 'Please enter a valid 4-digit OTP to start your trip');
      return;
    }

    // Simulate OTP verification
    if (tripOTP === '1234') { // Demo OTP
      setIsTripStarted(true);
      setTripProgress(25); // Start with 25% progress
      Alert.alert('Trip Started!', 'Your agricultural logistics journey has begun. Drive safely!');
    } else {
      Alert.alert('Incorrect OTP', 'Please enter the correct OTP provided by your logistics coordinator');
    }
  };

  const handlePoliceCheckings = () => {
    Alert.alert('Police Checkings', 'Nearby police checkpoints:\n• NH-8 Toll Plaza - 5km ahead\n• Gurgaon Border - 12km\n• Faridabad Checkpoint - 18km');
  };

  const handleRechargeFastag = () => {
    Alert.alert('FASTag Recharge', 'Current Balance: ₹450\nRecharge options:\n• ₹500\n• ₹1000\n• ₹2000\nChoose amount to proceed');
  };

  const handleFuelStations = () => {
    Alert.alert('Fuel Stations', 'Nearby fuel stations:\n• Indian Oil - 3km (₹96.2/L)\n• Bharat Petroleum - 7km (₹96.5/L)\n• Shell - 12km (₹97.1/L)');
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'Are you in an emergency situation? This will alert authorities and your logistics coordinator.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'YES, EMERGENCY!', 
          style: 'destructive',
          onPress: () => Alert.alert('SOS Activated', 'Emergency services and your coordinator have been notified. Help is on the way.')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1E2B" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Logo size={30} />
            </View>
            <View>
              <Text style={styles.welcomeText}>Namaste, Driver</Text>
              <Text style={styles.truckInfo}>MH-12-AB-1234</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </Animated.View>

        {/* Trip OTP Section */}
        {!isTripStarted && (
          <Animated.View
            style={[
              styles.otpSection,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.otpCard}>
              <View style={styles.otpHeader}>
                <Text style={styles.otpIcon}>🔑</Text>
                <Text style={styles.otpTitle}>Enter Trip OTP</Text>
              </View>
              <Text style={styles.otpSubtitle}>
                Enter the 4-digit OTP provided by your logistics coordinator
              </Text>
              
              <View style={styles.otpInputContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="0000"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={tripOTP}
                  onChangeText={setTripOTP}
                  textAlign="center"
                />
                {isOTPValid && (
                  <View style={styles.otpValidIcon}>
                    <Logo size={20} />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.startTripButton,
                  isOTPValid && styles.startTripButtonActive
                ]}
                onPress={handleStartTrip}
                disabled={!isOTPValid}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.startTripButtonText,
                  isOTPValid && styles.startTripButtonTextActive
                ]}>
                  Start Trip
                </Text>
                {isOTPValid && (
                  <Text style={styles.startTripIcon}>🚛</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Trip Progress Section */}
        {isTripStarted && (
          <Animated.View
            style={[
              styles.tripSection,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripIcon}>🚚</Text>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripTitle}>Trip in Progress</Text>
                  <Text style={styles.tripRoute}>
                    {currentLocation} → {destination}
                  </Text>
                </View>
                <Text style={styles.tripPercentage}>{tripProgress}%</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.tripStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>247</Text>
                  <Text style={styles.statLabel}>km left</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>4h 30m</Text>
                  <Text style={styles.statLabel}>ETA</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>65</Text>
                  <Text style={styles.statLabel}>km/h avg</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.actionsSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {/* Police Checkings */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handlePoliceCheckings}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>👮‍♂️</Text>
              </View>
              <Text style={styles.actionTitle}>Police</Text>
              <Text style={styles.actionSubtitle}>Checkpoints</Text>
            </TouchableOpacity>

            {/* FASTag Recharge */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleRechargeFastag}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>💳</Text>
              </View>
              <Text style={styles.actionTitle}>FASTag</Text>
              <Text style={styles.actionSubtitle}>Recharge</Text>
            </TouchableOpacity>

            {/* Fuel Stations */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleFuelStations}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>⛽</Text>
              </View>
              <Text style={styles.actionTitle}>Fuel</Text>
              <Text style={styles.actionSubtitle}>Stations</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Indian Truck Features */}
        <Animated.View
          style={[
            styles.indianSection,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.indianCard}>
            <Text style={styles.indianHeader}>🕉️ यात्रा सुरक्षित रहे 🕉️</Text>
            <View style={styles.indianStats}>
              <View style={styles.indianStatItem}>
                <Text style={styles.indianStatIcon}>🌡️</Text>
                <Text style={styles.indianStatText}>32°C</Text>
                <Text style={styles.indianStatLabel}>Weather</Text>
              </View>
              <View style={styles.indianStatItem}>
                <Text style={styles.indianStatIcon}>💰</Text>
                <Text style={styles.indianStatText}>₹450</Text>
                <Text style={styles.indianStatLabel}>FASTag</Text>
              </View>
              <View style={styles.indianStatItem}>
                <Text style={styles.indianStatIcon}>🛣️</Text>
                <Text style={styles.indianStatText}>NH-8</Text>
                <Text style={styles.indianStatLabel}>Highway</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Emergency SOS Button */}
        <Animated.View
          style={[
            styles.sosSection,
            { 
              opacity: fadeAnim,
              transform: [{ scale: sosAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.sosButton}
            onPress={handleSOS}
            activeOpacity={0.8}
          >
            <Text style={styles.sosIcon}>🚨</Text>
            <Text style={styles.sosText}>EMERGENCY SOS</Text>
            <Text style={styles.sosSubtext}>Press for immediate help</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Safe Area */}
        <View style={styles.bottomSafeArea} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1E2B',
  },
  scrollContent: {
    paddingBottom: 20,
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
    width: 300,
    height: 300,
    top: -100,
    right: -80,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 200,
    left: -60,
    backgroundColor: 'rgba(255, 193, 7, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.08)',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  truckInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },

  // OTP Section
  otpSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  otpCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    lineHeight: 20,
  },
  otpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  otpInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingVertical: 16,
    letterSpacing: 8,
  },
  otpValidIcon: {
    marginLeft: 12,
  },
  startTripButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  startTripButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  startTripButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  startTripButtonTextActive: {
    color: '#FFFFFF',
  },
  startTripIcon: {
    fontSize: 18,
    marginLeft: 8,
  },

  // Trip Progress Section
  tripSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tripRoute: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  tripPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },

  // Indian Section
  indianSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  indianCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  indianHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC107',
    textAlign: 'center',
    marginBottom: 12,
  },
  indianStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  indianStatItem: {
    alignItems: 'center',
  },
  indianStatIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  indianStatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  indianStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },

  // SOS Section
  sosSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sosButton: {
    backgroundColor: '#E53935',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5252',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sosIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  sosText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sosSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  bottomSafeArea: {
    height: 20,
  },
});
