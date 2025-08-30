"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Lightbulb,
  LoaderCircle,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";

import type { GenerateWeeklyTopStocksOutput } from "@/ai/flows/generate-weekly-top-stocks";
import type { AnalyzeStockOutput } from "@/ai/flows/analyze-stock-from-ticker";
import { analyzeStock } from "@/ai/flows/analyze-stock-from-ticker";
import { explainRecommendationRationale } from "@/ai/flows/explain-recommendation-rationale";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { StockChart } from "@/components/stock-chart";
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";


const searchSchema = z.object({
  ticker: z.string().min(1, "Ticker is required.").max(5, "Ticker is too long."),
});

type StockPrice = { month: string; price: number };
type AnalyzedStock = AnalyzeStockOutput & {
  ticker: string;
  prices: StockPrice[];
};

export function Dashboard({
  initialWeeklyTopStocks,
}: {
  initialWeeklyTopStocks: GenerateWeeklyTopStocksOutput;
}) {
  const [view, setView] = React.useState<"weekly" | "analysis">("weekly");
  const [currentStock, setCurrentStock] = React.useState<AnalyzedStock | null>(null);
  const [watchlist, setWatchlist] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRationaleLoading, setIsRationaleLoading] = React.useState<string | null>(null);
  const [detailedRationale, setDetailedRationale] = React.useState<Record<string, string>>({});
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { ticker: "" },
  });

  React.useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem("stock-sensei-watchlist");
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error("Failed to load watchlist from localStorage", error);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("stock-sensei-watchlist", JSON.stringify(watchlist));
    } catch (error) {
      console.error("Failed to save watchlist to localStorage", error);
    }
  }, [watchlist]);

  const handleAnalyzeStock = async (ticker: string) => {
    setIsLoading(true);
    setView("analysis");
    setCurrentStock(null);
    form.reset({ ticker: "" });
    try {
      const analysis = await analyzeStock({ ticker });
      const prices = Array.from({ length: 30 }, (_, i) => ({
        month: `Day ${i + 1}`,
        price: parseFloat(
          (150 + Math.random() * 50 - 25 + i * 1.5 + Math.sin(i / 5) * 10).toFixed(2)
        ),
      }));
      setCurrentStock({ ...analysis, ticker, prices });
    } catch (error) {
      console.error("Failed to analyze stock:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: `Could not analyze stock "${ticker}". Please try again.`,
      });
      setView("weekly");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (values: z.infer<typeof searchSchema>) => {
    handleAnalyzeStock(values.ticker.toUpperCase());
  };

  const handleExplainRationale = async (ticker: string) => {
    setIsRationaleLoading(ticker);
    try {
      const result = await explainRecommendationRationale({ ticker, recommendation: "buy" });
      setDetailedRationale((prev) => ({ ...prev, [ticker]: result.rationale }));
    } catch (error) {
      console.error("Failed to explain rationale:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load detailed rationale.",
      });
    } finally {
      setIsRationaleLoading(null);
    }
  };

  const handleToggleWatchlist = (ticker: string) => {
    setWatchlist((prev) =>
      prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker]
    );
  };

  const recommendationVariant = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case "buy": return "default";
      case "sell": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Watchlist</SidebarGroupLabel>
            <SidebarMenu>
              {watchlist.length > 0 ? (
                watchlist.map((ticker) => (
                  <SidebarMenuItem key={ticker}>
                    <SidebarMenuButton
                      onClick={() => handleAnalyzeStock(ticker)}
                      isActive={currentStock?.ticker === ticker}
                    >
                      {ticker}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <p className="p-2 text-sm text-muted-foreground">
                  Your watchlist is empty.
                </p>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {view === 'analysis' && (
                  <Button variant="outline" size="icon" onClick={() => setView('weekly')} className="shrink-0">
                      <ArrowLeft className="h-4 w-4" />
                      <span className="sr-only">Back</span>
                  </Button>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {view === 'weekly' ? "Dashboard" : `Analysis: ${currentStock?.ticker || ''}`}
              </h1>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSearchSubmit)}
                className="flex w-full sm:w-auto items-start gap-2"
              >
                <FormField
                  control={form.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-48">
                      <FormControl>
                        <Input placeholder="Enter ticker..." {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  <Search className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
                </Button>
              </form>
            </Form>
          </header>

          <main className="flex-1 overflow-auto animate-in fade-in-50">
            {isLoading && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}

            {!isLoading && view === "analysis" && currentStock && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{currentStock.ticker}</CardTitle>
                      <CardDescription>
                        AI-Powered Analysis & Recommendation
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={recommendationVariant(currentStock.recommendation)} className="capitalize text-sm">
                        {currentStock.recommendation}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleWatchlist(currentStock.ticker)}
                      >
                        <Star className={cn("h-5 w-5", watchlist.includes(currentStock.ticker) ? "fill-accent text-accent" : "text-muted-foreground")}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Price Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StockChart data={currentStock.prices} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>AI Rationale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{currentStock.rationale}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {!isLoading && view === "weekly" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Top 5 Stocks</CardTitle>
                    <CardDescription>
                      AI-generated list of top stocks to consider this week.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticker</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {initialWeeklyTopStocks.stocks.map((ticker) => (
                          <TableRow key={ticker}>
                            <TableCell className="font-medium">
                              <button onClick={() => handleAnalyzeStock(ticker)} className="hover:underline">
                                {ticker}
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleWatchlist(ticker)}
                                        className="mr-2"
                                      >
                                        <Star className={cn("h-4 w-4", watchlist.includes(ticker) ? "fill-accent text-accent" : "text-muted-foreground")}
                                        />
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Add to watchlist</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleExplainRationale(ticker)}
                                          disabled={isRationaleLoading === ticker}
                                        >
                                          {isRationaleLoading === ticker ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Lightbulb className="h-4 w-4" />
                                          )}
                                          <span className="ml-2 hidden sm:inline">Rationale</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Explain Rationale</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {Object.keys(detailedRationale).length > 0 && (
                       <div className="mt-6 space-y-4">
                        {Object.entries(detailedRationale).map(([ticker, rationale]) => (
                            <Card key={ticker} className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">{ticker} Rationale</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{rationale}</p>
                                </CardContent>
                            </Card>
                        ))}
                       </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Rationale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {initialWeeklyTopStocks.rationale}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
