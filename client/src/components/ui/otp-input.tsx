import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  length?: number;
  onComplete?: (code: string) => void;
}

export const OtpInput = React.forwardRef<HTMLInputElement, OtpInputProps>(
  ({ className, length = 6, onComplete, ...props }, ref) => {
    const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""));
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const value = e.target.value;
      if (isNaN(Number(value))) return;

      const newOtp = [...otp];
      // Take only the last character if somehow multiple are entered
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      // Move to next input if value is entered
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check if OTP is complete
      const newOtpString = newOtp.join("");
      if (newOtpString.length === length && onComplete) {
        onComplete(newOtpString);
      }
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number
    ) => {
      // Move to previous input on backspace if current input is empty
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      // Handle paste event
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        navigator.clipboard.readText().then((pastedText) => {
          if (pastedText && /^\d+$/.test(pastedText)) {
            const digits = pastedText.slice(0, length).split("");
            const newOtp = [...otp];
            
            digits.forEach((digit, idx) => {
              if (idx < length) {
                newOtp[idx] = digit;
              }
            });
            
            setOtp(newOtp);
            
            // Focus on the next empty input or the last input
            const nextEmptyIndex = newOtp.findIndex((val) => !val);
            const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
            inputRefs.current[focusIndex]?.focus();
            
            // Check if OTP is complete
            const newOtpString = newOtp.join("");
            if (newOtpString.length === length && onComplete) {
              onComplete(newOtpString);
            }
          }
        });
      }
    };

    return (
      <div className="flex gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "h-12 w-12 rounded-md border border-input bg-background text-center text-xl font-semibold shadow-sm transition-all",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              className
            )}
            {...props}
          />
        ))}
      </div>
    );
  }
);

OtpInput.displayName = "OtpInput";
