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
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"

// Define a type for the transaction for better type-safety
type Transaction = {
  id: string;
  member_name: string;
  type: string;
  status: 'Completed' | 'Pending';
  date: string;
  amount: number;
};

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          A log of the most recent financial activities from your database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.member_name}</div>
                  <div className="block sm:hidden text-sm text-muted-foreground">{transaction.type}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{transaction.type}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge 
                    variant={transaction.status === "Completed" ? "default" : "secondary"} 
                    className={transaction.status === "Completed" ? "bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/10" : "bg-yellow-500/20 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/10"}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{format(new Date(transaction.date), "yyyy-MM-dd")}</TableCell>
                <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
