import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TOtpVerifySchema, OtpVerifySchema } from "@/types";
import { verifyOtp, requestOtp } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
// import { useAuth } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect } from "react";


export default function VerifyAccountPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, checkAuth } = useAuth();

  const sendOtp = useCallback(
    async (isResend = false) => {
      if (!user?.email) return;
      try {
        await requestOtp({
          email: user.email,
          purpose: "account_verification",
        });
        toast({
          title: isResend ? "OTP Resent" : "OTP Sent",
          description: "A new OTP has been sent to your email.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "An error occurred.",
          variant: "destructive",
        });
      }
    },
    [user?.email, toast]
  );

  useEffect(() => {
    sendOtp();
  }, [sendOtp]);

  const form = useForm<TOtpVerifySchema>({
    resolver: zodResolver(
      OtpVerifySchema.omit({ new_password: true, purpose: true })
    ),
    defaultValues: {
      email: user?.email || "",
      otp_code: "",
    },
  });

  const onSubmit = async (data: TOtpVerifySchema) => {
    try {
      await verifyOtp({ ...data, purpose: "account_verification" });
      await checkAuth(); // Re-check auth status to update isVerified
      toast({
        title: "Account Verification Successful",
        description: "Your account has been verified.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = () => sendOtp(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Account</CardTitle>
          <CardDescription>
            An OTP has been sent to your email address. Please enter it below to
            verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="otp_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Verifying..."
                  : "Verify Account"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Didn't receive an OTP?{" "}
            <Button
              variant="link"
              onClick={handleResendOtp}
              className="p-0 h-auto"
            >
              Resend OTP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
