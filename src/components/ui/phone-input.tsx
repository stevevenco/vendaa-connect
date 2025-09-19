import * as React from "react";
import { Input, InputProps } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import countries from "../../../phone_number_codes.json";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCountryChange: (value: string) => void;
  country: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onCountryChange, country, ...props }, ref) => {
    const countryOptions = Object.entries(countries).map(([name, code]) => ({
      value: code,
      label: `${name} (${code})`,
    }));

    return (
      <div className="flex items-center">
        <Select onValueChange={onCountryChange} value={country}>
          <SelectTrigger className="w-[180px] rounded-r-none">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          className="rounded-l-none"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
