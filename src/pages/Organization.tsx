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
} from "@/types";
import {
  updateOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  getOrganizationInvites,
  getPendingInvites,
  respondToInvite,
  cancelInvite,
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

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["members", selectedOrganization?.uuid],
    queryFn: () => getOrganizationMembers(selectedOrganization!.uuid),
    enabled: !!selectedOrganization,
  });

  const { data: sentInvites, isLoading: isLoadingSentInvites } = useQuery({
    queryKey: ["sent-invites", selectedOrganization?.uuid],
    queryFn: () => getOrganizationInvites(selectedOrganization!.uuid),
    enabled: !!selectedOrganization,
  });

  const { data: receivedInvites, isLoading: isLoadingReceivedInvites } = useQuery({
    queryKey: ["received-invites"],
    queryFn: getPendingInvites,
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

  const respondToInviteMutation = useMutation({
    mutationFn: ({ inviteUuid, action }: { inviteUuid: string; action: 'accept' | 'decline' }) =>
      respondToInvite(inviteUuid, action),
    onSuccess: () => {
      toast({
        title: "Invite Response Sent",
        description: "Your response to the invitation has been sent.",
      });
      queryClient.invalidateQueries({
        queryKey: ["received-invites"],
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

  const cancelInviteMutation = useMutation({
    mutationFn: (inviteUuid: string) =>
      cancelInvite(selectedOrganization!.uuid, inviteUuid),
    onSuccess: () => {
      toast({
        title: "Invite Cancelled",
        description: "The invitation has been cancelled.",
      });
      queryClient.invalidateQueries({
        queryKey: ["sent-invites", selectedOrganization?.uuid],
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
        title: "Member Added",
        description: "The new member has been added to the organization.",
      });
      queryClient.invalidateQueries({
        queryKey: ["members", selectedOrganization?.uuid],
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

  // Function to truncate text longer than 20 characters
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

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
              {isLoadingMembers ? (
                <p className="text-xs sm:text-sm">Loading members...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Name</TableHead>
                      <TableHead className="text-xs sm:text-sm">Email</TableHead>
                      <TableHead className="text-xs sm:text-sm">Role</TableHead>
                      <TableHead className="text-xs sm:text-sm">Joined At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member) => (
                      <TableRow key={member.uuid}>
                        <TableCell className="text-xs sm:text-sm">
                          {truncateText(`${member.user.first_name} ${member.user.last_name}`)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {truncateText(member.user.email)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {truncateText(member.role)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "invites" && (
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
                ) : receivedInvites?.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      You have no pending invitations.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {receivedInvites?.map((invite) => (
                      <Card key={invite.uuid}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{invite.organization.name}</p>
                              <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
                            </div>
                            <div className="space-x-2">
                              <Button
                                onClick={() =>
                                  respondToInviteMutation.mutate({
                                    inviteUuid: invite.uuid,
                                    action: "accept",
                                  })
                                }
                                disabled={respondToInviteMutation.isPending}
                                size="sm"
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={() =>
                                  respondToInviteMutation.mutate({
                                    inviteUuid: invite.uuid,
                                    action: "decline",
                                  })
                                }
                                disabled={respondToInviteMutation.isPending}
                                variant="outline"
                                size="sm"
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Invites Section */}
              <div>
                <h3 className="font-medium mb-4">Invites Sent</h3>
                {isLoadingSentInvites ? (
                  <p className="text-sm">Loading invites...</p>
                ) : sentInvites?.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No pending invites have been sent.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {sentInvites?.map((invite) => (
                      <Card key={invite.uuid}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{invite.email}</p>
                              <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
                              <p className="text-sm text-muted-foreground">
                                Sent: {new Date(invite.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              onClick={() => cancelInviteMutation.mutate(invite.uuid)}
                              disabled={cancelInviteMutation.isPending}
                              variant="destructive"
                              size="sm"
                            >
                              Cancel Invite
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "add" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Add Member</CardTitle>
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
                    {addMemberMutation.isPending ? "Adding..." : "Add Member"}
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
          <TabsTrigger value="add" className="text-sm sm:text-base">Add Member</TabsTrigger>
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
              {isLoadingMembers ? (
                <p className="text-xs sm:text-sm">Loading members...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Name</TableHead>
                      <TableHead className="text-xs sm:text-sm">Email</TableHead>
                      <TableHead className="text-xs sm:text-sm">Role</TableHead>
                      <TableHead className="text-xs sm:text-sm">Joined At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member) => (
                      <TableRow key={member.uuid}>
                        <TableCell className="text-xs sm:text-sm">
                          {truncateText(`${member.user.first_name} ${member.user.last_name}`)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {truncateText(member.user.email)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {truncateText(member.role)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
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
                ) : receivedInvites?.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      You have no pending invitations.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {receivedInvites?.map((invite) => (
                      <Card key={invite.uuid}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{invite.organization.name}</p>
                              <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
                            </div>
                            <div className="space-x-2">
                              <Button
                                onClick={() =>
                                  respondToInviteMutation.mutate({
                                    inviteUuid: invite.uuid,
                                    action: "accept",
                                  })
                                }
                                disabled={respondToInviteMutation.isPending}
                                size="sm"
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={() =>
                                  respondToInviteMutation.mutate({
                                    inviteUuid: invite.uuid,
                                    action: "decline",
                                  })
                                }
                                disabled={respondToInviteMutation.isPending}
                                variant="outline"
                                size="sm"
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Invites Section */}
              <div>
                <h3 className="font-medium mb-4">Invites Sent</h3>
                {isLoadingSentInvites ? (
                  <p className="text-sm">Loading invites...</p>
                ) : sentInvites?.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No pending invites have been sent.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {sentInvites?.map((invite) => (
                      <Card key={invite.uuid}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{invite.email}</p>
                              <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
                              <p className="text-sm text-muted-foreground">
                                Sent: {new Date(invite.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              onClick={() => cancelInviteMutation.mutate(invite.uuid)}
                              disabled={cancelInviteMutation.isPending}
                              variant="destructive"
                              size="sm"
                            >
                              Cancel Invite
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Add Member</CardTitle>
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
                    {addMemberMutation.isPending ? "Adding..." : "Add Member"}
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