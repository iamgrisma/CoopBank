"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { format } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

type Transaction = {
  id: string;
  member_name: string;
  type: string;
  status: 'Completed' | 'Pending';
  date: string;
  amount: number;
};

export function CashFlowChart({ transactions }: { transactions: Transaction[] }) {
  const chartData = transactions.map(t => ({
    date: format(new Date(t.date), "MMM d"),
    amount: t.amount,
  })).reverse(); // reverse to show oldest first

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
        <CardDescription>
          A chart of the most recent transactions from your database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="dot"
                formatter={(value, name, props) => {
                   return (
                    <div className="flex flex-col">
                        <span>{props.payload.date}</span>
                        <span className="font-bold text-lg">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR', minimumFractionDigits: 0 }).format(value as number).replace('NPR', 'रु')}</span>
                    </div>
                   )
                }}
              />}
            />
            <Area
              dataKey="amount"
              type="natural"
              fill="var(--color-amount)"
              fillOpacity={0.4}
              stroke="var(--color-amount)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
