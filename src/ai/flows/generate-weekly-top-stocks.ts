'use server';
/**
 * @fileOverview AI agent that generates a weekly list of the top 5 stocks to buy.
 *
 * - generateWeeklyTopStocks - A function that generates the list of top 5 stocks.
 * - GenerateWeeklyTopStocksInput - The input type for the generateWeeklyTopStocks function. Currently empty.
 * - GenerateWeeklyTopStocksOutput - The return type for the generateWeeklyTopStocks function, containing the list of stocks and rationale.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeeklyTopStocksInputSchema = z.object({});
export type GenerateWeeklyTopStocksInput = z.infer<typeof GenerateWeeklyTopStocksInputSchema>;

const GenerateWeeklyTopStocksOutputSchema = z.object({
  stocks: z.array(z.string()).describe('A list of the top 5 stock tickers to buy this week.'),
  rationale: z.string().describe('The rationale behind the stock recommendations.'),
});
export type GenerateWeeklyTopStocksOutput = z.infer<typeof GenerateWeeklyTopStocksOutputSchema>;

export async function generateWeeklyTopStocks(
  input: GenerateWeeklyTopStocksInput
): Promise<GenerateWeeklyTopStocksOutput> {
  return generateWeeklyTopStocksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyTopStocksPrompt',
  input: {schema: GenerateWeeklyTopStocksInputSchema},
  output: {schema: GenerateWeeklyTopStocksOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to generate a list of the top 5 stocks to buy this week based on current market trends, news, and expert insights.

  Output the stocks in the following JSON format:
  {
    "stocks": ["ticker1", "ticker2", "ticker3", "ticker4", "ticker5"],
    "rationale": "The rationale behind the stock recommendations."
  }`,
});

const generateWeeklyTopStocksFlow = ai.defineFlow(
  {
    name: 'generateWeeklyTopStocksFlow',
    inputSchema: GenerateWeeklyTopStocksInputSchema,
    outputSchema: GenerateWeeklyTopStocksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
