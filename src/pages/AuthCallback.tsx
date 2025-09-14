import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getMe();
        if (user.organizations && user.organizations.length > 0) {
          navigate("/");
        } else {
          navigate("/create-organization");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch user data. Please log in again.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkUser();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Loading...</div>
    </div>
  );
}
