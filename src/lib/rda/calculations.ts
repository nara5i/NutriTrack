export type WorkoutLevel = "light" | "moderate" | "heavy";
export type Gender = "male" | "female" | "other";

export type WeightGoal = "maintain" | "loss" | "gain";

export type RdaInput = {
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm?: number | null;
  workoutLevel: WorkoutLevel;
  weightGoal?: WeightGoal;
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
  let calories = bmr * activityMultiplier;

  // Adjust calories based on weight goal
  const weightGoal = input.weightGoal ?? "maintain";
  if (weightGoal === "loss") {
    // Deficit of ~500 calories per day (1 lb per week)
    calories = calories - 500;
  } else if (weightGoal === "gain") {
    // Surplus of ~500 calories per day (1 lb per week)
    calories = calories + 500;
  }
  // "maintain" keeps calories as calculated

  // Adjust macro distribution based on weight goal
  let proteinRatio = 0.3;
  let carbRatio = 0.45;
  let fatRatio = 0.25;

  if (weightGoal === "loss") {
    // Higher protein for muscle preservation during weight loss
    proteinRatio = 0.35;
    carbRatio = 0.40;
    fatRatio = 0.25;
  } else if (weightGoal === "gain") {
    // Higher carbs for energy during weight gain
    proteinRatio = 0.25;
    carbRatio = 0.50;
    fatRatio = 0.25;
  }

  const proteinCalories = calories * proteinRatio;
  const carbCalories = calories * carbRatio;
  const fatCalories = calories * fatRatio;

  return {
    calories: Math.round(calories),
    protein: roundToNearestFive(proteinCalories / 4),
    carbs: roundToNearestFive(carbCalories / 4),
    fats: roundToNearestFive(fatCalories / 9),
  };
}

