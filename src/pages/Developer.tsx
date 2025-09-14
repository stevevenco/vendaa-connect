import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Trash2, Key, Book, AlertTriangle } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { getApiKeys, createApiKey, deleteApiKey } from "@/services/api";
import { ApiKey, CreateApiKeyResponse, Organization } from "@/types";
import { ApiTokenDisplayDialog } from "@/components/ApiTokenDisplayDialog";

export default function DeveloperPage() {
  const { activeOrganization } = useOutletContext<{
    activeOrganization: Organization;
  }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newApiKey, setNewApiKey] = useState<CreateApiKeyResponse | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [showGenerateKeyDialog, setShowGenerateKeyDialog] = useState(false);

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
    mutationFn: () => createApiKey(activeOrganization.uuid),
    onSuccess: (data) => {
      toast({
        title: "API Key Generated",
        description: "Your new API key has been generated successfully.",
      });
      setNewApiKey(data);
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", activeOrganization.uuid],
      });
      setShowGenerateKeyDialog(false);
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
        title: "API Key Revoked",
        description: "The API key has been revoked successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", activeOrganization.uuid],
      });
      setKeyToRevoke(null);
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

  const handleGenerateClick = () => {
    if (apiKeys && apiKeys.length > 0) {
      setShowGenerateKeyDialog(true);
    } else {
      handleGenerateConfirm();
    }
  };

  const handleGenerateConfirm = () => {
    if (!activeOrganization) return;
    createApiKeyMutation.mutate();
  };

  const handleDelete = () => {
    if (!activeOrganization || !keyToRevoke) return;
    deleteApiKeyMutation.mutate(keyToRevoke.uuid);
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

  const apiKey = apiKeys?.[0];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer</h1>
          <p className="text-muted-foreground">
            Manage the API key for your organization.
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
              <CardTitle>API Key</CardTitle>
              <CardDescription>
                This key allows you to interact with the Vendaa API.
              </CardDescription>
            </div>
            <Button
              disabled={!activeOrganization || createApiKeyMutation.isPending}
              onClick={handleGenerateClick}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {apiKey ? "Generate New Key" : "Generate API Key"}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : isError ? (
              <p className="text-destructive">Failed to load API key.</p>
            ) : apiKey ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                <div>
                  <p className="font-mono text-sm">
                    <span className="font-semibold">Prefix:</span> {apiKey.prefix}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created on {new Date(apiKey.created).toLocaleDateString()}
                  </p>
                  {/* <p className="text-xs text-muted-foreground">
                    Last used: {apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString() : 'Never'}
                  </p> */}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setKeyToRevoke(apiKey)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revoke
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  No API key
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by generating your first API key.
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

      {/* Revoke Key Dialog */}
      <AlertDialog open={!!keyToRevoke} onOpenChange={(open) => !open && setKeyToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This API key will be immediately disabled. API requests made using
              this key will be rejected, which could cause any systems still
              depending on it to break.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteApiKeyMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteApiKeyMutation.isPending ? "Revoking..." : "Revoke Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate New Key Dialog */}
      <AlertDialog open={showGenerateKeyDialog} onOpenChange={setShowGenerateKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <AlertDialogTitle>Generate New API Key?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Generating a new key will invalidate your existing API key.
              This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerateConfirm}
              disabled={createApiKeyMutation.isPending}
            >
              {createApiKeyMutation.isPending ? "Generating..." : "Generate Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
