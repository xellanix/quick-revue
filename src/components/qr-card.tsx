import type { QRItemMinimal } from "@/types/qr";
import { QRCode } from "react-qr-code";

export function QRCard({ title, value }: QRItemMinimal) {
    return (
        <div className="bg-brand flex w-full max-w-60 flex-col items-center gap-2.5 rounded-2xl p-4 pt-2.5 shadow-lg">
            <h1 className="text-brand-foreground max-w-full truncate text-lg font-bold">{title}</h1>
            <div className="bg-card flex aspect-square w-full flex-col rounded-lg p-4">
                <QRCode
                    value={value}
                    className="size-full"
                    size={256}
                    viewBox={`0 0 256 256`}
                    level="M"
                    fgColor="currentColor"
                    bgColor="transparent"
                    mode=""
                />
            </div>
        </div>
    );
}
