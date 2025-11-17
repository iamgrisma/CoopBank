import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FinancialStatements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Statements</CardTitle>
        <CardDescription>
          View and export key financial reports.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button asChild variant="outline" className="justify-between">
          <Link href="/reports/trial-balance">
            <span>Trial Balance</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-between">
          <Link href="/reports/profit-and-loss">
            <span>Profit &amp; Loss</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-between">
          <Link href="/reports/balance-sheet">
            <span>Balance Sheet</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
