"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, Tooltip, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

interface StockChartProps {
  data: { month: string; price: number }[];
}

export function StockChart({ data }: StockChartProps) {
  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
         <ResponsiveContainer width="100%" height="100%">
            <LineChart
            data={data}
            margin={{
                top: 5,
                right: 20,
                left: 0,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['dataMin - 10', 'dataMax + 10']}
                tickFormatter={(value) => `$${value}`}
             />
            <Tooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: "3 3" }}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
                dataKey="price"
                type="monotone"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
            />
            </LineChart>
         </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
