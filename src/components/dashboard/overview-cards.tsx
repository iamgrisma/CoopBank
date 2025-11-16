import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HandCoins, Landmark, UsersRound, Wallet } from "lucide-react"

const overviewData = [
  {
    icon: UsersRound,
    title: "Total Members",
    value: "1,245",
    description: "+20.1% from last month",
  },
  {
    icon: Landmark,
    title: "Total Shares",
    value: "रु 2,350,000",
    description: "+180.1% from last month",
  },
  {
    icon: Wallet,
    title: "Total Savings",
    value: "रु 12,234,000",
    description: "+19% from last month",
  },
  {
    icon: HandCoins,
    title: "Total Loans",
    value: "रु 8,543,000",
    description: "+21% from last month",
  },
]

export function OverviewCards() {
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
