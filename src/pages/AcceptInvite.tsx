import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { verifyInvitation, acceptInvitation } from '@/services/api';
import { OrganizationInvite } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [invitation, setInvitation] = useState<OrganizationInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyInvitation(token)
        .then(setInvitation)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const acceptInvitationMutation = useMutation({
    mutationFn: () => acceptInvitation(token!),
    onSuccess: () => {
      toast({
        title: "Invitation Accepted",
        description: `You have successfully joined ${invitation?.organization_name}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["invitations", "received"] });
      navigate('/'); // Navigate to the dashboard or the organization page
    },
    onError: (error) => {
      toast({
        title: "Failed to Accept Invitation",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    acceptInvitationMutation.mutate();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            {isLoading ? 'Verifying Invitation' : (invitation ? 'Invitation Details' : 'Invalid Invitation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader className="h-12 w-12 animate-spin text-primary" />
              <p>Please wait while we verify your invitation...</p>
            </div>
          ) : invitation ? (
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold">You've been invited!</h2>
              <p>
                You have been invited by <strong>{invitation.sent_by_name}</strong> to join <strong>{invitation.organization_name}</strong> as a <strong>{invitation.role}</strong>.
              </p>
              {isAuthenticated ? (
                <Button
                  onClick={handleAccept}
                  disabled={acceptInvitationMutation.isPending}
                  className="w-full"
                >
                  {acceptInvitationMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
                </Button>
              ) : (
                <>
                  <CardDescription>
                    To accept this invitation, please log in or create an account.
                  </CardDescription>
                  <Button asChild className="w-full">
                    <Link to={`/login?redirect=/accept-invite/${token}`}>Log In to Accept</Link>
                  </Button>
                   <Button asChild variant="outline" className="w-full">
                    <Link to={`/signup?redirect=/accept-invite/${token}`}>Sign Up to Accept</Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold">Invalid Invitation</h2>
              <p>{error || 'The invitation link is either invalid or has expired.'}</p>
              <Button asChild variant="outline">
                <Link to="/">Go to Homepage</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
