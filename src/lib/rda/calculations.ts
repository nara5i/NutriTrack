export type WorkoutLevel = "light" | "moderate" | "heavy";
export type Gender = "male" | "female" | "other";

export type RdaInput = {
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm?: number | null;
  workoutLevel: WorkoutLevel;
};

export type RdaTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

const activityMultipliers: Record<WorkoutLevel, number> = {
  light: 1.375,
  moderate: 1.55,
  heavy: 1.725,
};

function calculateBmr({ gender, age, weightKg, heightCm }: RdaInput) {
  const height = heightCm ?? 170;
  const base = 10 * weightKg + 6.25 * height - 5 * age;
  if (gender === "male") return base + 5;
  if (gender === "female") return base - 161;
  return base - 78; // midpoint between male and female offsets
}

function roundToNearestFive(value: number) {
  return Math.round(value / 5) * 5;
}

export function calculateRdaTargets(input: RdaInput): RdaTargets {
  const bmr = calculateBmr(input);
  const activityMultiplier = activityMultipliers[input.workoutLevel];
  const calories = bmr * activityMultiplier;

  // Macro distribution: 30% protein, 45% carbs, 25% fats
  const proteinCalories = calories * 0.3;
  const carbCalories = calories * 0.45;
  const fatCalories = calories * 0.25;

  return {
    calories: Math.round(calories),
    protein: roundToNearestFive(proteinCalories / 4),
    carbs: roundToNearestFive(carbCalories / 4),
    fats: roundToNearestFive(fatCalories / 9),
  };
}

