import { useAuth, useUser } from "@clerk/clerk-expo";
import { LogOut, User } from "lucide-react-native";
import { useEffect } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { saveUserToFirestore } from "../utils/firestore";

export default function Index() {
  const { signOut } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      saveUserToFirestore({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: new Date(),
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User color="#6366f1" size={24} />
            </View>
          )}
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{user?.firstName || "Fitness Pal"}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <LogOut color="#ef4444" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Your AI Calories Tracker</Text>
        <Text style={styles.subtitle}>Start tracking your meals and stay healthy!</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Dashboard content coming soon...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748b",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  signOutButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 32,
  },
  placeholderCard: {
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#94a3b8",
    fontSize: 14,
  }
});
