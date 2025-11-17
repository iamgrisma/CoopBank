import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils";
import { HandCoins, Landmark, UsersRound, Wallet } from "lucide-react"

type OverviewData = {
  members: number;
  shares: number;
  savings: number;
  loans: number;
}

export function OverviewCards({ overview }: { overview: OverviewData }) {
  const overviewData = [
    {
      icon: UsersRound,
      title: "Total Members",
      value: overview.members.toLocaleString('en-IN'),
      description: "All registered members",
    },
    {
      icon: Landmark,
      title: "Total Shares",
      value: formatCurrency(overview.shares),
      description: "Total share capital value",
    },
    {
      icon: Wallet,
      title: "Total Savings",
      value: formatCurrency(overview.savings),
      description: "Across all savings accounts",
    },
    {
      icon: HandCoins,
      title: "Total Loans",
      value: formatCurrency(overview.loans),
      description: "Total outstanding loan amount",
    },
  ]

  return (
    <>
      {overviewData.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
