import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Generates a random ID.
 *
 * @returns A random ID.
 */
export function generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();

    return Date.now().toString() + Math.random().toString(36).substring(2);
}

export function dateTimeFormat(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}
