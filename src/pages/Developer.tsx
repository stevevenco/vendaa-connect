import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { getApiKeys, createApiKey, deleteApiKey } from "@/services/api";
import { TCreateApiKeySchema, CreateApiKeySchema, ApiKey, CreateApiKeyResponse } from "@/types";
import { Organization } from "@/types";
import { ApiTokenDisplayDialog } from "@/components/ApiTokenDisplayDialog";

export default function DeveloperPage() {
  const { activeOrganization } = useOutletContext<{
    activeOrganization: Organization;
  }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<CreateApiKeyResponse | null>(null);

  const {
    data: apiKeys,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["apiKeys", activeOrganization.uuid],
    queryFn: () => getApiKeys(activeOrganization.uuid),
    enabled: !!activeOrganization.uuid,
  });

  const form = useForm<TCreateApiKeySchema>({
    resolver: zodResolver(CreateApiKeySchema),
    defaultValues: {
      name: "",
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: (data: TCreateApiKeySchema) =>
      createApiKey(activeOrganization.uuid, data),
    onSuccess: (data) => {
      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
      setNewApiKey(data);
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", activeOrganization.uuid],
      });
      setCreateDialogOpen(false);
      form.reset();
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

  const deleteApiKeyMutation = useMutation({
    mutationFn: (apiKeyId: string) =>
      deleteApiKey(activeOrganization.uuid, apiKeyId),
    onSuccess: () => {
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", activeOrganization.uuid],
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

  const onSubmit = (data: TCreateApiKeySchema) => {
    createApiKeyMutation.mutate(data);
  };

  const handleDelete = (apiKeyId: string) => {
    deleteApiKeyMutation.mutate(apiKeyId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer</h1>
        <p className="text-muted-foreground">
          Manage API keys for your organization.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              These keys allow you to interact with the Vendaa API.
            </CardDescription>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full rounded-lg">
              <DialogHeader>
                <DialogTitle>Create a new API Key</DialogTitle>
                <DialogDescription>
                  Give your key a descriptive name.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. My Awesome App"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={createApiKeyMutation.isPending}
                    className="w-full"
                  >
                    {createApiKeyMutation.isPending
                      ? "Creating..."
                      : "Create Key"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : isError ? (
            <p className="text-destructive">
              Failed to load API keys.
            </p>
          ) : apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key: ApiKey) => (
                  <TableRow key={key.uuid}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>{key.prefix}</TableCell>
                    <TableCell>
                      {new Date(key.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {key.last_used
                        ? new Date(key.last_used).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(key.uuid)}
                        disabled={deleteApiKeyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Key className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
                No API keys
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating your first API key.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {newApiKey && (
        <ApiTokenDisplayDialog
          apiKey={newApiKey}
          onClose={() => setNewApiKey(null)}
        />
      )}
    </div>
  );
}
