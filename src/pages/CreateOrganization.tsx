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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TCreateOrganizationSchema,
  CreateOrganizationSchema,
} from "@/types";
import { COUNTRY_DATA, createOrganization } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
// import countriesData from "@/data/countries.json";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface Country {
  name: string;
  uuid: string;
}
const countryData = COUNTRY_DATA();

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [countries, setCountries] = useState<Country[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadedCountries = Object.entries(countryData).map(
      ([name, uuid]) => ({
        name: name
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
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
      await queryClient.invalidateQueries({ queryKey: ["user"] });
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Country</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? countries.find(
                                  (country) => country.uuid === field.value
                                )?.name
                              : "Select country"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {countries.map((country) => (
                                <CommandItem
                                  value={country.name}
                                  key={country.uuid}
                                  onSelect={() => {
                                    form.setValue("country", country.uuid);
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      country.uuid === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {country.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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