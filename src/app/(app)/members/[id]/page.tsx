

import { notFound } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { AtSign, Cake, MapPin, Phone, PlusCircle, TrendingUp, UserCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddShare } from "@/components/shares/add-share";
import { Button } from "@/components/ui/button";
import { AddSaving } from "@/components/savings/add-saving";
import { AddLoan } from "@/components/loans/add-loan";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { LoanDetailsDialog } from "@/components/loans/loan-details-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calculateAccruedInterestForAllSavings } from "@/lib/saving-utils";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getMember(supabase: SupabaseClient, id: string) {
  const { data: member, error } = await supabase
    .from("members")
    .select("*, district:districts(name), province:provinces(name), local_level:local_levels(name)")
    .eq("id", id)
    .single();

  if (error || !member) {
    notFound();
  }

  return member;
}

async function getShares(supabase: SupabaseClient, memberId: string) {
    const { data: shares, error } = await supabase
        .from('shares')
        .select('*')
        .eq('member_id', memberId)
        .order('purchase_date', { ascending: false });

    if (error) {
        console.error('Error fetching shares:', error);
        return [];
    }

    return shares;
}

async function getSavings(supabase: SupabaseClient, memberId: string) {
    const { data: savings, error } = await supabase
        .from('savings')
        .select(`
            *,
            saving_schemes (
                id,
                name,
                type,
                interest_rate
            )
        `)
        .eq('member_id', memberId)
        .order('deposit_date', { ascending: false });

    if (error) {
        console.error('Error fetching savings:', error);
        return [];
    }
    return savings;
}

