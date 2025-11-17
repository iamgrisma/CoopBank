
"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns"
import { EditMember } from "./edit-member";

type Member = {
  id: string;
  name: string;
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
  province?: { name: string } | null;
  district?: { name: string } | null;
  local_level?: { name: string } | null;
};

const getInitials = (name: string | undefined) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.substring(0, 2);
}

const formatFullAddress = (member: Member) => {
    const parts = [
        member.address,
        member.local_level?.name,
        member.district?.name,
        member.province?.name
    ].filter(Boolean); // Filter out null/undefined parts
    
    return parts.join(', ') || 'N/A';
}


export function MembersTable({ members }: { members: Member[] }) {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Contact</TableHead>
            <TableHead className="hidden sm:table-cell">Address</TableHead>
            <TableHead className="hidden lg:table-cell">Join Date</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No members found. Add one to get started!
                </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        {member.photo_url && <AvatarImage src={member.photo_url} alt={member.name} />}
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col">
                        <Link href={`/members/${member.id}`} className="hover:underline text-primary font-medium leading-tight">
                        {member.name}
                        </Link>
                        <div className="text-muted-foreground text-sm md:hidden">{member.phone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col break-all">
                    <span>{member.email}</span>
                    <span className="text-muted-foreground">{member.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{formatFullAddress(member)}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {format(new Date(member.join_date), "yyyy-MM-dd")}
                </TableCell>
                <TableCell className="text-right">
                  <EditMember member={member} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
