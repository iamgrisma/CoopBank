
'use client';
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, differenceInYears } from "date-fns";
import { AtSign, Cake, HandCoins, MapPin, Phone, PlusCircle, Scale, TrendingDown, TrendingUp, User, UserCheck, Wallet, Briefcase, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddShare } from "@/components/shares/add-share";
import { Button } from "@/components/ui/button";
import { AddSaving } from "@/components/savings/add-saving";
import { AddLoan } from "@/components/loans/add-loan";
import { Badge } from "@/components/ui/badge";
import { LoanDetailsDialog } from "@/components/loans/loan-details-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calculateAccruedInterestForAllSavings } from "@/lib/saving-utils";
import { formatCurrency } from "@/lib/utils";
import { AccountStatement } from "@/components/members/account-statement";
import { generateDynamicAmortizationSchedule, Repayment } from "@/lib/loan-utils";
import { useState, useEffect } from 'react';

type Member = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  join_date: string;
  dob: string | null;
  nominee_name: string | null;
  nominee_relationship: string | null;
  photo_url: string | null;
  identification_type: string | null;
  identification_number: string | null;
  identification_issue_date: string | null;
};
type Share = any;
type Saving = any;
type Loan = any;
type LoanScheme = any;
type SavingScheme = any;
type Transaction = any;

interface MemberProfileClientPageProps {
  member: Member;
  shares: Share[];
  savings: Saving[];
  loans: Loan[];
  loanSchemes: LoanScheme[];
  savingSchemes: SavingScheme[];
  transactions: Transaction[];
  repayments: Repayment[];
}

const getInitials = (name: string | undefined | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.substring(0, 2);
}
  
