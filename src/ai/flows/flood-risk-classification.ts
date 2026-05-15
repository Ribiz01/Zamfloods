'use server';
/**
 * @fileOverview A Genkit flow for classifying flood risk levels for a given district.
 *
 * - classifyFloodRisk - A function that handles the flood risk classification process.
 * - FloodRiskClassificationInput - The input type for the classifyFloodRisk function.
 * - FloodRiskClassificationOutput - The return type for the classifyFloodRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FloodRiskClassificationInputSchema = z.object({
  currentConditionsDescription: z
    .string()
    .describe(
      'A detailed description of current meteorological, hydrological, and other relevant conditions affecting flood risk.'
    ),
  district: z.string().describe('The name of the district for which to classify the flood risk.'),
});
export type FloodRiskClassificationInput = z.infer<typeof FloodRiskClassificationInputSchema>;

const FloodRiskClassificationOutputSchema = z.object({
  district: z.string().describe('The district for which the flood risk was classified.'),
  riskLevel: z
    .enum(['No Flood', 'Moderate', 'High', 'Extreme'])
    .describe('The classified flood risk level.'),
  confidenceInterval: z
    .object({
      lower: z.number().min(0).max(100).describe('The lower bound of the confidence interval (0-100%).'),
      upper: z.number().min(0).max(100).describe('The upper bound of the confidence interval (0-100%).'),
    })
    .describe('The confidence interval for the classified risk level.'),
});
export type FloodRiskClassificationOutput = z.infer<typeof FloodRiskClassificationOutputSchema>;

export async function classifyFloodRisk(
  input: FloodRiskClassificationInput
): Promise<FloodRiskClassificationOutput> {
  return floodRiskClassificationFlow(input);
}

const classifyFloodRiskPrompt = ai.definePrompt({
  name: 'classifyFloodRiskPrompt',
  input: {schema: FloodRiskClassificationInputSchema},
  output: {schema: FloodRiskClassificationOutputSchema},
  prompt: `You are an expert flood risk analyst simulating a machine learning model (Random Forest, LSTM, or ANN) for probabilistic flood forecasting in Zambia. Your task is to analyze the provided current conditions description, which represents various data sources including meteorological, hydrological, disaster, and satellite data, and classify the flood risk level for the specified district.

Provide the risk level as one of 'No Flood', 'Moderate', 'High', or 'Extreme'. Additionally, provide a confidence interval (lower and upper percentage between 0 and 100) for this classification. Assume you have processed the data through an advanced ML model to arrive at this probabilistic forecast.

It is crucial that your response is in the exact JSON format specified by the output schema, including the 'district', 'riskLevel', and 'confidenceInterval' fields. The confidence interval's lower bound should always be less than or equal to its upper bound.


Current Conditions Description: {{{currentConditionsDescription}}}
District: {{{district}}}`,
});

const floodRiskClassificationFlow = ai.defineFlow(
  {
    name: 'floodRiskClassificationFlow',
    inputSchema: FloodRiskClassificationInputSchema,
    outputSchema: FloodRiskClassificationOutputSchema,
  },
  async input => {
    const {output} = await classifyFloodRiskPrompt(input);
    return output!;
  }
);
