import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const transactions = [
  {
    name: "Aarav Sharma",
    type: "Loan Repayment",
    status: "Completed",
    date: "2024-07-29",
    amount: "रु 15,000.00",
  },
  {
    name: "Sunita Rai",
    type: "Savings Deposit",
    status: "Completed",
    date: "2024-07-29",
    amount: "रु 5,000.00",
  },
  {
    name: "Bikram Thapa",
    type: "Share Purchase",
    status: "Completed",
    date: "2024-07-28",
    amount: "रु 10,000.00",
  },
  {
    name: "Priya Gurung",
    type: "Loan Disbursement",
    status: "Pending",
    date: "2024-07-28",
    amount: "रु 200,000.00",
  },
  {
    name: "Rajesh K.C.",
    type: "Savings Withdrawal",
    status: "Completed",
    date: "2024-07-27",
    amount: "रु 2,500.00",
  },
   {
    name: "Anita Lama",
    type: "Fixed Deposit",
    status: "Completed",
    date: "2024-07-27",
    amount: "रु 50,000.00",
  },
]

export function RecentTransactions() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          A log of the most recent financial activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">{transaction.name}</div>
                </TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>
                  <Badge variant={transaction.status === "Completed" ? "default" : "secondary"} className={transaction.status === "Completed" ? "bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/10" : "bg-yellow-500/20 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/10"}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell className="text-right">{transaction.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