const formatAccountNumber = (accountNumber: string | null) => {
    if (!accountNumber) return 'N/A';
    const match = accountNumber.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{7})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`;
    }
    return accountNumber;
}

function ProfileInfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium break-words">{value}</p>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}


export default function MemberProfileClientPage({
  member,
  shares,
  savings,
  loans,
  loanSchemes,
  savingSchemes,
  transactions,
  repayments,
}: MemberProfileClientPageProps) {

  const [loanSummaries, setLoanSummaries] = useState({
      totalRepaid: 0,
      remainingPrincipal: 0,
      totalOverdue: 0
  });
  
  useEffect(() => {
    let totalRepaid = 0;
    let remainingPrincipal = 0;
    let totalOverdue = 0;

    loans.forEach(loan => {
        const loanRepayments = repayments.filter(r => r.loan_id === loan.id);
        totalRepaid += loanRepayments.reduce((sum, r) => sum + r.amount_paid, 0);

        const principalPaid = loanRepayments.reduce((sum, r) => sum + r.principal_paid, 0);
        remainingPrincipal += (loan.amount - principalPaid);

        if (loan.status === 'Active') {
            const schedule = generateDynamicAmortizationSchedule(
                loan.amount,
                loan.interest_rate,
                loan.loan_term_months,
                new Date(loan.disbursement_date),
                loanRepayments,
                loan.repayment_frequency || 'Monthly',
                loan.grace_period_months || 0
            );
            const overdueAmount = schedule
                .filter(inst => inst.status === 'OVERDUE' || inst.status === 'DUE' || inst.status === 'PARTIALLY_PAID')
                .reduce((sum, inst) => sum + inst.totalDue, 0);
            totalOverdue += overdueAmount;
        }
    });

    setLoanSummaries({
        totalRepaid,
        remainingPrincipal,
        totalOverdue
    });
  }, [loans, repayments]);
  
  const activeLoans = loans.filter(l => !['Paid Off', 'Rejected', 'Restructured'].includes(l.status));
  
  const totalSharesValue = shares.reduce((acc, share) => acc + (share.number_of_shares * share.face_value), 0);
  const totalSharesCount = shares.reduce((acc, share) => acc + share.number_of_shares, 0);

  const totalSavings = savings.reduce((acc, saving) => acc + saving.amount, 0);
  
  const totalLoanAmount = activeLoans.reduce((acc, loan) => acc + loan.amount, 0);
  
  const totalAccruedInterest = calculateAccruedInterestForAllSavings(savings);

  const savingsByScheme = savings.reduce((acc, saving) => {
    const schemeName = saving.saving_schemes?.name || 'Uncategorized';
    if (!acc[schemeName]) {
        acc[schemeName] = {
            deposits: [],
            interest_rate: saving.saving_schemes?.interest_rate || 0,
        };
    }
    acc[schemeName].deposits.push(saving);
    return acc;
  }, {} as Record<string, { deposits: typeof savings, interest_rate: number }>);


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card className="w-full overflow-hidden">
             <CardContent className="p-0 flex flex-col md:flex-row items-start">
                <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Avatar className="h-28 w-28 border-4 border-background">
                        {member.photo_url && <AvatarImage src={member.photo_url} alt={member.name || 'member photo'} />}
                        <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex-grow p-6">
                    <h1 className="text-3xl font-bold font-headline text-primary">{member.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span>A/C: <span className="font-mono">{formatAccountNumber(member.account_number)}</span></span>
                        <span className="hidden sm:inline">|</span>
                        <span>Joined: {format(new Date(member.join_date), "do MMM, yyyy")}</span>
                    </div>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4">
                        <ProfileInfoItem icon={AtSign} label="Email" value={member.email || 'N/A'} />
                        <ProfileInfoItem icon={Phone} label="Phone" value={member.phone || 'N/A'} />
                        <ProfileInfoItem icon={MapPin} label="Address" value={member.address || 'N/A'} />
                        <ProfileInfoItem 
                            icon={Cake} 
                            label="Date of Birth" 
                            value={member.dob ? `${format(new Date(member.dob), "do MMM, yyyy")} (${differenceInYears(new Date(), new Date(member.dob))} years)` : 'N/A'} 
                        />
                     </div>
                </div>
            </CardContent>
        </Card>

      <div className="grid gap-6 md:grid-cols-1">
        <div>
            <Tabs defaultValue="loans" className="w-full">
                <div className="overflow-x-auto">
                    <TabsList>
                        <TabsTrigger value="loans">Loans</TabsTrigger>
                        <TabsTrigger value="savings">Savings</TabsTrigger>
                        <TabsTrigger value="shares">Shares</TabsTrigger>
                        <TabsTrigger value="statement">Statement</TabsTrigger>
                        <TabsTrigger value="kyc">KYC</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="shares">
                    <Card>
                        <CardHeader className="flex flex-row flex-wrap items-center">
                            <div className="grid gap-2 flex-grow">
                                <CardTitle>Share Holdings</CardTitle>
                            </div>
                            <div className="ml-auto flex items-center gap-2 mt-2 sm:mt-0">
                                <AddShare
                                  triggerButton={<Button size="sm"><PlusCircle className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Add Share</span></Button>}
                                  defaultMember={{ id: member.id, name: member.name || '' }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <StatCard title="Total Shares" value={totalSharesCount.toString()} icon={Briefcase} />
                                <StatCard title="Total Value" value={formatCurrency(totalSharesValue)} icon={Wallet} />
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cert. No</TableHead>
                                            <TableHead>No. of Shares</TableHead>
                                            <TableHead>Face Value</TableHead>
                                            <TableHead>Purchase Date</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shares.map(share => (
                                            <TableRow key={share.id}>
                                                <TableCell>{share.certificate_number}</TableCell>
                                                <TableCell>{share.number_of_shares}</TableCell>
                                                <TableCell>{formatCurrency(share.face_value)}</TableCell>
                                                <TableCell>{format(new Date(share.purchase_date), "do MMM, yy")}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(share.number_of_shares * share.face_value)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="savings">
                    <Card>
                        <CardHeader className="flex flex-row flex-wrap items-center">
                            <div className="grid gap-2 flex-grow">
                                <CardTitle>Savings Accounts</CardTitle>
                            </div>
                            <div className="ml-auto flex items-center gap-2 mt-2 sm:mt-0">
                                <AddSaving
                                  savingSchemes={savingSchemes}
                                  triggerButton={<Button size="sm"><PlusCircle className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Add Deposit</span></Button>}
                                  defaultMember={{ id: member.id, name: member.name || '' }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <StatCard title="Total Savings Balance" value={formatCurrency(totalSavings)} icon={Wallet} />
                                <Card className="bg-amber-50 dark:bg-amber-900/20">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400">Total Accrued Interest</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{formatCurrency(totalAccruedInterest)}</div>
                                        <p className="text-xs text-amber-600 dark:text-amber-500">Interest earned but not yet paid out.</p>
                                    </CardContent>
                                </Card>
                            </div>
                           <Accordion type="multiple" className="w-full" defaultValue={Object.keys(savingsByScheme)}>
                                {Object.entries(savingsByScheme).map(([schemeName, schemeData]) => (
                                    <AccordionItem value={schemeName} key={schemeName}>
                                        <AccordionTrigger className="text-lg font-semibold">{schemeName}</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Deposit Date</TableHead>
                                                            <TableHead>Notes</TableHead>
                                                            <TableHead className="text-right">Amount</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {schemeData.deposits.map(saving => (
                                                            <TableRow key={saving.id}>
                                                                <TableCell>{format(new Date(saving.deposit_date), "do MMM, yy")}</TableCell>
                                                                <TableCell>{saving.notes}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(saving.amount)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="loans">
                    <Card>
                        <CardHeader className="flex flex-row flex-wrap items-center">
                            <div className="grid gap-2 flex-grow">
                                <CardTitle>Loan Accounts</CardTitle>
                            </div>
                            <div className="ml-auto flex items-center gap-2 mt-2 sm:mt-0">
                                 <AddLoan
                                    members={[{id: member.id, name: member.name!}]}
                                    loanSchemes={loanSchemes}
                                    defaultMember={{ id: member.id, name: member.name || '' }}
                                    triggerButton={<Button size="sm"><PlusCircle className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Add Loan</span></Button>}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard title="Total Loaned" value={formatCurrency(totalLoanAmount)} icon={HandCoins} />
                                <StatCard title="Total Repaid" value={formatCurrency(loanSummaries.totalRepaid)} icon={Wallet} />
                                <StatCard title="Remaining Principal" value={formatCurrency(loanSummaries.remainingPrincipal)} icon={Scale} />
                                <Card className={loanSummaries.totalOverdue > 0 ? "border-destructive" : ""}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Overdue</CardTitle>
                                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={cn('text-2xl font-bold', loanSummaries.totalOverdue > 0 && "text-destructive")}>
                                            {formatCurrency(loanSummaries.totalOverdue)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="overflow-x-auto">
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Scheme</TableHead>
                                            <TableHead>Disbursed</TableHead>
                                            <TableHead>Term</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loans.map(loan => (
                                            <TableRow key={loan.id}>
                                                <TableCell>{loan.loan_schemes?.name}</TableCell>
                                                <TableCell>{format(new Date(loan.disbursement_date), "do MMM, yy")}</TableCell>
                                                <TableCell>{loan.loan_term_months} months</TableCell>
                                                <TableCell><Badge variant="outline">{loan.status}</Badge></TableCell>
                                                <TableCell className="text-right">{formatCurrency(loan.amount)}</TableCell>
                                                <TableCell className="text-right">
                                                    <LoanDetailsDialog loan={{...loan, members: {id: member.id, name: member.name!}}} allLoanSchemes={loanSchemes} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="statement">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Statement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AccountStatement transactions={transactions} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="kyc">
                     <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <UserCheck className="h-10 w-10 text-primary" />
                                <div className="grid gap-1">
                                    <CardTitle>KYC Details</CardTitle>
                                    <p className="text-muted-foreground">Detailed member information for compliance.</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="grid gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                      <h3 className="font-semibold mb-1 text-sm">Identification Document</h3>
                                      <p className="text-sm">{member.identification_type || 'N/A'}: {member.identification_number || 'N/A'}</p>
                                  </div>
                                   <div>
                                      <h3 className="font-semibold mb-1 text-sm">Issue Date</h3>
                                      <p className="text-sm">{member.identification_issue_date ? format(new Date(member.identification_issue_date), "do MMMM, yyyy") : 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <h3 className="font-semibold mb-1 text-sm">Nominee</h3>
                                    <p className="text-sm">{member.nominee_name || 'Not specified'}</p>
                                 </div>
                                <div>
                                    <h3 className="font-semibold mb-1 text-sm">Nominee Relationship</h3>
                                    <p className="text-sm">{member.nominee_relationship || 'Not specified'}</p>
                                 </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">KYC Document Scan</h3>
                                    {member.kyc_document_url ? (
                                        <div className="relative h-64 w-full">
                                            <Image src={member.kyc_document_url} alt="KYC Document" fill style={{objectFit:"contain"}} className="rounded-md border"/>
                                        </div>
                                    ) : (
                                        <div className="h-48 w-full rounded-md border-2 border-dashed flex items-center justify-center">
                                          <div className="text-center text-muted-foreground">
                                            <UserCheck className="mx-auto h-8 w-8" />
                                            <p>No KYC document uploaded.</p>
                                          </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </main>
  );
}
