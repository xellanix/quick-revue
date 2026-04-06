/* eslint-disable react-hooks/immutability */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { QrCodeScanIcon, Upload01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import decodeQR from "qr/decode.js";
import { frontalCamera, QRCanvas } from "qr/dom.js";
import { useCallback, useEffect, useRef, useState } from "react";

function TextContent() {
    return (
        <TabsContent value="text" className="-mx-4 h-full overflow-y-auto px-4">
            <FieldGroup className="h-full">
                <Field className="h-full pt-2 pb-4">
                    <Textarea
                        name="qr-value"
                        placeholder="Enter content here"
                        maxLength={2953}
                        className="h-full"
                        required
                    />
                </Field>
            </FieldGroup>
        </TabsContent>
    );
}

function CameraContent() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraRef = useRef<Awaited<ReturnType<typeof frontalCamera>> | null>(null);
    const canvasRef = useRef<QRCanvas | null>(null);
    const resultRef = useRef<HTMLInputElement>(null);

    const requestRef = useRef<number>(0);
    const lastScanTime = useRef<number>(0);
    const isScanningRef = useRef(false);

    const [isScanning, setIsScanning] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("Scanner stopped.");

    const stopScanner = useCallback(() => {
        isScanningRef.current = false;
        setIsScanning(false);
        setLastMessage((p) => (p === "Scanner active..." ? "Scanner stopped." : p));

        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }

        if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
        }

        if (canvasRef.current) {
            canvasRef.current.clear();
            canvasRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    // The core scanning function, runs in a loop via requestAnimationFrame
    const scanFrame = useCallback(() => {
        // Stop the loop if the component is no longer in a scanning state
        if (!isScanningRef.current) return;

        const now = Date.now();
        // Throttle scanning to 10 FPS (100ms delay)
        // Most QR libraries don't need 60fps to be effective.
        if (now - lastScanTime.current < 100) {
            requestRef.current = requestAnimationFrame(scanFrame);
            return;
        }
        lastScanTime.current = now;

        if (
            !videoRef.current ||
            !cameraRef.current ||
            !canvasRef.current ||
            videoRef.current.paused
        ) {
            requestRef.current = requestAnimationFrame(scanFrame);
            return;
        }

        const frame = cameraRef.current.readFrame(canvasRef.current, true);

        if (frame) {
            stopScanner();
            // QR code found!
            console.log("QR code scanned:", frame);
            setLastMessage(`Found: ${frame}`);
            if (resultRef.current) resultRef.current.value = frame;
        } else {
            // No code found, request the next animation frame to continue
            requestAnimationFrame(scanFrame);
        }
    }, [stopScanner]);

    useEffect(() => {
        // Stop scanning if the component is no longer in a scanning state
        if (!isScanning) {
            stopScanner();
            return;
        }

        // Start scanning if the component is in a scanning state

        // Use a local variable to prevent starting if the component unmounts mid-stream
        let isActive = true;

        // Start the scanning process
        void (async () => {
            try {
                if (!videoRef.current) return;

                canvasRef.current = new QRCanvas();
                cameraRef.current = await frontalCamera(videoRef.current);

                if (isActive) {
                    await videoRef.current.play();
                    setLastMessage("Scanner active...");
                    isScanningRef.current = true;
                    requestRef.current = requestAnimationFrame(scanFrame); // Start the scanning loop
                }
            } catch (err) {
                if (isActive) {
                    console.error("Camera error:", err);
                    setLastMessage("Error: Camera failed.");
                    setIsScanning(false);
                }
            }
        })();

        return () => {
            isActive = false;
            stopScanner();
        };
    }, [isScanning, scanFrame, stopScanner]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden" && isScanning) {
                // User left the tab. Stop the loop.
                stopScanner();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isScanning, scanFrame, stopScanner]);

    return (
        <TabsContent value="camera" className="-mx-4 h-full overflow-y-auto px-4">
            <FieldGroup className="h-full">
                <Field className="pt-2 pb-4">
                    <div className="bg-secondary relative flex aspect-square w-full max-w-sm shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
                        <input
                            ref={resultRef}
                            type="text"
                            name="qr-value"
                            className="pointer-events-none absolute -z-50 size-full opacity-0"
                            required
                            tabIndex={-1}
                        />
                        <div className="absolute flex size-full flex-col items-center justify-center">
                            <HugeiconsIcon icon={QrCodeScanIcon} className="mb-4 size-16" />
                            <span className="text-2xl font-semibold">Activate Scanner</span>
                            <span>to scan QR codes</span>
                        </div>
                        <video
                            ref={videoRef}
                            playsInline
                            className="z-10 h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex w-full justify-center">
                        <Badge
                            variant="secondary"
                            className={cn(
                                "inline-block max-w-full truncate!",
                                lastMessage?.startsWith("Found")
                                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                    : lastMessage?.startsWith("Error") &&
                                          "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                            )}
                        >
                            {lastMessage}
                        </Badge>
                    </div>
                    <Button type="button" onClick={() => setIsScanning((prev) => !prev)}>
                        {isScanning ? "Stop Scanning" : "Start Scanning"}
                    </Button>
                </Field>
            </FieldGroup>
        </TabsContent>
    );
}

function ImageContent() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const resultRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [lastMessage, setLastMessage] = useState<string>("No file selected.");
    const [isDragging, setIsDragging] = useState(false);
    const [isDragInvalid, setIsDragInvalid] = useState(false);

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement> | FileList) => {
            if (resultRef.current) resultRef.current.value = "";

            const file = "target" in event ? event.target.files?.[0] : event[0];
            if (!file) return;

            try {
                if (!canvasRef.current) throw new Error("Canvas not initialized");

                // Create an ImageBitmap from the file
                const imageBitmap = await createImageBitmap(file);

                // Create a canvas
                const canvas = canvasRef.current;
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    throw new Error("Failed to get canvas context");
                }
                canvas.classList.add("bg-secondary");

                // Draw the ImageBitmap onto the canvas
                ctx.drawImage(imageBitmap, 0, 0);

                // Get the ImageData from the canvas
                const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
                const decodedText = decodeQR(imageData);
                if (resultRef.current) resultRef.current.value = decodedText;
                setLastMessage(`Found: ${decodedText}`);
            } catch (error) {
                console.error("Error decoding QR code: ", error);
                setLastMessage("Error: Could not read QR code from the selected file.");
            }
        },
        [],
    );

    const handleDrag = useCallback(
        (isDragging: boolean, isInvalid?: boolean) => (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(isDragging);

            let _isInvalid = isInvalid ?? false;
            if (isInvalid === undefined) {
                const items = Array.from(e.dataTransfer.items);
                const containsNonImage = items.some(
                    (item) => item.kind === "file" && !item.type.startsWith("image/"),
                );

                _isInvalid = containsNonImage;
            }
            setIsDragInvalid(_isInvalid);
        },
        [],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            handleDrag(false, false)(e);

            const files = Array.from(e.dataTransfer.files);

            // Filter out anything that isn't an image
            const imageFiles = files.filter((file) => file.type.startsWith("image/"));

            if (imageFiles.length !== files.length) {
                setLastMessage("Error: Only image files are allowed.");
                return;
            }

            if (imageFiles.length > 0) {
                void handleFileChange(imageFiles as unknown as FileList);
            }
        },
        [handleDrag, handleFileChange],
    );

    return (
        <TabsContent value="image" className="-mx-4 h-full overflow-y-auto px-4">
            <FieldGroup className="h-full">
                <Field className="pt-2 pb-4">
                    <div
                        className="bg-secondary relative flex aspect-square w-full max-w-sm shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                        onDragOver={handleDrag(true)} // Prevent default behavior to allow drop
                        onDragLeave={handleDrag(false, false)} // Reset visual state when leaving
                        onDrop={handleDrop} // Capture the files
                    >
                        <input
                            ref={resultRef}
                            type="text"
                            name="qr-value"
                            className="pointer-events-none absolute -z-50 size-full opacity-0"
                            required
                            tabIndex={-1}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            tabIndex={-1}
                        />
                        <div
                            className={cn(
                                "bg-secondary absolute flex size-full flex-col items-center justify-center",
                                isDragging && "z-20",
                                isDragInvalid &&
                                    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                            )}
                        >
                            <HugeiconsIcon icon={Upload01Icon} className="mb-4 size-16" />
                            {isDragging ? (
                                <span className="mb-1 text-2xl font-semibold">
                                    {isDragInvalid ? "File Not Supported" : "Drop Here"}
                                </span>
                            ) : (
                                <>
                                    <span className="mb-1 text-2xl font-semibold">
                                        Drag and Drop
                                    </span>
                                    <span>or pick a file to scan QR codes</span>
                                </>
                            )}
                        </div>
                        <canvas
                            ref={canvasRef}
                            className="z-10 size-full rounded-lg object-contain"
                        />
                    </div>
                    <div className="flex w-full justify-center">
                        <Badge
                            variant="secondary"
                            className={cn(
                                "inline-block max-w-full truncate!",
                                lastMessage?.startsWith("Found")
                                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                    : lastMessage?.startsWith("Error") &&
                                          "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                            )}
                        >
                            {lastMessage}
                        </Badge>
                    </div>
                    <Button type="button" onClick={() => fileInputRef.current?.click()}>
                        Pick a File
                    </Button>
                </Field>
            </FieldGroup>
        </TabsContent>
    );
}

interface AddDialogProps {
    handleSubmit: (ev: React.SubmitEvent<HTMLFormElement>) => void;
}
export function AddDialog({ handleSubmit }: AddDialogProps) {
    return (
        <DialogContent
            showCloseButton={false}
            className="flex flex-col overflow-hidden p-0! max-md:size-full max-md:max-w-full! md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]"
        >
            <form
                onSubmit={handleSubmit}
                className="flex h-full flex-col gap-4 overflow-y-hidden py-4 *:px-4"
            >
                <DialogHeader>
                    <DialogTitle>Add QR</DialogTitle>
                </DialogHeader>
                <FieldGroup className="-my-2 flex-1 overflow-y-hidden px-0! py-2 *:px-4">
                    <Field>
                        <FieldLabel className="gap-0.5" htmlFor="qr-name">
                            Name
                        </FieldLabel>
                        <Input
                            id="qr-name"
                            name="qr-name"
                            type="text"
                            placeholder="Enter name here"
                            onChange={(e) => (e.target.value = e.target.value.trimStart())}
                            onBlur={(e) => (e.target.value = e.target.value.trim())}
                        />
                    </Field>
                    <Field className="-my-4 h-full flex-1 overflow-y-hidden px-0!">
                        <Tabs defaultValue="text" className="size-full px-4">
                            <TabsList className="mt-2 w-full">
                                <TabsTrigger value="camera">Scan QR</TabsTrigger>
                                <TabsTrigger value="image">Upload Image</TabsTrigger>
                                <TabsTrigger value="text">Text Input</TabsTrigger>
                            </TabsList>
                            <CameraContent />
                            <ImageContent />
                            <TextContent />
                        </Tabs>
                    </Field>
                </FieldGroup>
                <DialogFooter className="mx-0">
                    <DialogClose render={<Button variant={"outline"}>Cancel</Button>} />
                    <Button type="submit">Add</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
