import { generateId } from "@/lib/utils";
import type { QRItem } from "@/types/qr";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QRState {
    repo: Record<string, QRItem>;
    activeId: string;
}

interface QRActions {
    setActiveId: (id: string) => void;

    addItem: (item: QRItem) => void;
    emplaceItem: (title: string, value: string, id?: string, addedAt?: number) => void;
    deleteItem: (id: string) => void;
}

type QRStore = QRState & QRActions;

export const useQRStore = create<QRStore>()(
    persist(
        (set, get) => ({
            repo: {},
            activeId: "",

            setActiveId: (id) => set({ activeId: id }),

            addItem: (item) => {
                // Last In First Out
                set((s) => ({
                    repo: { [item.id]: item, ...s.repo },
                    activeId: item.id,
                }));
            },
            emplaceItem: (title, value, id, addedAt) => {
                get().addItem({
                    id: id ?? generateId(),
                    title,
                    value,
                    addedAt: addedAt ?? Date.now(),
                });
            },
            deleteItem: (id) => {
                set((s) => {
                    const repo = { ...s.repo };
                    delete repo[id];
                    return { repo };
                });
            },
        }),
        {
            name: "xellanix-qr-revue",
            version: 1,
            partialize: (state) => ({
                repo: state.repo,
                activeId: state.activeId,
            }),
        },
    ),
);
