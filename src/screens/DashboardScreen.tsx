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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const CARD_SIZE = (width - CARD_GAP * 3) / 2;

const quickServices = [
  { title: "FASTag", emoji: "🏷️", subtitle: "₹1,250" },
  { title: "Police Checking", emoji: "👮", subtitle: "2 checkpoints" },
  { title: "Petrol Pump", emoji: "⛽", subtitle: "₹96.2/L" },
  { title: "Coming Soon", emoji: "🚀", subtitle: "New" },
];

export default function DriverTrackingScreen({ route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const sosAnim = useRef(new Animated.Value(1)).current;
  const cardAnimations = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current;
  const driverName = route?.params?.driverName || "Driver";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();

    const cardAnimationsLoop = cardAnimations.map((anim, idx) =>
      Animated.sequence([
        Animated.delay(idx * 160),
        Animated.timing(anim, { toValue: 1, duration: 520, useNativeDriver: true }),
      ])
    );

    Animated.stagger(160, cardAnimationsLoop).start();

    const sosAnimationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, { toValue: 1.1, duration: 950, useNativeDriver: true }),
        Animated.timing(sosAnim, { toValue: 1, duration: 950, useNativeDriver: true }),
      ])
    );

    sosAnimationLoop.start();

    return () => sosAnimationLoop.stop();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6FBF3" />
      {/* Background Gradient */}
      <LinearGradient
        colors={['#D4EDC7', '#E8F3E6', '#F6FBF3']}
        start={[0, 0]}
        end={[0, 1]}
        style={styles.gradientBackground}
      />

      <Animated.View style={[styles.headerWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.greeting}>Namaste, {driverName}</Text>
      </Animated.View>

      <View style={styles.gridWrap}>
        {quickServices.map((svc, i) => (
          <Animated.View
            key={svc.title}
            style={[
              styles.card,
              {
                opacity: cardAnimations[i],
                transform: [{ scale: cardAnimations[i] }],
              },
            ]}
          >
            <View style={styles.cardIconCircle}>
              <Text style={styles.cardIcon}>{svc.emoji}</Text>
            </View>
            <Text style={styles.cardTitle}>{svc.title}</Text>
            <Text style={styles.cardSubtitle}>{svc.subtitle}</Text>
          </Animated.View>
        ))}
      </View>

      <View style={styles.sosWrap}>
        <Animated.View style={{ transform: [{ scale: sosAnim }] }}>
          <TouchableOpacity style={styles.sosButton} activeOpacity={0.9} onPress={handleSOS}>
            <Text style={styles.sosIcon}>🆘</Text>
            <Text style={styles.sosText}>EMERGENCY SOS</Text>
            <Text style={styles.sosDescription}>Tap if you need help</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View style={[styles.announcementCard, {opacity: fadeAnim, transform: [{ translateY: slideAnim }]}]}>
        <Text style={styles.announcementIcon}>📢</Text>
        <View style={styles.announcementTextView}>
          <Text style={styles.announcementTitle}>New Route Added!</Text>
          <Text style={styles.announcementDescription}>
            Now track rides on the Mumbai–Delhi sector with live toll alerts.
          </Text>
        </View>
      </Animated.View>

      <View style={{ height: 20 }} />
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - CARD_GAP * 3) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FBF3",
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  headerWrap: {
    marginTop: 36,
    marginBottom: 22,
    marginHorizontal: 22,
    zIndex: 1,
  },
  greeting: {
    fontSize: 29,
    fontWeight: "bold",
    color: "#1D4428",
    letterSpacing: 0.3,
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: CARD_GAP,
    marginBottom: 14,
    zIndex: 1,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    marginBottom: CARD_GAP,
    paddingTop: 14,
    paddingBottom: 15,
    elevation: 8,
    shadowColor: "#ECF8E469",
    shadowOpacity: 0.14,
    shadowRadius: 23,
    shadowOffset: { width: 0, height: 10 },
  },
  cardIconCircle: {
    backgroundColor: "#ECF8E4",
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#234C2E",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#479267",
    textAlign: "center",
    marginTop: 1,
    letterSpacing: 0.2,
  },
  sosWrap: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 36,
    zIndex: 1,
  },
  sosButton: {
    backgroundColor: "#E23232",
    width: 190,
    height: 190,
    borderRadius: 95,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF7070",
    shadowOpacity: 0.35,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 17 },
    elevation: 20,
  },
  sosIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  sosText: {
    fontWeight: "bold",
    fontSize: 21,
    color: "#FFF",
    letterSpacing: 0.2,
  },
  sosDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 3,
    letterSpacing: 0.2,
  },
  announcementCard: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    marginHorizontal: 18,
    paddingHorizontal: 23,
    paddingVertical: 28,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#D0F4C1",
    shadowRadius: 23,
    shadowOpacity: 0.46,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
    marginBottom: 28,
    zIndex: 1,
  },
  announcementIcon: {
    fontSize: 48,
    marginRight: 18,
  },
  announcementTitle: {
    fontWeight: "bold",
    fontSize: 19,
    color: "#2A5F25",
    letterSpacing: 0.15,
  },
  announcementDescription: {
    fontSize: 16,
    color: "#4C7641",
    marginTop: 5,
    lineHeight: 20,
  },
  announcementTextView: {
    flex: 1,
  },
});
