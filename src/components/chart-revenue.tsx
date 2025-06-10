"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartRevenueProps {
  data: { month: string; applications: number }[];
  dateRange: { from: Date; to: Date } | null;
  totalApplicants: number;
}

const chartConfig = {
  applications: {
    label: "Applications",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartRevenue({
  data,
  dateRange,
  totalApplicants,
}: ChartRevenueProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="text-green-800">
          {dateRange
            ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
            : "Last 12 Months"}
        </CardDescription>
        <CardTitle className="text-3xl font-bold tracking-tight text-green-800">
          {totalApplicants.toLocaleString()} Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[3/1]">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: -16, right: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
              domain={[0, "dataMax"]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator />}
            />
            <Bar
              dataKey="applications"
              fill="rgb(22 163 74)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing total applications for the selected period
        </div>
      </CardFooter>
    </Card>
  );
}
