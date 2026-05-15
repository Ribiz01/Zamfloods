import type { ProbabilisticFloodForecastOutput } from "@/ai/flows/probabilistic-flood-forecast";

export type RiskLevel = "No Flood" | "Moderate" | "High" | "Extreme";

export type ForecastState = {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: ProbabilisticFloodForecastOutput | null;
  error?: string | null;
};
