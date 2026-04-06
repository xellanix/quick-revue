import { AddDialog } from "@/components/dialog/add-qr";
import { QRCard } from "@/components/qr-card";
import { QRList } from "@/components/qr-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useQRStore } from "@/stores/qr";
import { useCallback, useState } from "react";

function ActiveQRCard() {
    const activeItem = useQRStore((s) => s.repo[s.activeId] || null);

    return (
        <QRCard
            title={activeItem?.title ?? "No Active Item"}
            value={activeItem?.value ?? "No Active Item"}
        />
    );
}

function QRUtils() {
    const [isOpen, setIsOpen] = useState(false);
    const handleSubmit = useCallback((ev: React.SubmitEvent<HTMLFormElement>) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);

        const value = data.get("qr-value") as string;

        const emplaceItem = useQRStore.getState().emplaceItem;
        emplaceItem((data.get("qr-name") as string).trim() || value, value);

        setIsOpen(false);
    }, []);

    return (
        <section className="flex flex-row items-center justify-center gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger
                    render={
                        <Button variant={"default"} size={"sm"}>
                            Add
                        </Button>
                    }
                />

                <AddDialog handleSubmit={handleSubmit} />
            </Dialog>
        </section>
    );
}

export default function App() {
    return (
        <main className="bg-secondary relative flex h-dvh flex-col gap-4 pt-4 *:px-4">
            <section className="flex w-full flex-col items-center">
                <ActiveQRCard />
            </section>
            <QRUtils />
            <QRList />
        </main>
    );
}
