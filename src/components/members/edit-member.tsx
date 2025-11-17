
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getProvinces, getDistricts, getLocalLevels } from "@/lib/data";

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
  province_code: string | null;
  district_code: string | null;
  local_level_code: string | null;
  identification_type: string | null;
  identification_number: string | null;
};

type Province = { id: number; name: string };
type District = { id: number; name: string; province_id: number };
type LocalLevel = { id: number; name: string; district_id: number };

const memberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  join_date: z.date({ required_error: "Join date is required." }),
  dob: z.date().optional().nullable(),
  nominee_name: z.string().optional(),
  nominee_relationship: z.string().optional(),
  province_code: z.string().min(1, "Please select a province."),
  district_code: z.string().min(1, "Please select a district."),
  local_level_code: z.string().optional(),
  identification_type: z.string().optional(),
  identification_number: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

async function updateMemberInDb(id: string, member: Omit<MemberFormValues, 'join_date' | 'dob'> & { join_date: string, dob?: string | null }) {
    const { data, error } = await supabase
        .from("members")
        .update(member)
        .eq('id', id)
        .select();
    
    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export function EditMember({ member }: { member: Member }) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [districts, setDistricts] = React.useState<District[]>([]);
  const [localLevels, setLocalLevels] = React.useState<LocalLevel[]>([]);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      address: member.address || "",
      join_date: new Date(member.join_date),
      dob: member.dob ? new Date(member.dob) : null,
      nominee_name: member.nominee_name || "",
      nominee_relationship: member.nominee_relationship || "",
      province_code: member.province_code || "3",
      district_code: member.district_code || "34",
      local_level_code: member.local_level_code || "3408",
      identification_type: member.identification_type || "CITIZENSHIP",
      identification_number: member.identification_number || "",
    },
  });

  const watchProvince = form.watch("province_code");
  const watchDistrict = form.watch("district_code");

  React.useEffect(() => {
    const fetchData = async () => {
        const provincesData = await getProvinces();
        setProvinces(provincesData);
        
        if (form.getValues("province_code")) {
            const districtsData = await getDistricts(Number(form.getValues("province_code")));
            setDistricts(districtsData);
        }

        if (form.getValues("district_code")) {
             const localLevelsData = await getLocalLevels(Number(form.getValues("district_code")));
             setLocalLevels(localLevelsData);
        }
    };
    if (open) {
        fetchData();
    }
  }, [open, form]);

  React.useEffect(() => {
    const fetchDistrictsForProvince = async () => {
        if (watchProvince) {
            const districtsData = await getDistricts(Number(watchProvince));
            setDistricts(districtsData);
            if (form.formState.isDirty) {
              form.setValue("district_code", "");
              form.setValue("local_level_code", "");
            }
        }
    }
    fetchDistrictsForProvince();
  }, [watchProvince, form]);

   React.useEffect(() => {
    const fetchLocalLevelsForDistrict = async () => {
        if (watchDistrict) {
            if (watchDistrict === "34") { // Sindhuli
                const localLevelsData = await getLocalLevels(Number(watchDistrict));
                setLocalLevels(localLevelsData);
            } else {
                setLocalLevels([]);
                if (form.formState.isDirty) {
                    form.setValue("local_level_code", "00");
                }
            }
        } else {
             setLocalLevels([]);
             if (form.formState.isDirty) {
                form.setValue("local_level_code", "");
             }
        }
    }
    fetchLocalLevelsForDistrict();
  }, [watchDistrict, form]);

  const onSubmit = async (values: MemberFormValues) => {
    setIsSubmitting(true);
    try {
        const memberData = {
            ...values,
            join_date: values.join_date.toISOString(),
            dob: values.dob ? values.dob.toISOString() : null,
        }
      await updateMemberInDb(member.id, memberData);
      toast({
        title: "Member Updated",
        description: `${values.name} has been successfully updated.`,
      });
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating member",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update the details for {member.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                        <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="province_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Province" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {provinces.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchProvince}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {districts.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="local_level_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Level</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value || ""} disabled={localLevels.length === 0}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Local Level" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {localLevels.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="join_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus/>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
             <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="identification_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CITIZENSHIP">Citizenship</SelectItem>
                        <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                        <SelectItem value="LICENSE">License</SelectItem>
                        <SelectItem value="PAN">PAN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="identification_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ID number" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="nominee_name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nominee Name</FormLabel>
                    <FormControl>
                        <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="nominee_relationship"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nominee Relationship</FormLabel>
                    <FormControl>
                        <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
