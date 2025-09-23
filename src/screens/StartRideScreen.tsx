import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'StartRide'>;

const { width, height } = Dimensions.get('window');

export default function StartRideScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleNewRide = () => {
    navigation.navigate('Login', { rideType: 'new' });
  };

  const handleContinueRide = () => {
    navigation.navigate('Login', { rideType: 'continue' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3d72" />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <LinearGradient
          colors={['#1a3d72', '#2a5090', '#3a6bb0']}
          style={styles.headerGradient}
        />
        
        <Animated.View 
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.logoWrapper}>
            <View style={styles.logoContainer}>
              <Logo size={42} />
            </View>
          </View>
          
          <Text style={styles.brandName}>Mandinext</Text>
          <Text style={styles.tagline}>Driver Portal</Text>
          
          <View style={styles.statusIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Online & Ready</Text>
          </View>
        </Animated.View>
      </View>

      {/* Content Section */}
      <ScrollView 
        style={styles.contentSection} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Message */}
        <Animated.View
          style={[
            styles.welcomeContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Ready to start your journey?</Text>
        </Animated.View>

        {/* Action Cards */}
        <Animated.View
          style={[
            styles.actionsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Primary Action - Start New Journey */}
          <TouchableOpacity
            style={styles.primaryCard}
            onPress={handleNewRide}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.primaryCardGradient}
            >
              <View style={styles.cardLayout}>
                <View style={styles.cardIconSection}>
                  <View style={styles.primaryIconContainer}>
                    <Text style={styles.primaryIcon}>🚚</Text>
                  </View>
                </View>
                
                <View style={styles.cardTextSection}>
                  <Text style={styles.primaryTitle}>Start New Journey</Text>
                  <Text style={styles.primarySubtitle}>Begin a fresh delivery route with optimized path planning</Text>
                </View>
                
                <View style={styles.cardActionSection}>
                  <View style={styles.primaryArrowContainer}>
                    <Text style={styles.primaryArrow}>→</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Action - Continue Journey */}
          <TouchableOpacity
            style={styles.secondaryCard}
            onPress={handleContinueRide}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.secondaryCardGradient}
            >
              <View style={styles.cardLayout}>
                <View style={styles.cardIconSection}>
                  <View style={styles.secondaryIconContainer}>
                    <Text style={styles.secondaryIcon}>▶️</Text>
                  </View>
                </View>
                
                <View style={styles.cardTextSection}>
                  <Text style={styles.secondaryTitle}>Continue Journey</Text>
                  <Text style={styles.secondarySubtitle}>Resume your active delivery and track progress</Text>
                </View>
                
                <View style={styles.cardActionSection}>
                  <View style={styles.secondaryArrowContainer}>
                    <Text style={styles.secondaryArrow}>→</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* System Status */}
        <Animated.View
          style={[
            styles.systemStatusContainer,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.systemStatusCard}>
            <LinearGradient
              colors={['#ffffff', '#f1f5f9']}
              style={styles.systemStatusGradient}
            >
              <View style={styles.systemStatusLayout}>
                <View style={styles.systemIconContainer}>
                  <View style={styles.systemIcon}>
                    <Text style={styles.systemEmoji}>⚡</Text>
                  </View>
                </View>
                
                <View style={styles.systemTextContainer}>
                  <Text style={styles.systemTitle}>All Systems Operational</Text>
                  <Text style={styles.systemSubtitle}>GPS • Navigation • Communication</Text>
                </View>
                
                <View style={styles.systemIndicatorContainer}>
                  <View style={styles.systemStatusDot} />
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  // Header Section
  headerSection: {
    height: 260,
    position: 'relative',
  },

  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
  },

  logoWrapper: {
    marginBottom: 20,
  },

  logoContainer: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },

  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },

  statusText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },

  // Content Section
  contentSection: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },

  // Action Cards
  actionsContainer: {
    marginBottom: 32,
  },

  primaryCard: {
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },

  primaryCardGradient: {
    borderRadius: 24,
    padding: 24,
  },

  secondaryCard: {
    borderRadius: 24,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },

  secondaryCardGradient: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  cardLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardIconSection: {
    marginRight: 20,
  },

  primaryIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#dbeafe',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryIcon: {
    fontSize: 32,
  },

  secondaryIcon: {
    fontSize: 28,
  },

  cardTextSection: {
    flex: 1,
  },

  primaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  secondaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  primarySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    lineHeight: 20,
  },

  secondarySubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 20,
  },

  cardActionSection: {
    marginLeft: 16,
  },

  primaryArrowContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryArrowContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryArrow: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  secondaryArrow: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
  },

  // System Status
  systemStatusContainer: {
    marginBottom: 32,
  },

  systemStatusCard: {
    borderRadius: 20,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },

  systemStatusGradient: {
    borderRadius: 20,
    padding: 20,
  },

  systemStatusLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  systemIconContainer: {
    marginRight: 16,
  },

  systemIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fef3c7',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  systemEmoji: {
    fontSize: 24,
  },

  systemTextContainer: {
    flex: 1,
  },

  systemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.2,
  },

  systemSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  systemIndicatorContainer: {
    marginLeft: 12,
  },

  systemStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },

  bottomSpacer: {
    height: 40,
  },
});
