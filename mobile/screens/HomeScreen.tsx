import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getWorkouts, Workout } from "../services/apiService";
import { RootStackParamList } from "../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const workoutData = await getWorkouts();
      setWorkouts(workoutData);
      setError(null);
    } catch {
      setError("Could not load workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitnest</Text>
        <Text style={styles.subtitle}>Workout history from AWS</Text>
      </View>

      {loading && <ActivityIndicator size="large" />}

      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.list}
        >
          {workouts.length === 0 ? (
            <Text style={styles.emptyState}>
              No workouts yet. Tap + to add your first one.
            </Text>
          ) : (
            workouts.map((workout) => (
              <View key={workout.workoutId} style={styles.card}>
                <Text style={styles.exercise}>{workout.exercise}</Text>
                <Text style={styles.details}>
                  {workout.sets} sets × {workout.reps} reps · {workout.weight}{" "}
                  lbs
                </Text>
                <Text style={styles.date}>{workout.date}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddWorkout")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  list: {
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
  },
  exercise: {
    fontSize: 18,
    fontWeight: "600",
  },
  details: {
    marginTop: 6,
    fontSize: 14,
    color: "#333",
  },
  date: {
    marginTop: 6,
    fontSize: 13,
    color: "#777",
  },
  error: {
    color: "red",
    fontSize: 16,
  },
  emptyState: {
    color: "#777",
    textAlign: "center",
    marginTop: 24,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#111",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "600",
  },
});
