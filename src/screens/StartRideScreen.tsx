import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import Logo from '../components/Logo';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'StartRide'>;

const { width } = Dimensions.get('window');

export default function StartRideScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(50)).current;
  const slideAnim2 = useRef(new Animated.Value(50)).current;
  const scaleAnim1 = useRef(new Animated.Value(0.9)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Staggered animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(slideAnim1, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim1, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(slideAnim2, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim2, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const handleNewRide = () => {
    navigation.navigate('Login', { rideType: 'new' });
  };

  const handleContinueRide = () => {
    navigation.navigate('Login', { rideType: 'continue' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Logo size={50} />
        </View>
        <Text style={styles.welcomeText}>Welcome Back, Driver</Text>
        <Text style={styles.subtitle}>Ready to transport fresh produce?</Text>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.questionContainer,
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim1 }] 
            }
          ]}
        >
          <Text style={styles.questionText}>
            What would you like to do today?
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {/* New Ride Button */}
          <Animated.View
            style={{
              transform: [
                { translateY: slideAnim1 },
                { scale: scaleAnim1 }
              ]
            }}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.newRideButton]}
              onPress={handleNewRide}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.iconContainer, styles.newRideIcon]}>
                  <Text style={styles.buttonIcon}>🚛</Text>
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>Start New Journey</Text>
                  <Text style={styles.buttonSubtitle}>
                    Begin fresh agricultural transport
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Continue Ride Button */}
          <Animated.View
            style={{
              transform: [
                { translateY: slideAnim2 },
                { scale: scaleAnim2 }
              ]
            }}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.continueRideButton]}
              onPress={handleContinueRide}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.iconContainer, styles.continueRideIcon]}>
                  <Text style={styles.buttonIcon}>▶️</Text>
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={[styles.buttonTitle, styles.continueButtonTitle]}>
                    Continue Journey
                  </Text>
                  <Text style={[styles.buttonSubtitle, styles.continueButtonSubtitle]}>
                    Resume existing delivery
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={[styles.arrowIcon, styles.darkArrow]}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Decorative Elements */}
        <Animated.View
          style={[
            styles.decorativeBottom,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.farmPatternContainer}>
            <Text style={styles.farmPattern}>🌾 🚜 🌱 🌾 🚜 🌱</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  questionContainer: {
    marginBottom: 40,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 30,
  },
  buttonsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  newRideButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'rgba(142, 245, 90, 0.3)',
  },
  continueRideButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: 'rgba(33, 74, 80, 0.1)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  newRideIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueRideIcon: {
    backgroundColor: 'rgba(142, 245, 90, 0.1)',
  },
  buttonIcon: {
    fontSize: 28,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  continueButtonTitle: {
    color: COLORS.text,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  continueButtonSubtitle: {
    color: COLORS.textLight,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrowIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  darkArrow: {
    color: COLORS.text,
  },
  decorativeBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  farmPatternContainer: {
    opacity: 0.3,
  },
  farmPattern: {
    fontSize: 24,
    letterSpacing: 8,
    color: COLORS.accent,
  },
});