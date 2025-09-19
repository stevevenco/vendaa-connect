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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TCreateOrganizationSchema,
  CreateOrganizationSchema,
} from "@/types";
import { createOrganization } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import countriesData from "../../countries.json";
import { useAuth } from "@/context/AuthContext";

interface Country {
  name: string;
  uuid: string;
}

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAuth } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const loadedCountries = Object.entries(countriesData).map(
      ([name, uuid]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        uuid,
      })
    );
    setCountries(loadedCountries);
  }, []);

  const form = useForm<TCreateOrganizationSchema>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: {
      name: "",
      country: "",
    },
  });

  const onSubmit = async (data: TCreateOrganizationSchema) => {
    try {
      await createOrganization(data);
      toast({
        title: "Organization Created",
        description: "Your organization has been created successfully.",
      });
      await checkAuth();
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
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Create Organization</CardTitle>
          <CardDescription>
            Enter a name and country for your organization to get started.
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
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.uuid} value={country.uuid}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
