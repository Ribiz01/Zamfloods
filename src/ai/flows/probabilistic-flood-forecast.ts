'use server';
/**
 * @fileOverview A Genkit flow for generating probabilistic flood forecasts.
 *
 * - probabilisticFloodForecast - A function that handles the probabilistic flood forecast process.
 * - ProbabilisticFloodForecastInput - The input type for the probabilisticFloodForecast function.
 * - ProbabilisticFloodForecastOutput - The return type for the probabilisticFloodForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { zambiaDistricts } from '@/lib/zambia-districts';

const regionCoordinates: { [key: string]: { latitude: number; longitude: number } } = 
  zambiaDistricts.reduce((acc, district) => {
    acc[district.name] = { latitude: district.latitude, longitude: district.longitude };
    return acc;
  }, {} as { [key: string]: { latitude: number; longitude: number } });


// Tool to get flood data from open-meteo
const getFloodDataTool = ai.defineTool(
  {
    name: 'getFloodData',
    description: 'Fetches river discharge forecast data for a specific location from the Open-Meteo Flood API.',
    inputSchema: z.object({
      latitude: z.number().describe('Latitude of the location.'),
      longitude: z.number().describe('Longitude of the location.'),
    }),
    outputSchema: z.any(),
  },
  async ({ latitude, longitude }) => {
    const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${latitude}&longitude=${longitude}&daily=river_discharge,river_discharge_mean,river_discharge_median,river_discharge_max,river_discharge_min,river_discharge_p25,river_discharge_p75&models=seamless_v4,forecast_v4,consolidated_v4,seamless_v3,forecast_v3,consolidated_v3&ensemble=true`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch flood data: ${response.statusText}`, errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching flood data:", error);
      return { error: error instanceof Error ? error.message : "Unknown error fetching data." };
    }
  }
);


// Input Schema
const ProbabilisticFloodForecastInputSchema = z.object({
  region: z
    .string()
    .describe('The specific region for which to generate the flood forecast (e.g., Lusaka, Mongu, Chipata).'),
  forecastHorizonHours: z
    .number()
    .int()
    .min(24)
    .max(72)
    .default(72)
    .optional()
    .describe('The duration of the forecast in hours, ranging from 24 to 72.'),
});
export type ProbabilisticFloodForecastInput = z.infer<typeof ProbabilisticFloodForecastInputSchema>;

// Output Schema
const ProbabilisticFloodForecastOutputSchema = z.object({
  forecastRegion: z
    .string()
    .describe('The region for which the flood forecast was generated.'),
  forecastTimeUTC: z
    .string()
    .datetime()
    .describe('The UTC timestamp when this forecast was generated.'),
  forecastHorizonHours: z
    .number()
    .int()
    .min(24)
    .max(72)
    .describe('The duration of the forecast in hours.'),
  floodProbability: z
    .number()
    .min(0.0)
    .max(1.0)
    .describe('The calculated probability of a flood occurring within the forecast horizon (0.0 to 1.0).'),
  confidenceIntervalLower: z
    .number()
    .min(0.0)
    .max(1.0)
    .describe('The lower bound of the confidence interval for the flood probability.'),
  confidenceIntervalUpper: z
    .number()
    .min(0.0)
    .max(1.0)
    .describe('The upper bound of the confidence interval for the flood probability.'),
  riskClassification: z
    .enum(['No Flood', 'Moderate', 'High', 'Extreme'])
    .describe('The classified flood risk level based on the probability and historical data.'),
  justification: z
    .string()
    .describe('A detailed textual explanation for the probabilistic flood forecast and its associated risk classification, referencing the provided data summaries.'),
});
export type ProbabilisticFloodForecastOutput = z.infer<typeof ProbabilisticFloodForecastOutputSchema>;

export async function probabilisticFloodForecast(
  input: ProbabilisticFloodForecastInput
): Promise<ProbabilisticFloodForecastOutput> {
  return probabilisticFloodForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'probabilisticFloodForecastPrompt',
  input: { schema: z.object({
      region: z.string(),
      forecastHorizonHours: z.number().optional(),
      forecastData: z.string()
  }) },
  output: { schema: ProbabilisticFloodForecastOutputSchema },
  prompt: `You are an expert hydrologist and flood risk analyst for Zambia Flood Watch, acting as a sophisticated decision support system. Your task is to generate a comprehensive 24-72 hour flood forecast for a specified region in Zambia.

Your analysis must be holistic, integrating four key sources of information:
1.  **Quantitative Real-time Data**: Analyze the provided river discharge forecast data from the Open-Meteo Flood API. The data is in JSON format. Look for:
    -   Increasing trends in 'river_discharge_mean'.
    -   High 'river_discharge_max' values compared to the mean and median.
    -   The percentile ranges ('river_discharge_p25' to 'river_discharge_p75') to gauge uncertainty.
    -   Absolute discharge values (context: >2000 m³/s can be significant).

2.  **Qualitative Risk Factors**: Consider the following underlying vulnerability factors for the region. Since you don't have exact metrics for these, use your expert knowledge of Zambia and general hydrological principles to estimate their impact. For a given region like Lusaka, Mongu, or Chipata, consider their general characteristics:
    -   **Topography & Drainage**: Is the area flat and poorly drained?
    -   **River Management**: Are there effective flood control measures in place?
    -   **Deforestation & Land Use**: Has deforestation occurred, reducing water absorption?
    -   **Urbanization**: Is there significant urban development with impermeable surfaces?
    -   **Infrastructure Quality**: How is the state of dams and drainage systems?
    -   **Agricultural Practices**: Are there practices that contribute to runoff?
    -   **Disaster Preparedness**: How effective are local early warning and evacuation plans?

3.  **ZMD Map Viewer Data**: Cross-reference your analysis with alerts and data layers from the Zambia Meteorological Department's (ZMD) official map viewer. This includes official warnings (CAP alerts) and other visual meteorological data. Assume you have reviewed this visual data source for any overriding alerts or critical conditions not fully captured by the other data streams.

4.  **Satellite Imagery Analysis**: Incorporate insights from near-real-time satellite imagery (as one might find on services like Zoom.earth). This includes assessing cloud cover, tracking storm systems, and visually estimating current ground saturation levels.


**Your Task**:
Synthesize the quantitative data, your assessment of the qualitative factors, information from the ZMD, and satellite imagery analysis to generate a probabilistic flood forecast.

Your output must include:
-   A flood probability (0.0 to 1.0).
-   A confidence interval for that probability.
-   A clear risk classification ('No Flood', 'Moderate', 'High', 'Extreme').
-   A detailed justification that explains how the river discharge data, qualitative risk factors, ZMD information, and satellite imagery analysis support your conclusion. Reference specific data points and factors in your reasoning.

Forecast Request Details:
Region: {{{region}}}
Forecast Horizon: {{{forecastHorizonHours}}} hours

Quantitative Forecast Data:
\`\`\`json
{{{forecastData}}}
\`\`\`

Ensure your response is a JSON object strictly conforming to the ProbabilisticFloodForecastOutputSchema. Populate the 'forecastTimeUTC' field with the current UTC timestamp. The 'forecastRegion' should match the input region.
`
});

const probabilisticFloodForecastFlow = ai.defineFlow(
  {
    name: 'probabilisticFloodForecastFlow',
    inputSchema: ProbabilisticFloodForecastInputSchema,
    outputSchema: ProbabilisticFloodForecastOutputSchema,
  },
  async (input) => {
    const { region } = input;
    const coordinates = regionCoordinates[region];

    if (!coordinates) {
      throw new Error(`Invalid region specified: ${region}`);
    }

    const forecastData = await getFloodDataTool(coordinates);

    if (forecastData.error) {
        throw new Error(`Failed to get flood data: ${forecastData.error}`);
    }

    const { output } = await prompt({
        ...input,
        forecastData: JSON.stringify(forecastData, null, 2)
    });

    if (!output) {
      throw new Error('No output received from the flood forecast prompt.');
    }

    // Ensure fields are set in output, using input as a fallback.
    output.forecastRegion = output.forecastRegion || input.region;
    output.forecastTimeUTC = output.forecastTimeUTC || new Date().toISOString();
    output.forecastHorizonHours = output.forecastHorizonHours || (input.forecastHorizonHours ?? ProbabilisticFloodForecastInputSchema.shape.forecastHorizonHours.getDefault());

    return output;
  }
);
