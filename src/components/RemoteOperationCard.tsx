import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dummyMeters } from "@/data/dummyData";
import { Label } from "./ui/label";
import { Wrench } from "lucide-react";

const operationTypes = [
  { value: "balance_check", label: "Remote Balance Check", description: "Retrieve current meter balance remotely" },
  { value: "consumption_reading", label: "Consumption Reading", description: "Get meter consumption data" },
  { value: "disconnect_reconnect", label: "Remote Disconnect/Reconnect", description: "Control meter relay status" },
  { value: "tariff_management", label: "Tariff Management", description: "Change meter tariff settings" },
];

export default function RemoteOperationCard() {
  const [selectedOperation, setSelectedOperation] = useState("");
  const [selectedMeter, setSelectedMeter] = useState("");
  const [selectedTariff, setSelectedTariff] = useState("");

  const selectedOperationDetails = operationTypes.find(op => op.value === selectedOperation);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Remote Operations
        </CardTitle>
        <CardDescription>
            {selectedOperationDetails?.description || "Select an operation to begin"}
        </CardDescription>
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
                  {op.label}
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
                {selectedOperation === "disconnect_reconnect" && (
                  <div className="flex gap-2">
                    <Button variant="destructive" className="flex-1">Disconnect</Button>
                    <Button variant="default" className="flex-1">Reconnect</Button>
                  </div>
                )}
                {selectedOperation === "tariff_management" && (
                    <>
                    <div className="space-y-2">
                        <Label>Select Tariff</Label>
                        <Select value={selectedTariff} onValueChange={setSelectedTariff}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select tariff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="T1">Tariff 1 (Residential)</SelectItem>
                                <SelectItem value="T2">Tariff 2 (Commercial)</SelectItem>
                                <SelectItem value="T3">Tariff 3 (Industrial)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full mt-4">Update Tariff</Button>
                  </>
                )}
                {selectedOperation === "balance_check" && (
                  <Button className="w-full">Check Balance</Button>
                )}
                {selectedOperation === "consumption_reading" && (
                  <Button className="w-full">Read Consumption</Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
