import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface PinInputProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function PinInput({ value, onChange, disabled }: PinInputProps) {
    return (
        <div className="flex justify-center">
            <InputOTP maxLength={4} value={value} onChange={onChange} disabled={disabled}>
                <InputOTPGroup className="gap-3">
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl sm:w-16 sm:h-20 sm:text-3xl border-2 rounded-lg" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl sm:w-16 sm:h-20 sm:text-3xl border-2 rounded-lg" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl sm:w-16 sm:h-20 sm:text-3xl border-2 rounded-lg" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl sm:w-16 sm:h-20 sm:text-3xl border-2 rounded-lg" />
                </InputOTPGroup>
            </InputOTP>
        </div>
    )
}
