import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { COLORS, SIZES } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const truckSlideAnim = useRef(new Animated.Value(-100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const gridFadeAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations sequence
    Animated.sequence([
      // Logo and truck entrance with staggered timing
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(truckSlideAnim, {
          toValue: 0,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(gridFadeAnim, {
          toValue: 1,
          duration: 1200,
          delay: 400,
          useNativeDriver: true,
        }),
      ]),
      // Brand name and tagline slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous subtle pulse for logo
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

    // Slow rotation for precision agriculture grid
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();

    // Floating animation for tech elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      delay: 600,
      useNativeDriver: false,
    }).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('RideStart');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatingY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Background with agritech colors */}
      <View style={styles.gradientBackground}>
        {/* Precision Agriculture Grid Pattern */}
        <Animated.View 
          style={[
            styles.precisionGrid,
            {
              opacity: gridFadeAnim,
              transform: [{ rotate: spin }]
            }
          ]}
        >
          <View style={styles.gridLines}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={[styles.gridLine, { top: i * 40 }]} />
            ))}
            {[...Array(6)].map((_, i) => (
              <View key={i} style={[styles.gridLineVertical, { left: i * 50 }]} />
            ))}
          </View>
        </Animated.View>

        {/* IoT Sensor Dots */}
        <Animated.View
          style={[
            styles.sensorDots,
            { opacity: fadeAnim }
          ]}
        >
          <Animated.View style={[styles.sensorDot, styles.sensor1, { transform: [{ translateY: floatingY }] }]} />
          <Animated.View style={[styles.sensorDot, styles.sensor2, { transform: [{ translateY: floatingY }] }]} />
          <Animated.View style={[styles.sensorDot, styles.sensor3, { transform: [{ translateY: floatingY }] }]} />
          <Animated.View style={[styles.sensorDot, styles.sensor4, { transform: [{ translateY: floatingY }] }]} />
        </Animated.View>

        {/* Hexagonal Tech Elements */}
        <Animated.View
          style={[
            styles.hexagonContainer,
            { opacity: fadeAnim }
          ]}
        >
          <View style={[styles.hexagon, styles.hex1]} />
          <View style={[styles.hexagon, styles.hex2]} />
          <View style={[styles.hexagon, styles.hex3]} />
        </Animated.View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo Section with precision agriculture styling */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: Animated.multiply(scaleAnim, pulseAnim) }
                ]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Logo size={90} />
              {/* Smart farming pulse rings */}
              <Animated.View
                style={[
                  styles.pulseRing1,
                  {
                    opacity: Animated.multiply(fadeAnim, 0.4),
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.pulseRing2,
                  {
                    opacity: Animated.multiply(fadeAnim, 0.2),
                    transform: [{ scale: Animated.multiply(pulseAnim, 1.3) }]
                  }
                ]}
              />
            </View>
          </Animated.View>

          {/* Smart Truck with IoT visualization */}
          <Animated.View
            style={[
              styles.truckContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: truckSlideAnim }]
              }
            ]}
          >
            <Image 
              source={require('../assets/images/indian_truck.png')}
              style={styles.truckImage}
              resizeMode="contain"
            />
            {/* TEMP: placeholder with modern styling */}
            <View style={[styles.truckImage, styles.truckPlaceholder]}>
              <View style={styles.truckIcon} />
              <Text style={styles.truckLabel}>Smart Logistics</Text>
            </View>
            
            {/* IoT connectivity lines */}
            <Animated.View style={[styles.connectivityLines, { opacity: fadeAnim }]}>
              <View style={[styles.connectionLine, styles.line1]} />
              <View style={[styles.connectionLine, styles.line2]} />
              <View style={[styles.connectionLine, styles.line3]} />
            </Animated.View>
          </Animated.View>

          {/* Modern Brand Section */}
          <Animated.View
            style={[
              styles.brandSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.brandName}>Mandinext</Text>
            <View style={styles.taglineContainer}>
              <View style={styles.taglineDot} />
              <Text style={styles.tagline}>Precision Agriculture</Text>
              <View style={styles.taglineDot} />
              <Text style={styles.tagline}>Smart Logistics</Text>
            </View>
            
            {/* Modern Progress Indicator */}
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
                <View style={styles.progressGlow} />
              </View>
              <Text style={styles.loadingText}>Initializing Smart Systems...</Text>
            </View>
          </Animated.View>

          {/* Data Flow Visualization */}
          <Animated.View
            style={[
              styles.dataFlow,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.dataPoint} />
            <View style={styles.dataConnection} />
            <View style={styles.dataPoint} />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: '#0A1628', // Deep tech navy
    position: 'relative',
  },
  
  // Precision Agriculture Grid
  precisionGrid: {
    position: 'absolute',
    top: height * 0.1,
    right: -100,
    width: 300,
    height: 300,
    opacity: 0.03,
  },
  gridLines: {
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#4CAF50', // Agritech green
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#4CAF50',
  },

  // IoT Sensor Dots
  sensorDots: {
    position: 'absolute',
    width: width,
    height: height,
  },
  sensorDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676', // Bright tech green
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.6,
  },
  sensor1: { top: height * 0.15, left: width * 0.2 },
  sensor2: { top: height * 0.3, right: width * 0.15 },
  sensor3: { bottom: height * 0.35, left: width * 0.1 },
  sensor4: { bottom: height * 0.2, right: width * 0.25 },

  // Hexagonal Tech Elements
  hexagonContainer: {
    position: 'absolute',
    width: width,
    height: height,
  },
  hexagon: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'rgba(33, 150, 243, 0.08)', // Tech blue
    transform: [{ rotate: '30deg' }],
  },
  hex1: { top: height * 0.25, left: width * 0.8 },
  hex2: { top: height * 0.6, left: width * 0.05 },
  hex3: { bottom: height * 0.3, right: width * 0.1 },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  
  logoSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    height: 110,
    backgroundColor: 'rgba(76, 175, 80, 0.08)', // Subtle green background
    borderRadius: 55,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  pulseRing1: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)', // Agritech green pulse
  },
  pulseRing2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)', // Bright green outer pulse
  },

  truckContainer: {
    marginBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  truckImage: {
    width: 160,
    height: 100,
    tintColor: '#4CAF50', // Agritech green tint
  },
  truckPlaceholder: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  truckIcon: {
    width: 40,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    marginBottom: 8,
  },
  truckLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },

  // IoT connectivity visualization
  connectivityLines: {
    position: 'absolute',
    width: 200,
    height: 120,
    top: -10,
  },
  connectionLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(0, 230, 118, 0.4)',
  },
  line1: { width: 60, top: 20, left: -30 },
  line2: { width: 80, top: 50, right: -40 },
  line3: { width: 45, bottom: 20, left: -20 },

  brandSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '300', // Lighter weight for modern look
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    letterSpacing: 0.8,
    marginHorizontal: 8,
  },
  taglineDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4CAF50',
    marginHorizontal: 4,
  },

  progressContainer: {
    alignItems: 'center',
    width: width * 0.65,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50', // Agritech green progress
    borderRadius: 1,
  },
  progressGlow: {
    position: 'absolute',
    top: -1,
    right: 0,
    width: 20,
    height: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
    borderRadius: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
  loadingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
    letterSpacing: 0.5,
  },

  // Data Flow Visualization
  dataFlow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  dataConnection: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(0, 230, 118, 0.3)',
    marginHorizontal: 8,
  },
});
