import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { createWorkout, getWorkouts, Workout } from "./services/apiService";

export default function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const workoutData = await getWorkouts();
      setWorkouts(workoutData);
      setError(null);
    } catch (err) {
      setError("Could not load workouts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = async () => {
    try {
      setSaving(true);

      await createWorkout({
        date: new Date().toISOString().slice(0, 10),
        exercise,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
      });

      setExercise("");
      setSets("");
      setReps("");
      setWeight("");

      await loadWorkouts();
    } catch (err) {
      setError("Could not create workout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />

        <View style={styles.header}>
          <Text style={styles.title}>Fitnest</Text>
          <Text style={styles.subtitle}>Workout history from AWS</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Exercise"
            value={exercise}
            onChangeText={setExercise}
          />

          <TextInput
            style={styles.input}
            placeholder="Sets"
            value={sets}
            onChangeText={setSets}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Reps"
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateWorkout}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Add Workout"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" />}

        {error && <Text style={styles.error}>{error}</Text>}

        {!loading && !error && (
          <ScrollView contentContainerStyle={styles.list}>
            {workouts.map((workout) => (
              <View key={workout.workoutId} style={styles.card}>
                <Text style={styles.exercise}>{workout.exercise}</Text>
                <Text style={styles.details}>
                  {workout.sets} sets × {workout.reps} reps · {workout.weight}{" "}
                  lbs
                </Text>
                <Text style={styles.date}>{workout.date}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
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
  list: {
    gap: 12,
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
  form: {
    marginBottom: 24,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
