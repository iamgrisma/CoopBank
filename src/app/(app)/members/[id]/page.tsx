import { notFound } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { AtSign, Cake, MapPin, Phone, PlusCircle, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddShare } from "@/components/shares/add-share";
import { Button } from "@/components/ui/button";
import { AddSaving } from "@/components/savings/add-saving";
import { AddLoan } from "@/components/loans/add-loan";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { LoanDetailsDialog } from "@/components/loans/loan-details-dialog";

async function getMember(id: string) {
  const supabase = createSupabaseServerClient();
  // The tables are defined in supabase/setup.sql
  const { data: member, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !member) {
    notFound();
  }

  return member;
}

async function getShares(memberId: string) {
    const supabase = createSupabaseServerClient();
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

async function getSavings(memberId: string) {
    const supabase = createSupabaseServerClient();
    const { data: savings, error } = await supabase
        .from('savings')
        .select('*')
        .eq('member_id', memberId)
        .order('deposit_date', { ascending: false });

    if (error) {
        console.error('Error fetching savings:', error);
        return [];
    }
    return savings;
}

async function getLoans(memberId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      loan_schemes (name)
    `)
    .eq('member_id', memberId)
    .order('disbursement_date', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
  return data;
}

async function getLoanSchemes() {
    const supabase = createSupabaseServerClient();
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

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const member = await getMember(params.id);
  const shares = await getShares(params.id);
  const savings = await getSavings(params.id);
  const loans = await getLoans(params.id);
  const loanSchemes = await getLoanSchemes();

  const totalSharesValue = shares.reduce((acc, share) => acc + (share.number_of_shares * share.face_value), 0);
  const totalSharesCount = shares.reduce((acc, share) => acc + share.number_of_shares, 0);

  const totalSavings = savings.reduce((acc, saving) => acc + saving.amount, 0);
  
  const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.amount, 0);


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid auto-rows-max gap-4">
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
            </CardHeader>
            <CardContent className="text-sm">
                <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                        <AtSign className="h-4 w-4 text-muted-foreground" />
                        <span>{member.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{member.phone || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{member.address || 'No address provided'}</span>
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
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="shares">Shares</TabsTrigger>
                    <TabsTrigger value="savings">Savings</TabsTrigger>
                    <TabsTrigger value="loans">Loans</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="shares">
                    <Card>
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Share Holdings</CardTitle>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <AddShare
                                  triggerButton={<Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Share</Button>}
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
                                            <TableCell>{format(new Date(share.purchase_date), "do MMM, yyyy")}</TableCell>
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
                                <CardTitle>Savings Deposits</CardTitle>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <AddSaving
                                  triggerButton={<Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Deposit</Button>}
                                  defaultMember={{ id: member.id, name: member.name || '' }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="mb-4 grid grid-cols-1 gap-4">
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Savings Balance</h3>
                                    <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
                                </div>
                            </div>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deposit Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {savings.map(saving => (
                                        <TableRow key={saving.id}>
                                            <TableCell>{format(new Date(saving.deposit_date), "do MMM, yyyy")}</TableCell>
                                            <TableCell>{saving.notes}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(saving.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                                    triggerButton={<Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Loan</Button>}
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
                                            <TableCell>{format(new Date(loan.disbursement_date), "do MMM, yyyy")}</TableCell>
                                            <TableCell>{loan.loan_term_months} months</TableCell>
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
                <TabsContent value="details">
                     <Card>
                        <CardHeader>
                            <CardTitle>Personal & KYC Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="grid gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">KYC Document</h3>
                                    {member.kyc_document_url ? (
                                        <div className="relative h-64 w-full">
                                            <Image src={member.kyc_document_url} alt="KYC Document" fill objectFit="contain" className="rounded-md border"/>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No KYC document uploaded.</p>
                                    )}
                                </div>
                                 <div>
                                    <h3 className="font-semibold mb-2">Nominee</h3>
                                    <p className="text-sm">{member.nominee_name || 'Not specified'}</p>
                                 </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Nominee Relationship</h3>
                                    <p className="text-sm">{member.nominee_relationship || 'Not specified'}</p>
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
