export interface QRItemMinimal {
    title: string;
    value: string;
}

export interface QRItem extends QRItemMinimal {
    id: string;
    addedAt: ReturnType<typeof Date.now>;
}