async function getLoans(supabase: SupabaseClient, memberId: string) {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      loan_schemes (name),
      members (name)
    `)
    .eq('member_id', memberId)
    .order('disbursement_date', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
  return data;
}

async function getLoanSchemes(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('loan_schemes')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching loan schemes:', error);
        return [];
    }
    return data;
}

async function getSavingSchemes(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('saving_schemes')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching saving schemes:', error);
        return [];
    }
    return data;
}


const getInitials = (name: string | undefined) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.substring(0, 2);
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2,
    }).format(amount).replace('NPR', 'रु');
  }
  
const formatAccountNumber = (accountNumber: string | null) => {
    if (!accountNumber) return 'N/A';
    // Format: xxx-xx-xx-xx-xxxxxxx
    const match = accountNumber.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{7})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`;
    }
    return accountNumber;
}

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const member = await getMember(supabase, params.id);
  const shares = await getShares(supabase, params.id);
  const savings = await getSavings(supabase, params.id);
  const loans = await getLoans(supabase, params.id);
  const loanSchemes = await getLoanSchemes(supabase);
  const savingSchemes = await getSavingSchemes(supabase);

  const totalSharesValue = shares.reduce((acc, share) => acc + (share.number_of_shares * share.face_value), 0);
  const totalSharesCount = shares.reduce((acc, share) => acc + share.number_of_shares, 0);

  const totalSavings = savings.reduce((acc, saving) => acc + saving.amount, 0);
  const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.amount, 0);
  
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
  
  const fullAddress = [
    member.address,
    member.local_level?.name,
    member.district?.name,
    member.province?.name
  ].filter(Boolean).join(', ');


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid auto-rows-max gap-4 lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                    {member.photo_url && <AvatarImage src={member.photo_url} alt={member.name || 'member photo'} />}
                    <AvatarFallback className="text-3xl">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{member.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Joined on {format(new Date(member.join_date), "do MMMM, yyyy")}
                </p>
                 <p className="text-xs text-muted-foreground pt-2">
                    A/C: {formatAccountNumber(member.account_number)}
                </p>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="grid gap-3">
                    <div className="flex items-start gap-3">
                        <AtSign className="h-4 w-4 text-muted-foreground mt-1" />
                        <span className="break-all">{member.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{member.phone || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <span>{fullAddress || 'No address provided'}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <Cake className="h-4 w-4 text-muted-foreground" />
                        <span>{member.dob ? format(new Date(member.dob), "do MMMM, yyyy") : 'Not specified'}</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
            <Tabs defaultValue="shares">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
                    <TabsTrigger value="shares">Shares</TabsTrigger>
                    <TabsTrigger value="savings">Savings</TabsTrigger>
                    <TabsTrigger value="loans">Loans</TabsTrigger>
                    <TabsTrigger value="statement" className="hidden sm:inline-flex">Statement</TabsTrigger>
                    <TabsTrigger value="kyc" className="hidden sm:inline-flex">KYC</TabsTrigger>
                </TabsList>
                <TabsContent value="shares">
                    <Card>
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Share Holdings</CardTitle>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <AddShare
                                  triggerButton={<Button size="sm"><PlusCircle className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Add Share</span></Button>}
                                  defaultMember={{ id: member.id, name: member.name || '' }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Shares</h3>
                                    <p className="text-2xl font-bold">{totalSharesCount}</p>
                                </div>
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
                                    <p className="text-2xl font-bold">{formatCurrency(totalSharesValue)}</p>
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cert. No</TableHead>
                                        <TableHead className="hidden sm:table-cell">No. of Shares</TableHead>
                                        <TableHead className="hidden md:table-cell">Face Value</TableHead>
                                        <TableHead>Purchase Date</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shares.map(share => (
                                        <TableRow key={share.id}>
                                            <TableCell>{share.certificate_number}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{share.number_of_shares}</TableCell>
                                            <TableCell className="hidden md:table-cell">{formatCurrency(share.face_value)}</TableCell>
                                            <TableCell>{format(new Date(share.purchase_date), "do MMM, yy")}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(share.number_of_shares * share.face_value)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="savings">
                    <Card>
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Savings Accounts</CardTitle>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <AddSaving
                                  savingSchemes={savingSchemes}
                                  triggerButton={<Button size="sm"><PlusCircle className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Add Deposit</span></Button>}
                                  defaultMember={{ id: member.id, name: member.name || '' }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Savings Balance</h3>
                                    <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
                                </div>
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
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Deposit Date</TableHead>
                                                        <TableHead className="hidden sm:table-cell">Notes</TableHead>
                                                        <TableHead className="text-right">Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {schemeData.deposits.map(saving => (
                                                        <TableRow key={saving.id}>
                                                            <TableCell>{format(new Date(saving.deposit_date), "do MMM, yy")}</TableCell>
                                                            <TableCell className="hidden sm:table-cell">{saving.notes}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(saving.amount)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="loans">
                    <Card>
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Loan Accounts</CardTitle>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                 <AddLoan
                                    loanSchemes={loanSchemes}
                                    defaultMember={{ id: member.id, name: member.name || '' }}
                                    triggerButton={<Button size="sm"><PlusCircle className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Add Loan</span></Button>}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-1 gap-4">
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Loan Amount</h3>
                                    <p className="text-2xl font-bold">{formatCurrency(totalLoanAmount)}</p>
                                </div>
                            </div>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Scheme</TableHead>
                                        <TableHead className="hidden sm:table-cell">Disbursed</TableHead>
                                        <TableHead className="hidden md:table-cell">Term</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loans.map(loan => (
                                        <TableRow key={loan.id}>
                                            <TableCell>{loan.loan_schemes?.name}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{format(new Date(loan.disbursement_date), "do MMM, yy")}</TableCell>
                                            <TableCell className="hidden md:table-cell">{loan.loan_term_months} months</TableCell>
                                            <TableCell><Badge variant="outline">{loan.status}</Badge></TableCell>
                                            <TableCell className="text-right">{formatCurrency(loan.amount)}</TableCell>
                                            <TableCell className="text-right">
                                                <LoanDetailsDialog loan={loan} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="statement">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Statement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Feature coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="kyc">
                     <Card>
                        <CardHeader>
                            <CardTitle>KYC Details</CardTitle>
                             <p className="text-muted-foreground">Detailed member information for compliance.</p>
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

    