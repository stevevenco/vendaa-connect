import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyInvitation, acceptInvitation } from "@/services/api";
import { OrganizationInvite } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    data: invitation,
    error,
    isLoading: isVerifying,
  } = useQuery<OrganizationInvite | null, Error>({
    queryKey: ["invitation", token],
    queryFn: () => verifyInvitation(token!),
    enabled: !!token,
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: () => acceptInvitation(token!),
    onSuccess: async () => {
      toast({
        title: "Invitation Accepted",
        description: `You have successfully joined ${invitation?.organization_name}.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/"); // Navigate to the dashboard
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Accept Invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    acceptInvitationMutation.mutate();
  };

  // If the user is authenticated and the invitation is loaded, show the modal
  const showAcceptModal = isAuthenticated && invitation;

  if (isAuthLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p>Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-semibold">Invalid Invitation</h2>
            <p>{error.message || "The invitation link is either invalid or has expired."}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showAcceptModal) {
    return (
      <Dialog open={true} onOpenChange={() => navigate("/")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Invitation</DialogTitle>
            <DialogDescription>
              You have been invited by <strong>{invitation.sent_by_name}</strong> to join{" "}
              <strong>{invitation.organization_name}</strong> as a{" "}
              <strong>{invitation.role}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleAccept}
              disabled={acceptInvitationMutation.isPending}
              className="w-full"
            >
              {acceptInvitationMutation.isPending
                ? "Accepting..."
                : "Accept & Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold">You've been invited!</h2>
          <p>
            To accept the invitation from{" "}
            <strong>{invitation?.sent_by_name}</strong> to join{" "}
            <strong>{invitation?.organization_name}</strong>, please log in or
            sign up.
          </p>
          <div className="mt-6 space-y-2">
            <Button asChild className="w-full">
              <Link to={`/login?redirect=/accept-invite/${token}`}>
                Log In to Accept
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/signup?redirect=/accept-invite/${token}`}>
                Sign Up to Accept
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
