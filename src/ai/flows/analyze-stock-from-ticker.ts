// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Provides AI-powered stock analysis with buy/sell recommendations based on the stock ticker.
 *
 * - analyzeStock - A function that analyzes a stock and provides a buy/sell recommendation.
 * - AnalyzeStockInput - The input type for the analyzeStock function.
 * - AnalyzeStockOutput - The return type for the analyzeStock function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStockInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock to analyze.'),
});

export type AnalyzeStockInput = z.infer<typeof AnalyzeStockInputSchema>;

const AnalyzeStockOutputSchema = z.object({
  recommendation: z
    .string()
    .describe('The recommendation (buy, sell, or hold) for the stock.'),
  rationale: z.string().describe('The AI-generated reasoning behind the recommendation.'),
});

export type AnalyzeStockOutput = z.infer<typeof AnalyzeStockOutputSchema>;

export async function analyzeStock(input: AnalyzeStockInput): Promise<AnalyzeStockOutput> {
  return analyzeStockFlow(input);
}

const analyzeStockPrompt = ai.definePrompt({
  name: 'analyzeStockPrompt',
  input: {schema: AnalyzeStockInputSchema},
  output: {schema: AnalyzeStockOutputSchema},
  prompt: `You are a financial analyst providing stock recommendations. Analyze the stock with ticker symbol {{{ticker}}} and provide a buy, sell, or hold recommendation with a detailed rationale. Consider current market data, recent news, and historical trends.`,
});

const analyzeStockFlow = ai.defineFlow(
  {
    name: 'analyzeStockFlow',
    inputSchema: AnalyzeStockInputSchema,
    outputSchema: AnalyzeStockOutputSchema,
  },
  async input => {
    const {output} = await analyzeStockPrompt(input);
    return output!;
  }
);
