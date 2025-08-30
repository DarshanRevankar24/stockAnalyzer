import { generateWeeklyTopStocks } from '@/ai/flows/generate-weekly-top-stocks';
import { Dashboard } from '@/components/dashboard';

export default async function Home() {
  const weeklyTopStocks = await generateWeeklyTopStocks({});

  return <Dashboard initialWeeklyTopStocks={weeklyTopStocks} />;
}
