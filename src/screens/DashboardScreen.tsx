// src/screens/DashboardScreen.tsx
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// import your svgs (requires react-native-svg + svg-transformer)
import TruckIcon from "../assets/icons/truck.png";
import MotorbikeIcon from "../assets/icons/motorbike.svg";
import PackerIcon from "../assets/icons/packer.svg";
import ParcelIcon from "../assets/icons/parcel.svg";
import FastagIcon from "../assets/icons/fastag.svg";
import PoliceIcon from "../assets/icons/police.svg";
import PumpIcon from "../assets/icons/pump.svg";
import RocketIcon from "../assets/icons/rocket.svg";
import SOSIcon from "../assets/icons/sos.svg";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const sosAnim = useRef(new Animated.Value(1)).current;
  const cardAnimations = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current;

  const driverName = route?.params?.driverName || "Driver";

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    const cardAnimationSequence = cardAnimations.map((anim, index) =>
      Animated.timing(anim, { toValue: 1, duration: 450, delay: index * 120, useNativeDriver: true })
    );
    Animated.parallel(cardAnimationSequence).start();

    const sosAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(sosAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    sosAnimation.start();
    return () => sosAnimation.stop();
  }, []);

  const handleCustomerSupport = () => {
    Alert.alert("Customer Support", "", [
      { text: "Cancel", style: "cancel" },
      { text: "Call Now", onPress: () => Linking.openURL("tel:+919606995351") },
      {
        text: "WhatsApp",
        onPress: () => Linking.openURL("whatsapp://send?phone=+919606995351"),
      },
    ]);
  };

  const services = [
    {
      title: "Trucks",
      Icon: TruckIcon,
      onPress: () => Alert.alert("Trucks", "Open trucks category"),
    },
    {
      title: "2 Wheeler",
      Icon: MotorbikeIcon,
      onPress: () => Alert.alert("2 Wheeler", "Open 2W category"),
    },
    {
      title: "Packers & Movers",
      Icon: PackerIcon,
      onPress: () => Alert.alert("Packers & Movers", "Open packers"),
    },
    {
      title: "All India Parcel",
      Icon: ParcelIcon,
      onPress: () => Alert.alert("All India Parcel", "Open parcels"),
    },
  ];

  const quickServices = [
    { title: "FASTag", Icon: FastagIcon, badge: "₹1,250" },
    { title: "Police Checking", Icon: PoliceIcon, badge: "4 nearby" },
    { title: "Petrol Pump", Icon: PumpIcon, badge: "₹96.2/L" },
    { title: "Coming Soon", Icon: RocketIcon, badge: "New" },
  ];

  const handleSOS = () => {
    Alert.alert("Emergency SOS", "Send alert to Support, Police, and your Fleet Manager?", [
      { text: "Cancel", style: "cancel" },
      { text: "ACTIVATE SOS", style: "destructive", onPress: () => Alert.alert("SOS ACTIVATED", "Help is on the way!") },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.container.backgroundColor} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner / Pickup */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Pick up from</Text>
            <Text style={styles.heroSubtitle}>RA-478, Milan Nagar, Basani Devi Colony</Text>
          </View>
          <TouchableOpacity style={styles.heroAction} activeOpacity={0.8}>
            <Text style={styles.heroActionText}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Services grid (big cards with cute illustrations) */}
        <View style={styles.servicesGrid}>
          {services.map((s, i) => {
            const Anim = cardAnimations[i] || new Animated.Value(1);
            return (
              <Animated.View
                key={s.title}
                style={[
                  styles.serviceCard,
                  {
                    opacity: Anim,
                    transform: [{ scale: Anim }],
                  },
                ]}
              >
                <TouchableOpacity style={styles.cardTouchable} onPress={s.onPress} activeOpacity={0.88}>
                  <View style={styles.cardIllustration}>
                    {/* SVG icon component */}
                    <s.Icon width={62} height={62} />
                  </View>
                  <Text style={styles.serviceTitle}>{s.title}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Rewards banner */}
        <View style={styles.rewardsBanner}>
          <Text style={styles.rewardsTitle}>Explore Driver Rewards</Text>
          <Text style={styles.rewardsSubtitle}>Earn 2 coins for every ₹100 spent</Text>
          <TouchableOpacity style={styles.rewardsButton} activeOpacity={0.9}>
            <Text style={styles.rewardsButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick services (small cards) */}
        <View style={styles.quickGrid}>
          {quickServices.map((q) => (
            <TouchableOpacity
              key={q.title}
              style={styles.quickCard}
              onPress={() => Alert.alert(q.title)}
              activeOpacity={0.85}
            >
              <View style={styles.quickLeft}>
                <q.Icon width={28} height={28} />
                <Text style={styles.quickTitle}>{q.title}</Text>
              </View>
              <View style={styles.quickBadge}>
                <Text style={styles.quickBadgeText}>{q.badge}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* SOS circular button */}
        <View style={styles.sosWrap}>
          <Animated.View style={{ transform: [{ scale: sosAnim }] }}>
            <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.9}>
              <SOSIcon width={48} height={48} />
              <Text style={styles.sosText}>EMERGENCY</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Announcements */}
        <View style={styles.announcementsSection}>
          <View style={styles.announcementsHeader}>
            <Text style={styles.announcementsTitle}>Announcements</Text>
            <TouchableOpacity onPress={() => Alert.alert("View all")}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.announcementCard}>
            <View style={styles.announcementLeft}>
              <TruckIcon width={34} height={34} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.announcementHeader}>Introducing Loading-Unloading Service!</Text>
              <Text style={styles.announcementText}>Book helpers for loading/unloading at pickup or delivery.</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD = {
  borderRadius: 14,
  backgroundColor: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },
  scrollContent: {
    paddingBottom: 36,
  },

  heroBanner: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: "#0C3F9A",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#0C3F9A44",
  },
  heroLeft: { flex: 1 },
  heroTitle: { color: "#EAF4FF", fontWeight: "700", fontSize: 14 },
  heroSubtitle: { color: "#D6E8FF", marginTop: 4, fontSize: 13, width: width * 0.6 },
  heroAction: {
    backgroundColor: "#ffffff22",
    padding: 8,
    borderRadius: 10,
  },
  heroActionText: { color: "#fff", fontSize: 18 },

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 14,
  },
  serviceCard: {
    ...CARD,
    width: (width - 44) / 2,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#00000010",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    alignItems: "flex-start",
  },
  cardTouchable: { width: "100%" },
  cardIllustration: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#F4FAFF",
    borderRadius: 12,
    marginBottom: 10,
  },
  serviceTitle: { fontWeight: "700", fontSize: 15, color: "#1E293B", textAlign: "center" },

  rewardsBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#5B2DBD",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  rewardsTitle: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  rewardsSubtitle: { color: "#F0E8FF", fontSize: 13, opacity: 0.95 },
  rewardsButton: {
    backgroundColor: "#FFFFFF22",
    padding: 8,
    borderRadius: 10,
  },
  rewardsButtonText: { color: "#fff", fontSize: 18 },

  quickGrid: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  quickCard: {
    ...CARD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 10,
    borderColor: "#EEF1F5",
    borderWidth: 1,
  },
  quickLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  quickTitle: { fontWeight: "700", color: "#1E293B", marginLeft: 12 },
  quickBadge: { minWidth: 66, alignItems: "center", justifyContent: "center", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: "#E9F7EF" },
  quickBadgeText: { color: "#1E293B", fontWeight: "700", fontSize: 12 },

  sosWrap: { alignItems: "center", marginVertical: 20 },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 14,
  },
  sosText: { color: "#fff", marginTop: 8, fontWeight: "800", letterSpacing: 0.6 },

  announcementsSection: { marginTop: 6, paddingHorizontal: 16 },
  announcementsHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  announcementsTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
  viewAllText: { color: "#5B2DBD", fontWeight: "700" },
  announcementCard: { ...CARD, flexDirection: "row", alignItems: "center", padding: 12, borderColor: "#EEF1F5", borderWidth: 1 },
  announcementLeft: { width: 48, height: 48, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 8, backgroundColor: "#F4FAFF" },
  announcementHeader: { fontWeight: "700", color: "#1E293B", fontSize: 14 },
  announcementText: { color: "#606770", fontSize: 13 },
});