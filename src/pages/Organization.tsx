import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  OrganizationInvite,
  TUpdateMemberRoleSchema,
  UpdateMemberRoleSchema,
  OrganizationMember,
} from "@/types";
import {
  updateOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  updateMemberRole,
  removeMember,
} from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizations } from "@/hooks/useOrganizations";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrganizationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedOrganization } = useOrganizations();
  const [activeTab, setActiveTab] = useState("details");

  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);

  const organizationForm = useForm<TUpdateOrganizationSchema>({
    resolver: zodResolver(UpdateOrganizationSchema),
    values: {
      name: selectedOrganization?.name || "",
    },
  });

  const addMemberForm = useForm<TAddMemberSchema>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const updateMemberRoleForm = useForm<TUpdateMemberRoleSchema>({
    resolver: zodResolver(UpdateMemberRoleSchema),
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["members", selectedOrganization?.uuid],
    queryFn: () => getOrganizationMembers(selectedOrganization!.uuid),
    enabled: !!selectedOrganization,
  });

  const { data: sentInvites, isLoading: isLoadingSentInvites } = useQuery({
    queryKey: ["invitations", "sent"],
    queryFn: () => getInvitations("sent"),
    enabled: !!selectedOrganization,
  });

  const { data: receivedInvites, isLoading: isLoadingReceivedInvites } = useQuery({
    queryKey: ["invitations", "received"],
    queryFn: () => getInvitations("received"),
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: (data: TUpdateOrganizationSchema) =>
      updateOrganization(selectedOrganization!.uuid, data),
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

  const acceptInvitationMutation = useMutation({
    mutationFn: (token: string) => acceptInvitation(token),
    onSuccess: () => {
      toast({
        title: "Invitation Accepted",
        description: "You have successfully joined the organization.",
      });
      queryClient.invalidateQueries({
        queryKey: ["invitations", "received"],
      });
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

  const declineInvitationMutation = useMutation({
    mutationFn: (token: string) => declineInvitation(token),
    onSuccess: () => {
      toast({
        title: "Invitation Declined",
        description: "You have declined the invitation.",
      });
      queryClient.invalidateQueries({
        queryKey: ["invitations", "received"],
      });
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

  const cancelInvitationMutation = useMutation({
    mutationFn: (token: string) => cancelInvitation(token),
    onSuccess: () => {
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled.",
      });
      queryClient.invalidateQueries({
        queryKey: ["invitations", "sent"],
      });
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

  const updateMemberRoleMutation = useMutation({
    mutationFn: (data: TUpdateMemberRoleSchema) =>
      updateMemberRole(selectedOrganization!.uuid, editingMember!.uuid, data),
    onSuccess: () => {
      toast({
        title: "Member Role Updated",
        description: "The member's role has been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["members", selectedOrganization?.uuid],
      });
      setEditingMember(null);
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

  const removeMemberMutation = useMutation({
    mutationFn: (memberUuid: string) =>
      removeMember(selectedOrganization!.uuid, memberUuid),
    onSuccess: () => {
      toast({
        title: "Member Removed",
        description: "The member has been removed from the organization.",
      });
      queryClient.invalidateQueries({
        queryKey: ["members", selectedOrganization?.uuid],
      });
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
      addOrganizationMember(selectedOrganization!.uuid, data),
    onSuccess: () => {
      toast({
        title: "Member Invited",
        description: "The new member has been invited to the organization.",
      });
      queryClient.invalidateQueries({
        queryKey: ["invitations", "sent"],
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

  const onUpdateMemberRoleSubmit = (data: TUpdateMemberRoleSchema) => {
    updateMemberRoleMutation.mutate(data);
  };

  // Function to truncate text longer than 20 characters
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderMembers = () => {
    if (isLoadingMembers) {
      return <p className="text-xs sm:text-sm">Loading members...</p>;
    }

    if (!members || members.length === 0) {
      return (
        <Alert>
          <AlertDescription>
            No members found in this organization.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {members?.map((member) => (
            <Card key={member.uuid} className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
                    {member.user.first_name} {member.user.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <p className="text-sm capitalize bg-gray-100 px-2 py-1 rounded-md">
                  {member.role}
                </p>
              </div>

              {editingMember?.uuid === member.uuid ? (
                <Form {...updateMemberRoleForm}>
                  <form
                    onSubmit={updateMemberRoleForm.handleSubmit(
                      onUpdateMemberRoleSubmit
                    )}
                    className="space-y-3"
                  >
                    <FormField
                      control={updateMemberRoleForm.control}
                      name="role"
                      defaultValue={member.role}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Role</FormLabel>
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
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateMemberRoleMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingMember(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Joined: {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingMember(member)}
                    >
                      Edit Role
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMemberMutation.mutate(member.uuid)}
                      disabled={removeMemberMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Desktop View: Table */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[120px]">Role</TableHead>
              <TableHead className="w-[150px]">Joined At</TableHead>
              <TableHead className="text-right w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member.uuid}>
                <TableCell className="font-medium">
                  {truncateText(
                    `${member.user.first_name} ${member.user.last_name}`
                  )}
                </TableCell>
                <TableCell>{truncateText(member.user.email)}</TableCell>
                <TableCell className="capitalize">
                  {editingMember?.uuid === member.uuid ? (
                    <Form {...updateMemberRoleForm}>
                      <form
                        onSubmit={updateMemberRoleForm.handleSubmit(
                          onUpdateMemberRoleSubmit
                        )}
                        className="flex items-center gap-2"
                      >
                        <FormField
                          control={updateMemberRoleForm.control}
                          name="role"
                          defaultValue={member.role}
                          render={({ field }) => (
                            <FormItem>
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
                                  <SelectItem value="member">
                                    Member
                                  </SelectItem>
                                  <SelectItem value="owner">Owner</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={updateMemberRoleMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingMember(null)}
                        >
                          Cancel
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    truncateText(member.role)
                  )}
                </TableCell>
                <TableCell>
                  {new Date(member.joined_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingMember(member)}
                    disabled={editingMember?.uuid === member.uuid}
                  >
                    Edit Role
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeMemberMutation.mutate(member.uuid)}
                    disabled={removeMemberMutation.isPending}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  };

  const renderInvitesList = (invites: OrganizationInvite[] | undefined, type: 'received' | 'sent') => {
    if (!invites) return null;
    
    if (type === 'received') {
      return invites.map((invite) => (
        <Card key={invite.token}>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">{invite.organization_name}</p>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
                  <p className="text-sm text-muted-foreground">From: {invite.sent_by_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => acceptInvitationMutation.mutate(invite.token)}
                  disabled={acceptInvitationMutation.isPending}
                  size="sm"
                >
                  Accept
                </Button>
                <Button
                  onClick={() => declineInvitationMutation.mutate(invite.token)}
                  disabled={declineInvitationMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ));
    } else {
      return invites.map((invite) => (
        <Card key={invite.token}>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">{invite.email}</p>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
                  <p className="text-sm text-muted-foreground">
                    Sent: {new Date(invite.created).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => cancelInvitationMutation.mutate(invite.token)}
                disabled={cancelInvitationMutation.isPending}
                variant="destructive"
                size="sm"
              >
                Cancel Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      ));
    }
  };

  const renderInvitesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Organization Invites</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Manage invitations to your organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Received Invites Section */}
        <div>
          <h3 className="font-medium mb-4">Invites Received</h3>
          {isLoadingReceivedInvites ? (
            <p className="text-sm">Loading invites...</p>
          ) : !receivedInvites || receivedInvites.length === 0 ? (
            <Alert>
              <AlertDescription>
                You have no pending invitations.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {renderInvitesList(receivedInvites, 'received')}
            </div>
          )}
        </div>

        {/* Sent Invites Section */}
        <div>
          <h3 className="font-medium mb-4">Invites Sent</h3>
          {isLoadingSentInvites ? (
            <p className="text-sm">Loading invites...</p>
          ) : !sentInvites || sentInvites.length === 0 ? (
            <Alert>
              <AlertDescription>
                No pending invites have been sent.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {renderInvitesList(sentInvites, 'sent')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Organization</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your organization settings.
          </p>
        </div>
      </div>

      {/* Mobile and Tablet View: Dropdown */}
      <div className="lg:hidden space-y-4">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="details" className="text-sm">Organization Details</SelectItem>
            <SelectItem value="members" className="text-sm">Members</SelectItem>
            <SelectItem value="add" className="text-sm">Add Member</SelectItem>
            <SelectItem value="invites" className="text-sm">Invites</SelectItem>
          </SelectContent>
        </Select>

        {activeTab === "details" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Organization Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
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
                        <FormLabel className="text-xs sm:text-sm">Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={updateOrganizationMutation.isPending}
                    className="text-sm"
                  >
                    {updateOrganizationMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {activeTab === "members" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Organization Members</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage your organization's members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMembers()}
            </CardContent>
          </Card>
        )}

        {activeTab === "invites" && renderInvitesSection()}

        {activeTab === "add" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Invite Member</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
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
                        <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="text-sm" />
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
                        <FormLabel className="text-xs sm:text-sm">Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin" className="text-sm">Admin</SelectItem>
                            <SelectItem value="member" className="text-sm">Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={addMemberMutation.isPending} className="text-sm">
                    {addMemberMutation.isPending ? "Inviting..." : "Invite Member"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop View: Tabs */}
      <Tabs defaultValue="details" className="hidden lg:block space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details" className="text-sm sm:text-base">Organization Details</TabsTrigger>
          <TabsTrigger value="members" className="text-sm sm:text-base">Members</TabsTrigger>
          <TabsTrigger value="add" className="text-sm sm:text-base">Invite Member</TabsTrigger>
          <TabsTrigger value="invites" className="text-sm sm:text-base">Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Organization Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
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
                        <FormLabel className="text-xs sm:text-sm">Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={updateOrganizationMutation.isPending}
                    className="text-sm"
                  >
                    {updateOrganizationMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Organization Members</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage your organization's members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMembers()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          {renderInvitesSection()}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Invite Member</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
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
                        <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="text-sm" />
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
                        <FormLabel className="text-xs sm:text-sm">Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin" className="text-sm">Admin</SelectItem>
                            <SelectItem value="member" className="text-sm">Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={addMemberMutation.isPending} className="text-sm">
                    {addMemberMutation.isPending ? "Inviting..." : "Invite Member"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
