import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { TOtpVerifySchema, OtpVerifySchema } from "@/types";
import { verifyOtp, requestOtp } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const email = location.state?.email || new URLSearchParams(location.search).get('email');

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  const ResetPasswordFormSchema = OtpVerifySchema.extend({
    confirm_password: z.string(),
  }).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

  type TResetPasswordFormSchema = z.infer<typeof ResetPasswordFormSchema>;

  const form = useForm<TResetPasswordFormSchema>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      email,
      otp_code: "",
      purpose: "password_reset",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: TResetPasswordFormSchema) => {
    try {
      await verifyOtp(data);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Please log in with your new password.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Password Reset Failed",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      await requestOtp({ email, purpose: "password_reset" });
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email address.",
      });
    } catch (error) {
      toast({
        title: "Failed to Resend OTP",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            An OTP has been sent to <strong>{email}</strong>. Please enter it below along with your new password.
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
                        <InputOTPGroup className="w-full">
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
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
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
                  ? "Resetting Password..."
                  : "Reset Password"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Didn't receive an OTP?{" "}
            <Button variant="link" onClick={handleResendOtp} className="p-0 h-auto">
              Resend OTP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}