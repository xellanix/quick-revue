import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, dateTimeFormat } from "@/lib/utils";
import { useQRStore } from "@/stores/qr";
import type { QRItem } from "@/types/qr";

function QRListItem({ id, title, value, addedAt }: QRItem) {
    return (
        <FieldLabel htmlFor={`content-${id}`} className="border-0! bg-transparent!">
            <Field orientation="horizontal" className="p-0!">
                <FieldContent className="w-full">
                    <div
                        className={cn(
                            "bg-card flex w-full shrink-0 flex-col items-center gap-1 rounded-md border-3 border-transparent px-2 py-1 shadow-sm select-none",
                            "group-has-data-[state=checked]/field-label:border-brand",
                        )}
                    >
                        <span className="w-full truncate text-sm font-medium">{title}</span>
                        <span className="text-brand w-full truncate text-sm font-medium">
                            {value}
                        </span>
                        <span className="text-muted-foreground w-full truncate text-sm font-normal">
                            {dateTimeFormat(new Date(addedAt))}
                        </span>
                    </div>
                </FieldContent>
                <RadioGroupItem value={id} id={`content-${id}`} className="sr-only" />
            </Field>
        </FieldLabel>
    );
}

export function QRList() {
    const repo = useQRStore((s) => s.repo);
    const activeId = useQRStore((s) => s.activeId);
    const setActiveId = useQRStore((s) => s.setActiveId);

    return (
        <section className="flex w-full flex-1 flex-col overflow-hidden px-0!">
            <RadioGroup
                className="no-scrollbar relative flex flex-col overflow-x-hidden overflow-y-auto px-4 pb-4"
                value={activeId}
                onValueChange={setActiveId}
            >
                {Object.values(repo).map((item) => (
                    <QRListItem key={item.id} {...item} />
                ))}
            </RadioGroup>
        </section>
    );
}
