import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "./ui/label";
import { Wrench } from "lucide-react";
import { generateToken } from "@/services/api";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Meter,
  Organization,
  CreditTokenResponse,
  KctTokenResponse,
  GenerateTokenSchema,
  TGenerateTokenSchema,
} from "@/types";
import MeterSearch from "./MeterSearch";
import TokenDisplayDialog from "./TokenDisplayDialog";
import managementTokens from "../../management_tokens.json";

interface ManagementTokenCardProps {
  meters: Meter[];
  loading: boolean;
}

export default function ManagementTokenCard({
  meters,
  loading,
}: ManagementTokenCardProps) {
  const [tokenGenerating, setTokenGenerating] = useState(false);
  const { activeOrganization } = useOutletContext<{
    activeOrganization: Organization | null;
  }>();
  const { toast } = useToast();
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [generatedTokens, setGeneratedTokens] = useState<
    { description: string; token: string }[]
  >([]);
  const [dialogTitle, setDialogTitle] = useState("");

  const form = useForm<TGenerateTokenSchema>({
    resolver: zodResolver(GenerateTokenSchema),
    defaultValues: {
      token_type: "mgtk",
      meter_number: "",
    },
    mode: "onChange",
  });

  const operation = form.watch("operation");

  const operations = Object.keys(managementTokens);
  const actions = operation ? managementTokens[operation as keyof typeof managementTokens] : [];

  const getDialogTitle = (tokenType: string) => {
    const titles: { [key: string]: string } = {
      mgtk: "Management Token Generated",
    };
    return titles[tokenType] || "Token Generated";
  };

  const onSubmit = async (values: TGenerateTokenSchema) => {
    if (!activeOrganization) return;

    setTokenGenerating(true);
    try {
      const response = await generateToken(activeOrganization.uuid, values);

      if (Array.isArray(response)) {
        setDialogTitle(getDialogTitle(values.token_type));
        setGeneratedTokens(response as KctTokenResponse);
      } else {
        setDialogTitle(getDialogTitle(values.token_type));
        setGeneratedTokens([
          {
            description: "Management Token",
            token: (response as CreditTokenResponse).token,
          },
        ]);
      }
      setIsTokenDialogOpen(true);
      form.reset();
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error Generating Token",
        description: apiError.message,
        variant: "destructive",
      });
    } finally {
      setTokenGenerating(false);
    }
  };

  return (
    <>
      <TokenDisplayDialog
        isOpen={isTokenDialogOpen}
        onClose={() => setIsTokenDialogOpen(false)}
        title={dialogTitle}
        tokens={generatedTokens}
      />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Management Tokens
          </CardTitle>
          <CardDescription>
            Select a meter and an operation to generate a management token.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="meter_number"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Choose Meter</FormLabel>
                    <MeterSearch
                      meters={meters}
                      selectedMeter={field.value}
                      onSelect={field.onChange}
                      loading={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an operation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operations.map((op) => (
                          <SelectItem key={op} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {operation && (
                <FormField
                  control={form.control}
                  name="action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {actions.map((act) => (
                            <SelectItem key={act} value={act}>
                              {act}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={tokenGenerating || !form.formState.isValid}
              >
                {tokenGenerating ? "Generating..." : "Generate Management Token"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
