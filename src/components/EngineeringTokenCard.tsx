import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Key,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Wrench
} from "lucide-react";
import { Label } from "./ui/label";
import { Meter, Organization, TokenResponse, CreditTokenResponse, KctTokenResponse } from "@/types";
import { generateToken, ApiError } from "@/services/api";
import { useToast } from "./ui/use-toast";
import TokenDisplayDialog from "./TokenDisplayDialog";

const operationTypes = [
  { value: "kct", label: "Key Change Token (KCT)", icon: Key },
  { value: "clear_credit", label: "Clear Credit", icon: RotateCcw },
  { value: "clear_tamper", label: "Clear Tamper", icon: AlertTriangle },
  { value: "mode_change", label: "Mode Change", icon: CheckCircle },
];

interface EngineeringTokenCardProps {
  meters: Meter[];
}

export default function EngineeringTokenCard({ meters }: EngineeringTokenCardProps) {
  const [selectedOperation, setSelectedOperation] = useState("");
  const [selectedMeter, setSelectedMeter] = useState("");
  const [tokenGenerating, setTokenGenerating] = useState(false);
  const { activeOrganization } = useOutletContext<{ activeOrganization: Organization | null }>();
  const { toast } = useToast();
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [generatedTokens, setGeneratedTokens] = useState<{ description: string; token: string }[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");

  const selectedOperationDetails = operationTypes.find(op => op.value === selectedOperation);
  const Icon = selectedOperationDetails?.icon;

  const handleGenerateToken = async () => {
    if (!activeOrganization || !selectedMeter || !selectedOperation) return;

    setTokenGenerating(true);
    try {
      const response = await generateToken(activeOrganization.uuid, {
        meter_number: selectedMeter,
        token_type: selectedOperation as "kct" | "clear_credit",
        amount: 0, // Amount is not needed for engineering tokens
      });

      const dialogTitle =
        operationTypes.find((op) => op.value === selectedOperation)?.label ||
        "Token Generated";
      setDialogTitle(dialogTitle);

      if (Array.isArray(response)) {
        setGeneratedTokens(response);
      } else {
        setGeneratedTokens([
          {
            description: dialogTitle,
            token: (response as CreditTokenResponse).token,
          },
        ]);
      }
      setIsTokenDialogOpen(true);
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
            Engineering Token Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Operation</Label>
            <Select value={selectedOperation} onValueChange={setSelectedOperation}>
              <SelectTrigger>
                <SelectValue placeholder="Choose operation type" />
              </SelectTrigger>
              <SelectContent>
                {operationTypes.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    <div className="flex items-center gap-2">
                      <op.icon className="h-4 w-4" />
                      {op.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOperation && (
            <>
              <div className="space-y-2">
                <Label>Select Meter</Label>
                <Select value={selectedMeter} onValueChange={setSelectedMeter} disabled={meters.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meter" />
                  </SelectTrigger>
                  <SelectContent>
                    {meters.map((meter) => (
                      <SelectItem key={meter.uuid} value={meter.meter_number}>
                        {meter.meter_number} - {meter.customer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMeter && (
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    variant={selectedOperation === "clear_credit" ? "destructive" : "default"}
                    onClick={handleGenerateToken}
                    disabled={tokenGenerating}
                  >
                    {tokenGenerating ? "Generating..." : (
                      <>
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        Generate {selectedOperationDetails?.label}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
