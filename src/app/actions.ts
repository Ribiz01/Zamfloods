"use server";

import { probabilisticFloodForecast } from "@/ai/flows/probabilistic-flood-forecast";
import type { ProbabilisticFloodForecastInput } from "@/ai/flows/probabilistic-flood-forecast";

export async function generateForecastAction(
  input: ProbabilisticFloodForecastInput
) {
  try {
    const result = await probabilisticFloodForecast(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating forecast:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
