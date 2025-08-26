import { useState } from "react";
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
import { dummyMeters } from "@/data/dummyData";
import { Label } from "./ui/label";

const operationTypes = [
  { value: "kct", label: "Key Change Token (KCT)", icon: Key },
  { value: "clear_credit", label: "Clear Credit", icon: RotateCcw },
  { value: "clear_tamper", label: "Clear Tamper", icon: AlertTriangle },
  { value: "mode_change", label: "Mode Change", icon: CheckCircle },
];

export default function EngineeringTokenCard() {
  const [selectedOperation, setSelectedOperation] = useState("");
  const [selectedMeter, setSelectedMeter] = useState("");

  const selectedOperationDetails = operationTypes.find(op => op.value === selectedOperation);
  const Icon = selectedOperationDetails?.icon;

  return (
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
              <Select value={selectedMeter} onValueChange={setSelectedMeter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meter" />
                </SelectTrigger>
                <SelectContent>
                  {dummyMeters.map((meter) => (
                    <SelectItem key={meter.id} value={meter.meterNumber}>
                      {meter.meterNumber} - {meter.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMeter && (
              <div className="pt-4">
                {selectedOperation === "mode_change" ? (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Prepaid Mode</Button>
                    <Button variant="outline" className="flex-1">Postpaid Mode</Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    variant={
                      selectedOperation === "clear_credit" ? "destructive" :
                      selectedOperation === "clear_tamper" ? "secondary" :
                      "default"
                    }
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    Generate {selectedOperationDetails?.label}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
