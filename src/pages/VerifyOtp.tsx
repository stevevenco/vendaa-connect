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
import { TOtpVerifySchema, OtpVerifySchema } from "@/types";
import { verifyOtp, login } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { email, password } = location.state || {};

  if (!email || !password) {
    navigate("/signup");
  }

  const form = useForm<TOtpVerifySchema>({
    resolver: zodResolver(OtpVerifySchema),
    defaultValues: {
      otp_code: "",
      purpose: "signup",
    },
  });

  const onSubmit = async (data: TOtpVerifySchema) => {
    try {
      await verifyOtp(data);
      toast({
        title: "OTP Verification Successful",
        description: "Your email has been verified.",
      });

      const loginData = { email, password };
      const res = await login(loginData);
      localStorage.setItem("access", res.access);
      localStorage.setItem("refresh", res.refresh);

      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
      });
      navigate("/auth-callback");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verify OTP</CardTitle>
          <CardDescription>
            Enter the OTP sent to your email address.
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
                {form.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
