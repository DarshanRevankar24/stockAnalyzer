'use server';
/**
 * @fileOverview This file defines a Genkit flow for explaining the AI's reasoning behind stock recommendations.
 *
 * - explainRecommendationRationale - A function that takes a stock ticker and recommendation type (buy/sell) and returns the AI's reasoning.
 * - ExplainRecommendationRationaleInput - The input type for the explainRecommendationRationale function.
 * - ExplainRecommendationRationaleOutput - The return type for the explainRecommendationRationale function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainRecommendationRationaleInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
  recommendation: z.enum(['buy', 'sell']).describe('The recommendation type (buy or sell).'),
});
export type ExplainRecommendationRationaleInput = z.infer<typeof ExplainRecommendationRationaleInputSchema>;

const ExplainRecommendationRationaleOutputSchema = z.object({
  rationale: z.string().describe('The AI\s reasoning behind the stock recommendation.'),
});
export type ExplainRecommendationRationaleOutput = z.infer<typeof ExplainRecommendationRationaleOutputSchema>;

export async function explainRecommendationRationale(input: ExplainRecommendationRationaleInput): Promise<ExplainRecommendationRationaleOutput> {
  return explainRecommendationRationaleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainRecommendationRationalePrompt',
  input: {schema: ExplainRecommendationRationaleInputSchema},
  output: {schema: ExplainRecommendationRationaleOutputSchema},
  prompt: `You are an expert financial analyst. Explain your reasoning behind the following stock recommendation.  Provide specific market data or news to support your answer.

Ticker: {{{ticker}}}
Recommendation: {{{recommendation}}}
\nRationale: `,
});

const explainRecommendationRationaleFlow = ai.defineFlow(
  {
    name: 'explainRecommendationRationaleFlow',
    inputSchema: ExplainRecommendationRationaleInputSchema,
    outputSchema: ExplainRecommendationRationaleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
