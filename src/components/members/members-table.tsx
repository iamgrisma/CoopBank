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
};

const getInitials = (name: string | undefined) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.substring(0, 2);
}


export function MembersTable({ members }: { members: Member[] }) {
  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Join Date</TableHead>
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
                    <Link href={`/members/${member.id}`} className="hover:underline text-primary">
                      {member.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{member.email}</span>
                    <span className="text-muted-foreground">{member.phone}</span>
                  </div>
                </TableCell>
                <TableCell>{member.address}</TableCell>
                <TableCell>
                  {format(new Date(member.join_date), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>
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
