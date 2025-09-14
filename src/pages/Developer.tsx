import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle,
  Trash2,
  Key,
  Book,
  AlertTriangle,
  RotateCw,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  getApiKeys,
  createApiKey,
  regenerateApiKey,
  updateApiKey,
} from "@/services/api";
import {
  ApiKey,
  CreateApiKeyResponse,
  Organization,
  TCreateApiKeySchema,
} from "@/types";
import { ApiTokenDisplayDialog } from "@/components/ApiTokenDisplayDialog";
import { CreateApiKeyDialog } from "@/components/CreateApiKeyDialog";

export default function DeveloperPage() {
  const { activeOrganization } = useOutletContext<{
    activeOrganization: Organization;
  }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newApiKey, setNewApiKey] = useState<CreateApiKeyResponse | null>(null);
  const [keyToRegenerate, setKeyToRegenerate] = useState<ApiKey | null>(null);
  const [keyToToggle, setKeyToToggle] = useState<ApiKey | null>(null);
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false);

  const {
    data: apiKeys,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["apiKeys", activeOrganization?.uuid],
    queryFn: () => getApiKeys(activeOrganization!.uuid),
    enabled: !!activeOrganization?.uuid,
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
      setShowCreateKeyDialog(false);
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

  const regenerateApiKeyMutation = useMutation({
    mutationFn: (apiKeyId: string) =>
      regenerateApiKey(activeOrganization.uuid, apiKeyId),
    onSuccess: (data) => {
      toast({
        title: "API Key Regenerated",
        description: "The API key has been regenerated successfully.",
      });
      setNewApiKey(data);
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", activeOrganization.uuid],
      });
      setKeyToRegenerate(null);
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

  const toggleApiKeyMutation = useMutation({
    mutationFn: (apiKey: ApiKey) =>
      updateApiKey(activeOrganization.uuid, apiKey.uuid, {
        is_active: !apiKey.is_active,
      }),
    onSuccess: (data) => {
      toast({
        title: `API Key ${data.is_active ? "Enabled" : "Disabled"}`,
        description: `The API key has been successfully ${
          data.is_active ? "enabled" : "disabled"
        }.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", activeOrganization.uuid],
      });
      setKeyToToggle(null);
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

  const handleCreateConfirm = (data: TCreateApiKeySchema) => {
    if (!activeOrganization) return;
    createApiKeyMutation.mutate(data);
  };

  const handleRegenerate = () => {
    if (!activeOrganization || !keyToRegenerate) return;
    regenerateApiKeyMutation.mutate(keyToRegenerate.uuid);
  };

  const handleToggle = () => {
    if (!activeOrganization || !keyToToggle) return;
    toggleApiKeyMutation.mutate(keyToToggle);
  };

  if (!activeOrganization) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">
            No Organization Selected
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please select an organization to manage API keys.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer</h1>
          <p className="text-muted-foreground">
            Manage your organization's API keys.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a
              href="https://vendaa.docs.apiary.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Book className="mr-2 h-4 w-4" />
              Documentation
            </a>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                These keys allow you to interact with the Vendaa API.
              </CardDescription>
            </div>
            <Button
              disabled={!activeOrganization || createApiKeyMutation.isPending}
              onClick={() => setShowCreateKeyDialog(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : isError ? (
              <p className="text-destructive">Failed to load API keys.</p>
            ) : apiKeys && apiKeys.length > 0 ? (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.uuid}
                    className="flex items-center justify-between p-4 bg-muted rounded-md"
                  >
                    <div>
                      <p className="font-semibold">{apiKey.name}</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        {apiKey.key_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created on{" "}
                        {new Date(apiKey.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          apiKey.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apiKey.is_active ? "Active" : "Inactive"}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => setKeyToRegenerate(apiKey)}
                          >
                            <RotateCw className="mr-2 h-4 w-4" />
                            Regenerate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setKeyToToggle(apiKey)}
                            className={
                              apiKey.is_active
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {apiKey.is_active ? "Disable" : "Enable"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
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

        <CreateApiKeyDialog
          open={showCreateKeyDialog}
          onOpenChange={setShowCreateKeyDialog}
          onSubmit={handleCreateConfirm}
          isPending={createApiKeyMutation.isPending}
        />
      </div>

      {/* Regenerate Key Dialog */}
      <AlertDialog
        open={!!keyToRegenerate}
        onOpenChange={(open) => !open && setKeyToRegenerate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate the old key and generate a new one. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerate}
              disabled={regenerateApiKeyMutation.isPending}
            >
              {regenerateApiKeyMutation.isPending
                ? "Regenerating..."
                : "Regenerate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Key Dialog */}
      <AlertDialog
        open={!!keyToToggle}
        onOpenChange={(open) => !open && setKeyToToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {keyToToggle?.is_active ? "Disable" : "Enable"} API Key
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {keyToToggle?.is_active ? "disable" : "enable"} this API key?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggle}
              disabled={toggleApiKeyMutation.isPending}
              className={
                keyToToggle?.is_active
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {toggleApiKeyMutation.isPending
                ? keyToToggle?.is_active
                  ? "Disabling..."
                  : "Enabling..."
                : keyToToggle?.is_active
                ? "Disable"
                : "Enable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
