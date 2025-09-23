// src/screens/PorterDriverScreen.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
  Linking,
  ScrollView,
  Platform,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PorterDriverScreen({ route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current; 
  const sosAnim = useRef(new Animated.Value(1)).current;
  const serviceCardsAnim = useRef(new Animated.Value(0)).current;
  
  const wave1Anim = useRef(new Animated.Value(1)).current;
  const wave2Anim = useRef(new Animated.Value(1)).current;
  const wave3Anim = useRef(new Animated.Value(1)).current;

  const driverName = route?.params?.driverName || "Driver";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(serviceCardsAnim, { 
        toValue: 1, 
        tension: 50, 
        friction: 8, 
        useNativeDriver: true 
      }),
    ]).start();

    const sosLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(sosAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    sosLoop.start();

    const wave1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave1Anim, { toValue: 1.4, duration: 2200, useNativeDriver: true }),
        Animated.timing(wave1Anim, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ])
    );

    const wave2Loop = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(wave2Anim, { toValue: 1.6, duration: 2600, useNativeDriver: true }),
        Animated.timing(wave2Anim, { toValue: 1, duration: 2600, useNativeDriver: true }),
      ])
    );

    const wave3Loop = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(wave3Anim, { toValue: 1.8, duration: 3000, useNativeDriver: true }),
        Animated.timing(wave3Anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ])
    );

    wave1Loop.start();
    wave2Loop.start();
    wave3Loop.start();

    return () => {
      sosLoop.stop();
      wave1Loop.stop();
      wave2Loop.stop();
      wave3Loop.stop();
    };
  }, []);

  const orderData = {
    buyerName: "Rajesh Kumar",
    buyerPhone: "+919876543210",
    currentCity: "Mandideep, MP",
    destinationCity: "Azadpur Mandi, Delhi",
    estimatedTime: "4h 32m",
    distance: "243 km",
  };

  const services = [
    {
      title: "FASTag",
      subtitle: "₹1,250",
      icon: "🛣️",
      gradientColors: ['#10b981', '#047857'],
      overlayColor: 'rgba(16, 185, 129, 0.9)',
      backgroundImage: require("../assets/icons/fastag.png"),
    },
    {
      title: "Petrol Pumps", 
      subtitle: "₹96.2/L",
      icon: "⛽",
      gradientColors: ['#f59e0b', '#b45309'],
      overlayColor: 'rgba(245, 158, 11, 0.9)',
      backgroundImage: require("../assets/icons/pump.png"),
    },
    {
      title: "Dhaba",
      subtitle: "Near you",
      icon: "🍽️",
      gradientColors: ['#8b5cf6', '#6d28d9'],
      overlayColor: 'rgba(139, 92, 246, 0.9)',
      backgroundImage: require("../assets/icons/dhaba.jpg"),
    },
    {
      title: "Mechanics",
      subtitle: "24/7 Help", 
      icon: "🔧",
      gradientColors: ['#3b82f6', '#1d4ed8'],
      overlayColor: 'rgba(59, 130, 246, 0.9)',
      backgroundImage: require("../assets/icons/mechanic.png"),
    },
  ];

  const handleServicePress = (service: string) => {
    Alert.alert('Service Selected', `You selected ${service}`);
  };

  const handleCallBuyer = () => {
    Alert.alert(
      "Call Buyer",
      `Do you want to call ${orderData.buyerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Now",
          onPress: () => {
            const phoneUrl = `tel:${orderData.buyerPhone}`;
            Linking.canOpenURL(phoneUrl)
              .then((supported) => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert("Error", "Phone call not supported on this device");
                }
              })
              .catch(err => console.error("Error opening phone app:", err));
          },
        },
      ]
    );
  };

  const handleSOS = () =>
    Alert.alert(
      "Emergency SOS",
      "Send alert to Support, Police, and your Fleet Manager?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "ACTIVATE",
          style: "destructive",
          onPress: () => Alert.alert("SOS Activated", "Help alert sent successfully."),
        },
      ]
    );

  const waveAnimatedStyle = (anim: Animated.Value, size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    transform: [{ scale: anim }],
    opacity: anim.interpolate({
      inputRange: [1, 1.4, 1.8],
      outputRange: [0, 0.4, 0],
      extrapolate: 'clamp'
    }),
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3d72" />

      {/* Enhanced Header Background */}
      <LinearGradient 
        colors={['#1a3d72', '#2a5090', '#4285f4']} 
        style={styles.headerBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Enhanced Greeting */}
      <Animated.View 
        style={[
          styles.greetingContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text style={styles.greetingText}>🙏 Namaste, {driverName}</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 120 : 100 }}
      >
        {/* Enhanced Order Info Card */}
        <Animated.View 
          style={[
            styles.orderInfoCard, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.orderCardGradient}
          >
            <View style={styles.orderHeader}>
              <View style={styles.buyerInfo}>
                <Text style={styles.orderLabel}>Order For:</Text>
                <Text style={styles.buyerName}>{orderData.buyerName}</Text>
              </View>

              <TouchableOpacity style={styles.callButton} onPress={handleCallBuyer}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.callButtonGradient}
                >
                  <Text style={styles.callIcon}>📞</Text>
                  <Text style={styles.callText}>Call</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.routeInfo}>
              <View style={styles.locationRow}>
                <View style={styles.locationIconContainer}>
                  <Text style={styles.locationIcon}>📍</Text>
                </View>
                <View style={styles.locationDetails}>
                  <Text style={styles.currentLocation}>Current: {orderData.currentCity}</Text>
                  <Text style={styles.destination}>Destination: {orderData.destinationCity}</Text>
                </View>
              </View>

              <View style={styles.timeInfo}>
                <Text style={styles.eta}>{orderData.estimatedTime}</Text>
                <Text style={styles.distance}>{orderData.distance}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Beautiful Enhanced Services Grid */}
        <Animated.View
          style={[
            styles.servicesGrid,
            { 
              opacity: fadeAnim,
              transform: [{ scale: serviceCardsAnim }, { translateY: slideAnim }]
            }
          ]}
        >
          {services.map((service, index) => (
            <Animated.View
              key={service.title}
              style={[
                styles.serviceCardContainer,
                {
                  transform: [{
                    translateY: serviceCardsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 * (index + 1), 0],
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.beautifulServiceCard}
                onPress={() => handleServicePress(service.title)}
                activeOpacity={0.85}
              >
                {/* Background Image */}
                <ImageBackground
                  source={service.backgroundImage}
                  style={styles.serviceBackgroundImage}
                  imageStyle={styles.backgroundImageStyle}
                >
                  {/* Gradient Overlay */}
                  <LinearGradient
                    colors={service.gradientColors}
                    style={styles.serviceOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Content Container */}
                    <View style={styles.serviceCardContent}>
                      {/* Icon in top right */}
                      <View style={styles.serviceIconContainer}>
                        <Text style={styles.serviceEmoji}>{service.icon}</Text>
                      </View>
                      
                      {/* Text content */}
                      <View style={styles.serviceTextContainer}>
                        <Text style={styles.beautifulServiceTitle}>{service.title}</Text>
                        <Text style={styles.beautifulServiceSubtitle}>{service.subtitle}</Text>
                      </View>

                      {/* Decorative elements */}
                      <View style={styles.serviceDecoration}>
                        <View style={styles.decorativeCircle1} />
                        <View style={styles.decorativeCircle2} />
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Enhanced SOS Button with Waves */}
        <View style={styles.sosMainContainer}>
          <View style={styles.sosWaveWrapper} pointerEvents="none">
            <Animated.View style={[styles.sosWave, styles.sosWave3, waveAnimatedStyle(wave3Anim, 380)]}>
              <LinearGradient 
                colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']} 
                style={styles.waveGradientFill} 
              />
            </Animated.View>

            <Animated.View style={[styles.sosWave, styles.sosWave2, waveAnimatedStyle(wave2Anim, 320)]}>
              <LinearGradient 
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.08)']} 
                style={styles.waveGradientFill} 
              />
            </Animated.View>

            <Animated.View style={[styles.sosWave, styles.sosWave1, waveAnimatedStyle(wave1Anim, 260)]}>
              <LinearGradient 
                colors={['rgba(239, 68, 68, 0.25)', 'rgba(239, 68, 68, 0.12)']} 
                style={styles.waveGradientFill} 
              />
            </Animated.View>
          </View>

          <Animated.View style={[styles.sosButtonWrapper, { transform: [{ scale: sosAnim }] }]}>
            <TouchableOpacity style={styles.sosButton} activeOpacity={0.85} onPress={handleSOS}>
              <LinearGradient 
                colors={['#ef4444', '#dc2626', '#b91c1c']} 
                style={styles.sosButtonGradient}
              >
                <View style={styles.sosIconContainer}>
                  <Text style={styles.sosIcon}>🚨</Text>
                  <Text style={styles.sosMainText}>SOS</Text>
                </View>
                <Text style={styles.sosText}>EMERGENCY SOS</Text>
                <Text style={styles.sosDescription}>Tap if you need help</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Enhanced Announcements Section */}
        <Animated.View
          style={[
            styles.announcementsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.announcementsTitle}>📢 Announcements</Text>

          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.announcementCard}
          >
            <View style={styles.announcementIcon}>
              <View style={styles.megaphoneContainer}>
                <Text style={styles.megaphoneEmoji}>📢</Text>
              </View>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeNumber}>3</Text>
              </View>
            </View>

            <View style={styles.announcementContent}>
              <Text style={styles.announcementText}>Safety Ki Shart Lagi!</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View all →</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </Animated.View>

        {/* Location Tracking Status */}
        <Animated.View
          style={[
            styles.trackingStatusContainer,
            { opacity: fadeAnim }
          ]}
        >
          <LinearGradient
            colors={['#1e293b', '#334155']}
            style={styles.trackingStatusCard}
          >
            <View style={styles.trackingContent}>
              <View style={styles.trackingIconContainer}>
                <Text style={styles.trackingIcon}>📍</Text>
              </View>
              <Text style={styles.trackingText}>Location tracking active</Text>
              <View style={styles.trackingDot} />
            </View>
          </LinearGradient>
        </Animated.View>

      </ScrollView>

      {/* Enhanced Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.bottomNavigation}
        >
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.activeNavIconContainer}>
              <Text style={styles.navIconActive}>🏠</Text>
            </View>
            <Text style={styles.navLabelActive}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🕐</Text>
            <Text style={styles.navLabel}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🪙</Text>
            <Text style={styles.navLabel}>Coins</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>💳</Text>
            <Text style={styles.navLabel}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navLabel}>Account</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f1f5f9' 
  },

  // Enhanced Header
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#1a3d72',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },

  greetingContainer: {
    paddingHorizontal: 24,
    paddingTop: 20, 
    paddingBottom: 12,
    zIndex: 12,
  },
  
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  scrollView: { 
    flex: 1, 
    paddingTop: 8 
  },

  // Enhanced Order Card
  orderInfoCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },

  orderCardGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  orderHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  
  buyerInfo: { flex: 1 },
  orderLabel: { 
    fontSize: 14, 
    color: '#64748b', 
    fontWeight: '600', 
    marginBottom: 6 
  },
  
  buyerName: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  
  callButton: { 
    borderRadius: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  callButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  
  callIcon: { fontSize: 18, marginRight: 8 },
  callText: { 
    color: 'white', 
    fontWeight: '700', 
    fontSize: 16,
    letterSpacing: 0.2,
  },

  routeInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    flex: 1 
  },

  locationIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  
  locationIcon: { fontSize: 16 },
  locationDetails: { flex: 1 },
  currentLocation: { 
    fontSize: 16, 
    color: '#10b981', 
    fontWeight: '700', 
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  
  destination: { 
    fontSize: 15, 
    color: '#64748b', 
    fontWeight: '600',
    lineHeight: 22,
  },
  
  timeInfo: { 
    alignItems: 'flex-end', 
    marginLeft: 16 
  },
  
  eta: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1e293b', 
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  
  distance: { 
    fontSize: 14, 
    color: '#64748b', 
    fontWeight: '600' 
  },

  // Beautiful Enhanced Services Grid
  servicesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 20, 
    paddingTop: 24, 
    justifyContent: 'space-between', 
    zIndex: 10 
  },

  serviceCardContainer: {
    width: (width - 52) / 2,
    marginBottom: 16,
  },

  beautifulServiceCard: { 
    width: '100%',
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },

  serviceBackgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backgroundImageStyle: {
    borderRadius: 20,
    opacity: 0.3,
  },

  serviceOverlay: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },

  serviceCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },

  serviceIconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  serviceEmoji: {
    fontSize: 20,
  },

  serviceTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 60,
  },

  beautifulServiceTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  beautifulServiceSubtitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  serviceDecoration: {
    position: 'absolute',
    top: -10,
    left: -10,
    zIndex: -1,
  },

  decorativeCircle1: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
  },

  decorativeCircle2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'absolute',
    top: 20,
    left: 20,
  },

  // Enhanced SOS Section
  sosMainContainer: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },

  sosWaveWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },

  sosWave: { 
    position: 'absolute', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  sosWave1: { width: 260, height: 260 },
  sosWave2: { width: 320, height: 320 },
  sosWave3: { width: 380, height: 380 },

  waveGradientFill: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 999 
  },

  sosButtonWrapper: { 
    position: 'relative', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 10 
  },

  sosButton: { 
    width: 180, 
    height: 180, 
    borderRadius: 90,
  },

  sosButtonGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 20,
  },

  sosIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },

  sosIcon: { 
    fontSize: 40, 
    marginBottom: 4 
  },

  sosMainText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },

  sosText: { 
    fontWeight: '700', 
    fontSize: 14, 
    color: '#ffffff', 
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  sosDescription: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: 'rgba(255, 255, 255, 0.9)', 
    opacity: 0.95,
    textAlign: 'center',
  },

  // Enhanced Announcements
  announcementsSection: { 
    marginTop: 24, 
    paddingHorizontal: 20, 
    zIndex: 10 
  },

  announcementsTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#374151', 
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  announcementCard: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  announcementIcon: { 
    position: 'relative', 
    marginRight: 20 
  },

  megaphoneContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  megaphoneEmoji: { fontSize: 28 },

  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  badgeNumber: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: '800' 
  },

  announcementContent: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },

  announcementText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1e293b',
    letterSpacing: -0.2,
  },

  viewAllButton: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },

  viewAllText: { 
    fontSize: 14, 
    color: '#3b82f6', 
    fontWeight: '700' 
  },

  paginationDots: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 24, 
    marginBottom: 20 
  },

  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#cbd5e1', 
    marginHorizontal: 4 
  },

  activeDot: { 
    backgroundColor: '#3b82f6',
    width: 24,
  },

  // Location Tracking Status
  trackingStatusContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 16,
  },

  trackingStatusCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },

  trackingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trackingIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  trackingIcon: {
    fontSize: 16,
  },

  trackingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.1,
  },

  trackingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },

  // Enhanced Bottom Navigation
  bottomNavContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    zIndex: 100 
  },

  bottomNavigation: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },

  navItem: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 4 
  },

  activeNavIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  navIconActive: { 
    fontSize: 20,
  },

  navIcon: { 
    fontSize: 20, 
    marginBottom: 6, 
    opacity: 0.6 
  },

  navLabelActive: { 
    fontSize: 12, 
    color: '#3b82f6', 
    fontWeight: '700' 
  },

  navLabel: { 
    fontSize: 12, 
    color: '#64748b', 
    fontWeight: '600' 
  },
});
