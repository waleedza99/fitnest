const API_BASE_URL =
  "https://4h0trna52g.execute-api.ca-central-1.amazonaws.com/prod";

export type Workout = {
  userId: string;
  workoutId: string;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  createdAt: string;
};

export type CreateWorkoutInput = {
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
};

export const getWorkouts = async (): Promise<Workout[]> => {
  const response = await fetch(`${API_BASE_URL}/workouts`);

  if (!response.ok) {
    throw new Error("Failed to fetch workouts");
  }

  const data = await response.json();

  return data.workouts ?? [];
};

export const createWorkout = async (
  workout: CreateWorkoutInput,
): Promise<Workout> => {
  const response = await fetch(`${API_BASE_URL}/workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workout),
  });

  if (!response.ok) {
    throw new Error("Failed to create workout");
  }

  const data = await response.json();

  return data.workout;
};
