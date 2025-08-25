import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TUpdateOrganizationSchema,
  UpdateOrganizationSchema,
  TAddMemberSchema,
  AddMemberSchema,
} from "@/types";
import {
  updateOrganization,
  getOrganizationMembers,
  addOrganizationMember,
} from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@/context/OrganizationContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrganizationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  const organizationForm = useForm<TUpdateOrganizationSchema>({
    resolver: zodResolver(UpdateOrganizationSchema),
    values: {
      name: activeOrganization?.name || "",
    },
  });

  const addMemberForm = useForm<TAddMemberSchema>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["members", activeOrganization?.uuid],
    queryFn: () => getOrganizationMembers(activeOrganization!.uuid),
    enabled: !!activeOrganization,
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: (data: TUpdateOrganizationSchema) =>
      updateOrganization(activeOrganization!.uuid, data),
    onSuccess: () => {
      toast({
        title: "Organization Updated",
        description: "Your organization has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: TAddMemberSchema) =>
      addOrganizationMember(activeOrganization!.uuid, data),
    onSuccess: () => {
      toast({
        title: "Member Added",
        description: "The new member has been added to the organization.",
      });
      queryClient.invalidateQueries({
        queryKey: ["members", activeOrganization?.uuid],
      });
      addMemberForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    },
  });

  const onOrganizationSubmit = (data: TUpdateOrganizationSchema) => {
    updateOrganizationMutation.mutate(data);
  };

  const onAddMemberSubmit = (data: TAddMemberSchema) => {
    addMemberMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
        <p className="text-muted-foreground">
          Manage your organization settings.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Manage your organization's information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...organizationForm}>
              <form
                onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={organizationForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={updateOrganizationMutation.isPending}
                >
                  {updateOrganizationMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>
              View and manage your organization's members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMembers ? (
              <p>Loading members...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.map((member) => (
                    <TableRow key={member.uuid}>
                      <TableCell>
                        {member.user.first_name} {member.user.last_name}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Add Member</CardTitle>
            <CardDescription>
              Invite a new member to your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...addMemberForm}>
              <form
                onSubmit={addMemberForm.handleSubmit(onAddMemberSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={addMemberForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addMemberForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={addMemberMutation.isPending}>
                  {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
