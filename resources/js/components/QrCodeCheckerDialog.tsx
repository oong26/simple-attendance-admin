import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { CheckCircle2, Loader2, QrCode, RotateCcw, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ShiftInfo {
    name: string;
    start_time: string;
    end_time: string;
}

interface DepartmentInfo {
    name: string;
    shift: ShiftInfo | null;
}

interface EmployeeResult {
    id: string;
    name: string;
    email: string;
    phone: string;
    photo_url: string | null;
    contract_type: string | null;
    job_title: string | null;
    is_active: boolean;
    department: DepartmentInfo | null;
}

interface QrCodeCheckerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QrCodeCheckerDialog({ open, onOpenChange }: QrCodeCheckerDialogProps) {
    const controlsRef = useRef<IScannerControls | null>(null);
    const hasScannedRef = useRef(false);

    const [scanKey, setScanKey] = useState(0);
    const [scanning, setScanning] = useState(false);
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<EmployeeResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const stopScanner = useCallback(() => {
        if (controlsRef.current) {
            try { controlsRef.current.stop(); } catch (_) { /* ignore */ }
            controlsRef.current = null;
        }
        setScanning(false);
    }, []);

    const checkQrData = useCallback(async (rawValue: string) => {
        stopScanner();
        setChecking(true);
        setResult(null);
        setError(null);

        try {
            // Laravel + Inertia uses cookie-based CSRF (no meta tag).
            // Read the XSRF-TOKEN cookie and pass it as X-XSRF-TOKEN.
            const xsrfMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
            const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch[1]) : '';

            const response = await fetch('/employees/check-qrcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                body: JSON.stringify({ qr_data: rawValue }),
            });

            const data = await response.json();
            if (data.success) {
                setResult(data.employee);
            } else {
                setError(data.message ?? 'Unknown error.');
            }
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setChecking(false);
        }
    }, [stopScanner]);

    // Use a ref-callback on the <video> so we start scanning the instant the
    // element is actually mounted in the DOM (avoids the timing race with
    // Dialog's animation delay).
    const videoRefCallback = useCallback(
        (videoEl: HTMLVideoElement | null) => {
            if (!videoEl || controlsRef.current) return;

            hasScannedRef.current = false;
            setCameraError(null);

            const reader = new BrowserQRCodeReader();

            reader
                .decodeFromConstraints(
                    { video: { facingMode: 'environment' } },
                    videoEl,
                    (scanResult, err) => {
                        if (scanResult && !hasScannedRef.current) {
                            hasScannedRef.current = true;
                            checkQrData(scanResult.getText());
                        }
                        void err; // suppress continuous not-found errors
                    },
                )
                .then((controls) => {
                    controlsRef.current = controls;
                    setScanning(true);
                })
                .catch((e) => {
                    console.error('Camera error:', e);
                    setCameraError(
                        'Could not access camera. Please allow camera permissions and try again.',
                    );
                });
        },
        [checkQrData],
    );

    // Clean up when dialog closes
    useEffect(() => {
        if (!open) {
            stopScanner();
            hasScannedRef.current = false;
            setResult(null);
            setError(null);
            setCameraError(null);
            setChecking(false);
            setScanKey(0);
        }
    }, [open, stopScanner]);

    const handleReset = () => {
        stopScanner();
        hasScannedRef.current = false;
        setResult(null);
        setError(null);
        setCameraError(null);
        // Increment key → React unmounts old <video> and mounts a new one
        // → videoRefCallback fires with the fresh element → camera restarts
        setScanKey((k) => k + 1);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Scan QR Code
                    </DialogTitle>
                    <DialogDescription>
                        Point the camera at an employee QR code to verify if it's registered.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {/* Camera viewfinder — conditionally rendered so it truly unmounts
                        when result/error shows. The ref-callback fires again on the
                        fresh element each time scanKey increments ("Scan Again"). */}
                    {!result && !error && (
                        <div className="relative overflow-hidden rounded-xl border bg-black">
                            <video
                                key={scanKey}
                                ref={videoRefCallback}
                                autoPlay
                                playsInline
                                muted
                                className="h-64 w-full object-cover"
                            />

                            {/* Scanning overlay */}
                            {scanning && !checking && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="relative h-48 w-48">
                                        <span className="absolute top-0 left-0 h-8 w-8 rounded-tl-md border-l-4 border-t-4 border-white" />
                                        <span className="absolute top-0 right-0 h-8 w-8 rounded-tr-md border-r-4 border-t-4 border-white" />
                                        <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-md border-b-4 border-l-4 border-white" />
                                        <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-md border-b-4 border-r-4 border-white" />
                                        <div className="animate-scan-line absolute inset-x-0 top-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]" />
                                    </div>
                                </div>
                            )}

                            {/* Status bar */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-center text-sm text-white">
                                {cameraError ? (
                                    <span className="text-red-400">{cameraError}</span>
                                ) : checking ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Verifying…
                                    </span>
                                ) : scanning ? (
                                    <span className="text-emerald-300">Scanning for QR code…</span>
                                ) : (
                                    <span className="text-white/60">Starting camera…</span>
                                )}
                            </div>
                        </div>
                    )}


                    {/* Success result */}
                    {result && (
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/30">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                    QR code is registered
                                </span>
                            </div>

                            <div className="flex items-start gap-4 p-4">
                                {result.photo_url ? (
                                    <img
                                        src={result.photo_url}
                                        alt={result.name}
                                        className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-border"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground ring-2 ring-border">
                                        No Img
                                    </div>
                                )}

                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="truncate font-semibold">{result.name}</h3>
                                        <Badge
                                            variant={result.is_active ? 'default' : 'destructive'}
                                            className="shrink-0 text-[10px]"
                                        >
                                            {result.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {result.email}
                                    </p>
                                    {result.phone && (
                                        <p className="text-sm text-muted-foreground">
                                            {result.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 divide-x border-t">
                                <div className="px-4 py-3">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Department
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium">
                                        {result.department?.name ?? '—'}
                                    </p>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Job Title
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium">
                                        {result.job_title ?? '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error result */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                            <div>
                                <p className="text-sm font-medium text-destructive">
                                    Not Registered
                                </p>
                                <p className="text-sm text-destructive/80">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {(result || error) && (
                        <Button variant="outline" onClick={handleReset} className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Scan Again
                        </Button>
                    )}
                    <Button
                        variant={result || error ? 'default' : 'outline'}
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
