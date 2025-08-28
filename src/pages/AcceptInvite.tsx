import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyInvitation } from '@/services/api';
import { OrganizationInvite } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            {isLoading ? 'Verifying Invitation' : (invitation ? 'Invitation Verified' : 'Invalid Invitation')}
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
                You have been invited to join <strong>{invitation.organization_name}</strong>.
              </p>
              <CardDescription>
                To accept this invitation, please sign up or log in. After that, navigate to the 'Organization' section and find the 'Invitations' tab to accept.
              </CardDescription>
              <Button asChild className="w-full bg-gradient-to-r from-primary to-primary-glow">
                <Link to="/signup">Sign Up or Log In</Link>
              </Button>
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
