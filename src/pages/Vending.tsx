import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Info } from "lucide-react";
import { generateToken, getMeters, getUtilityCosts } from "@/services/api";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Meter,
  Organization,
  CreditTokenResponse,
  KctTokenResponse,
  GenerateTokenSchema,
  TGenerateTokenSchema,
  UtilityCost,
} from "@/types";
import EngineeringTokenCard from "@/components/EngineeringTokenCard";
import RemoteOperationCard from "@/components/RemoteOperationCard";
import TokenDisplayDialog from "@/components/TokenDisplayDialog";
import { UtilityCostsDialog } from "@/components/UtilityCostsDialog";

export default function VendingPage() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [utilityCosts, setUtilityCosts] = useState<UtilityCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenGenerating, setTokenGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("credit");
  const { activeOrganization } = useOutletContext<{
    activeOrganization: Organization | null;
  }>();
  const { toast } = useToast();
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [isUtilityCostsDialogOpen, setIsUtilityCostsDialogOpen] =
    useState(false);
  const [generatedTokens, setGeneratedTokens] = useState<
    { description: string; token: string }[]
  >([]);
  const [dialogTitle, setDialogTitle] = useState("");

  const form = useForm<TGenerateTokenSchema>({
    resolver: zodResolver(GenerateTokenSchema),
    defaultValues: {
      token_type: "credit",
      meter_number: "",
      amount: 0,
    },
  });

  const [purchaseMethod, setPurchaseMethod] = useState<"amount" | "units">(
    "amount"
  );
  const selectedMeterNumber = form.watch("meter_number");

  useEffect(() => {
    const fetchData = async () => {
      if (activeOrganization) {
        try {
          setLoading(true);
          const [fetchedMeters, fetchedUtilityCosts] = await Promise.all([
            getMeters(activeOrganization.uuid),
            getUtilityCosts(),
          ]);
          setMeters(fetchedMeters);
          setUtilityCosts(fetchedUtilityCosts);
          setError(null);
        } catch (err) {
          setError("Failed to fetch data. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [activeOrganization]);

  const tabOptions = [
    { value: "credit", label: "Credit Purchase" },
    { value: "engineering", label: "Engineering Tokens" },
    { value: "remote", label: "Remote Operations" },
  ];

  const selectedMeterDetails = meters.find(
    (m) => m.meter_number === selectedMeterNumber
  );

  const getUnit = (meterType: string | undefined) => {
    switch (meterType) {
      case 'electricity': return 'kWh';
      case 'water': return 'litres';
      case 'gas': return 'scm';
      default: return 'units';
    }
  };

  const getDialogTitle = (tokenType: string) => {
    const titles: { [key: string]: string } = {
      credit: "Credit Token Generated",
      kct: "KCT Token Generated",
      mse: "MSE Token Generated",
      clear_credit: "Clear Credit Token Generated",
      clear_tamper: "Clear Tamper Token Generated",
      test: "Test Token Generated",
      ditk: "DITK Token Generated",
    };
    return titles[tokenType] || "Token Generated";
  };

  const onSubmit = async (values: TGenerateTokenSchema) => {
    if (!activeOrganization) return;

    const payload: any = {
      token_type: "credit",
      meter_number: values.meter_number,
    };

    if (purchaseMethod === "amount") {
      payload.amount = values.amount;
    } else {
      payload.utility_units = values.utility_units;
    }

    setTokenGenerating(true);
    try {
      const response = await generateToken(activeOrganization.uuid, payload);

      if (Array.isArray(response)) {
        setDialogTitle(getDialogTitle(payload.token_type));
        setGeneratedTokens(response as KctTokenResponse);
      } else {
        setDialogTitle(getDialogTitle(payload.token_type));
        setGeneratedTokens([
          {
            description: "Credit Token",
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

  const renderCreditPurchaseForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Generate Utility Credits
        </CardTitle>
        <CardDescription>
          Purchase utility credits for electricity, water, or gas meters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="meter_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Meter</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loading
                                ? "Loading meters..."
                                : "Choose meter number"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meters.map((meter) => (
                          <SelectItem
                            key={meter.uuid}
                            value={meter.meter_number}
                          >
                            {meter.meter_number} - {meter.customer_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Purchase Type</FormLabel>
                <RadioGroup
                  onValueChange={(value) =>
                    setPurchaseMethod(value as "amount" | "units")
                  }
                  defaultValue={purchaseMethod}
                  className="flex items-center space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="amount" />
                    </FormControl>
                    <FormLabel>Amount (NGN)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="units" />
                    </FormControl>
                    <FormLabel>
                      Units ({getUnit(selectedMeterDetails?.meter_type)})
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>
            </div>
            {purchaseMethod === "amount" ? (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (NGN)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="utility_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Number of Units (
                      {getUnit(selectedMeterDetails?.meter_type)})
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter number of units"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {selectedMeterDetails && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Meter Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>{selectedMeterDetails.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meter Type:</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedMeterDetails.meter_type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-glow"
              disabled={loading || tokenGenerating}
            >
              {tokenGenerating ? "Generating..." : "Generate Credit Token"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vending Operations
          </h1>
          <p className="text-muted-foreground">
            Generate utility credits and engineering tokens for your meters.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsUtilityCostsDialogOpen(true)}
        >
          <Info className="mr-2 h-4 w-4" />
          View Costs
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <TokenDisplayDialog
        isOpen={isTokenDialogOpen}
        onClose={() => setIsTokenDialogOpen(false)}
        title={dialogTitle}
        tokens={generatedTokens}
      />

      <UtilityCostsDialog
        open={isUtilityCostsDialogOpen}
        onOpenChange={setIsUtilityCostsDialogOpen}
        utilityCosts={utilityCosts}
      />

      {/* Mobile View: Dropdown */}
      <div className="md:hidden space-y-4">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger>
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            {tabOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeTab === "credit" && renderCreditPurchaseForm()}
        {activeTab === "engineering" && <EngineeringTokenCard meters={meters} />}
        {activeTab === "remote" && <RemoteOperationCard />}
      </div>

      {/* Desktop View: Tabs */}
      <Tabs defaultValue="credit" className="hidden md:block space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credit">Credit Purchase</TabsTrigger>
          <TabsTrigger value="engineering">Engineering Tokens</TabsTrigger>
          <TabsTrigger value="remote">Remote Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="credit" className="space-y-4">
          {renderCreditPurchaseForm()}
        </TabsContent>

        <TabsContent value="engineering" className="space-y-4">
          <EngineeringTokenCard meters={meters} />
        </TabsContent>

        <TabsContent value="remote" className="space-y-4">
          <RemoteOperationCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}