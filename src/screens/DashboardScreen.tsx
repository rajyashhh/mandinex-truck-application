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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const { width } = Dimensions.get('window');


export default function PorterDriverScreen({ route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current; 
  const sosAnim = useRef(new Animated.Value(1)).current;

  const wave1Anim = useRef(new Animated.Value(1)).current;
  const wave2Anim = useRef(new Animated.Value(1)).current;
  const wave3Anim = useRef(new Animated.Value(1)).current;

  const driverName = route?.params?.driverName || "Driver";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();

    const sosLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(sosAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    sosLoop.start();

    const wave1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave1Anim, { toValue: 1.35, duration: 2000, useNativeDriver: true }),
        Animated.timing(wave1Anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );

    const wave2Loop = Animated.loop(
      Animated.sequence([
        Animated.delay(240),
        Animated.timing(wave2Anim, { toValue: 1.55, duration: 2400, useNativeDriver: true }),
        Animated.timing(wave2Anim, { toValue: 1, duration: 2400, useNativeDriver: true }),
      ])
    );

    const wave3Loop = Animated.loop(
      Animated.sequence([
        Animated.delay(480),
        Animated.timing(wave3Anim, { toValue: 1.75, duration: 2800, useNativeDriver: true }),
        Animated.timing(wave3Anim, { toValue: 1, duration: 2800, useNativeDriver: true }),
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
      icon: require("../assets/icons/fastag.png"),
      gradientColors: ['#E8F8F5', '#D1F2EB'],
      textColor: "#00875A",
      accentColor: "#00A86B",
    },
    {
      title: "Petrol Pumps",
      subtitle: "₹96.2/L",
      icon: require("../assets/icons/pump.png"),
      gradientColors: ['#FEF7E0', '#FED7AA'],
      textColor: "#D97706",
      accentColor: "#F59E0B",
    },
    {
      title: "Dhaba",
      subtitle: "Near you",
      icon: require("../assets/icons/dhaba.jpg"),  // Use icon with transparent background and good centering!
      gradientColors: ['#F3E8FF', '#E9D5FF'],
      textColor: "#7C2D92",
      accentColor: "#9333EA",
    },
    {
      title: "Mechanics",
      subtitle: "24/7 Help",
      icon: require("../assets/icons/mechanic.png"),
      gradientColors: ['#DBEAFE', '#BFDBFE'],
      textColor: "#1D4ED8",
      accentColor: "#3B82F6",
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
      outputRange: [0, 0.36, 0],
      extrapolate: 'clamp'
    }),
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3d72" />

      <LinearGradient colors={['#1a3d72', '#2a5090', '#3a6bb0']} style={styles.headerBackground} />

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Namaste, {driverName}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 120 : 100 }}
      >
        {/* Order Info Card */}
        <Animated.View style={[styles.orderInfoCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.orderHeader}>
            <View style={styles.buyerInfo}>
              <Text style={styles.orderLabel}>Order For:</Text>
              <Text style={styles.buyerName}>{orderData.buyerName}</Text>
            </View>

            <TouchableOpacity style={styles.callButton} onPress={handleCallBuyer}>
              <Text style={styles.callIcon}>📞</Text>
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.routeInfo}>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
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
        </Animated.View>

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {services.map(service => (
            <TouchableOpacity
              key={service.title}
              style={styles.modernServiceCard}
              onPress={() => handleServicePress(service.title)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={service.gradientColors} style={styles.serviceCardGradient}>
                {/* Center faint icon in background */}
                <Image source={service.icon} style={styles.serviceBackgroundImage} />

                {/* Foreground text */}
                <View style={styles.serviceCardContent}>
                  <Text style={[styles.modernServiceTitle, { color: service.textColor }]}>{service.title}</Text>
                  <Text style={[styles.modernServiceSubtitle, { color: service.accentColor }]}>{service.subtitle}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* SOS Button Waves */}
        <View style={styles.sosMainContainer}>
          <View style={styles.sosWaveWrapper} pointerEvents="none">
            <Animated.View style={[styles.sosWave, styles.sosWave3, waveAnimatedStyle(wave3Anim, 360)]}>
              <LinearGradient colors={['rgba(196,33,33,0.12)', 'rgba(196,33,33,0.04)']} style={styles.waveGradientFill} />
            </Animated.View>

            <Animated.View style={[styles.sosWave, styles.sosWave2, waveAnimatedStyle(wave2Anim, 300)]}>
              <LinearGradient colors={['rgba(214,40,40,0.16)', 'rgba(214,40,40,0.06)']} style={styles.waveGradientFill} />
            </Animated.View>

            <Animated.View style={[styles.sosWave, styles.sosWave1, waveAnimatedStyle(wave1Anim, 240)]}>
              <LinearGradient colors={['rgba(229,62,62,0.22)', 'rgba(229,62,62,0.08)']} style={styles.waveGradientFill} />
            </Animated.View>
          </View>

          <Animated.View style={[styles.sosButtonWrapper, { transform: [{ scale: sosAnim }, { translateY: -8 }] }]}>
            <TouchableOpacity style={styles.sosButton} activeOpacity={0.85} onPress={handleSOS}>
              <LinearGradient colors={['#E53E3E', '#D62828', '#C4161A']} style={styles.sosButtonGradient}>
                <Text style={styles.sosIcon}>🆘</Text>
                <Text style={styles.sosText}>EMERGENCY SOS</Text>
                <Text style={styles.sosDescription}>Tap if you need help</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Announcements */}
        <View style={styles.announcementsSection}>
          <Text style={styles.announcementsTitle}>Announcements</Text>

          <View style={styles.announcementCard}>
            <View style={styles.announcementIcon}>
              <Text style={styles.megaphoneEmoji}>📢</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeNumber}>3</Text>
              </View>
            </View>

            <View style={styles.announcementContent}>
              <Text style={styles.announcementText}>Safety Ki Shart Lagi!</Text>
              <Text style={styles.viewAllText}>View all</Text>
            </View>
          </View>

          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

      </ScrollView>

      {/* Fixed bottom nav */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIconActive}>🏠</Text>
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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },

  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  greetingContainer: {
    paddingHorizontal: 20,
    paddingTop: 16, 
    paddingBottom: 8,
    zIndex: 12,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.22)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },

  scrollView: { flex: 1, paddingTop: 6 },

  orderInfoCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },

  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  buyerInfo: { flex: 1 },
  orderLabel: { fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 4 },
  buyerName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  callButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#4CAF50', shadowOpacity: 0.28, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  callIcon: { fontSize: 16, marginRight: 6 },
  callText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  routeInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  locationIcon: { fontSize: 16, marginRight: 10, marginTop: 2 },
  locationDetails: { flex: 1 },
  currentLocation: { fontSize: 14, color: '#4CAF50', fontWeight: '600', marginBottom: 4 },
  destination: { fontSize: 14, color: '#666', fontWeight: '500' },
  timeInfo: { alignItems: 'flex-end', marginLeft: 10 },
  eta: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  distance: { fontSize: 12, color: '#666', fontWeight: '600' },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 14, justifyContent: 'space-between', zIndex: 10 },
  modernServiceCard: { width: (width - 40) / 2, marginBottom: 12, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 },
  serviceCardGradient: { borderRadius: 16, padding: 16, minHeight: 110, overflow: 'hidden' },
  serviceBackgroundImage: {
    position: 'absolute',
    width: 86,
    height: 86,
    left: '50%',
    top: '50%',
    marginLeft: -43,
    marginTop: -43,
    opacity: 0.15,
    resizeMode: 'contain',
    zIndex: 1,
  },
  serviceCardContent: { zIndex: 2, justifyContent: 'flex-start' },
  modernServiceTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, letterSpacing: -0.2 },
  modernServiceSubtitle: { fontSize: 14, fontWeight: '600', letterSpacing: -0.1 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceTextContainer: { flex: 1 },
  modernServiceEmoji: { fontSize: 20 },

  sosMainContainer: {
    marginTop: 20,
    marginBottom: 30,
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
  sosWave: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  sosWave1: { width: 240, height: 240 },
  sosWave2: { width: 300, height: 300 },
  sosWave3: { width: 360, height: 360 },
  waveGradientFill: { width: '100%', height: '100%', borderRadius: 999 },

  sosButtonWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  sosButton: { width: 160, height: 160, borderRadius: 80, overflow: 'hidden' },
  sosButtonGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E53E3E',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  sosIcon: { fontSize: 44, marginBottom: 6 },
  sosText: { fontWeight: 'bold', fontSize: 16, color: '#FFF', letterSpacing: 0.4 },
  sosDescription: { fontSize: 11, fontWeight: '500', color: '#FFF', marginTop: 4, opacity: 0.95 },

  announcementsSection: { marginTop: 18, paddingHorizontal: 16, zIndex: 10 },
  announcementsTitle: { fontSize: 18, fontWeight: '600', color: '#999', marginBottom: 16 },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  announcementIcon: { position: 'relative', marginRight: 16 },
  megaphoneEmoji: { fontSize: 32 },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumber: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  announcementContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  announcementText: { fontSize: 18, fontWeight: '500', color: '#333' },
  viewAllText: { fontSize: 16, color: '#4A90E2', fontWeight: '500' },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#4A90E2' },

  bottomNavContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIconActive: { fontSize: 24, marginBottom: 4 },
  navIcon: { fontSize: 22, marginBottom: 4, opacity: 0.6 },
  navLabelActive: { fontSize: 12, color: '#4A90E2', fontWeight: '600' },
  navLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
});
