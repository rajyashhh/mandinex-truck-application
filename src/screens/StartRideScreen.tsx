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

const { width, height } = Dimensions.get('window');

export default function StartRideScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(50)).current;
  const slideAnim2 = useRef(new Animated.Value(50)).current;
  const scaleAnim1 = useRef(new Animated.Value(0.95)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smooth entrance animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(slideAnim1, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim1, {
            toValue: 1,
            tension: 80,
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
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // Subtle pulse for logo
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
  }, []);

  const handleNewRide = () => {
    navigation.navigate('Login', { rideType: 'new' });
  };

  const handleContinueRide = () => {
    navigation.navigate('Login', { rideType: 'continue' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Agritech Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />
        <View style={styles.fieldLines}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={[styles.fieldLine, { top: i * 60 }]} />
          ))}
        </View>
      </View>

      {/* Header Section */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Logo size={60} />
        </View>
        <Text style={styles.brandName}>Mandinext</Text>
        <Text style={styles.welcomeText}>Welcome Back, Driver!</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Ready for Transport</Text>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.questionSection,
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim1 }] 
            }
          ]}
        >
          <Text style={styles.questionText}>What's Your Plan Today?</Text>
        </Animated.View>

        {/* Action Cards */}
        <View style={styles.cardsContainer}>
          {/* New Ride Card */}
          <Animated.View
            style={{
              transform: [
                { translateY: slideAnim1 },
                { scale: scaleAnim1 }
              ]
            }}
          >
            <TouchableOpacity
              style={[styles.actionCard, styles.newRideCard]}
              onPress={handleNewRide}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconSection}>
                <View style={styles.newRideIconBg}>
                  <Text style={styles.cardIcon}>🚛</Text>
                </View>
              </View>
              <View style={styles.cardTextSection}>
                <Text style={styles.cardTitle}>Start New Journey</Text>
                <Text style={styles.cardDescription}>
                  Begin fresh agricultural delivery
                </Text>
                <View style={styles.cardFeatures}>
                  <Text style={styles.featureTag}>• Route Planning</Text>
                  <Text style={styles.featureTag}>• Live GPS</Text>
                </View>
              </View>
              <View style={styles.cardArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Continue Ride Card */}
          <Animated.View
            style={{
              transform: [
                { translateY: slideAnim2 },
                { scale: scaleAnim2 }
              ]
            }}
          >
            <TouchableOpacity
              style={[styles.actionCard, styles.continueRideCard]}
              onPress={handleContinueRide}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconSection}>
                <View style={styles.continueRideIconBg}>
                  <Text style={styles.cardIcon}>▶️</Text>
                </View>
              </View>
              <View style={styles.cardTextSection}>
                <Text style={[styles.cardTitle, styles.continueTitle]}>
                  Continue Journey
                </Text>
                <Text style={[styles.cardDescription, styles.continueDescription]}>
                  Resume your active delivery
                </Text>
                <View style={styles.cardFeatures}>
                  <Text style={[styles.featureTag, styles.continueFeature]}>
                    • Track Progress
                  </Text>
                  <Text style={[styles.featureTag, styles.continueFeature]}>
                    • Update Status
                  </Text>
                </View>
              </View>
              <View style={styles.cardArrow}>
                <Text style={[styles.arrowText, styles.continueArrow]}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Info */}
        <Animated.View
          style={[
            styles.bottomInfo,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Today's Weather:</Text>
            <Text style={styles.infoValue}>Perfect for Transport 🌤️</Text>
          </View>
          <View style={styles.trustBadges}>
            <View style={styles.trustItem}>
              <Text style={styles.trustNumber}>24/7</Text>
              <Text style={styles.trustLabel}>Support</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Text style={styles.trustNumber}>Secure</Text>
              <Text style={styles.trustLabel}>Transport</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Text style={styles.trustNumber}>Real-time</Text>
              <Text style={styles.trustLabel}>Updates</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1E2B', // Deep agritech blue-green
  },
  
  // Background Pattern
  backgroundPattern: {
    position: 'absolute',
    width: width,
    height: height,
  },
  topCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -80,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  bottomCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: -50,
    left: -60,
    backgroundColor: 'rgba(33, 150, 243, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.12)',
  },
  fieldLines: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.03,
  },
  fieldLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#4CAF50',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Cards
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  newRideCard: {
    backgroundColor: '#4CAF50', // Agritech green
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueRideCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Semi-transparent white
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardIconSection: {
    marginRight: 16,
  },
  newRideIconBg: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueRideIconBg: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTextSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  continueTitle: {
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 18,
  },
  continueDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 12,
    fontWeight: '500',
  },
  continueFeature: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  cardArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  continueArrow: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Bottom Info
  bottomInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  trustBadges: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.25)',
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 2,
  },
  trustLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  trustDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
});
