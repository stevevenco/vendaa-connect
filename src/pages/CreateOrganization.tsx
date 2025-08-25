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
import { Input } from "@/components/ui/input";
import {
  TCreateOrganizationSchema,
  CreateOrganizationSchema,
} from "@/types";
import { createOrganization } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<TCreateOrganizationSchema>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: TCreateOrganizationSchema) => {
    try {
      await createOrganization(data);
      toast({
        title: "Organization Created",
        description: "Your organization has been created successfully.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Failed to Create Organization",
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
          <CardTitle className="text-2xl">Create Organization</CardTitle>
          <CardDescription>
            Enter a name for your organization to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
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
                  ? "Creating..."
                  : "Create Organization"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
