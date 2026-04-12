import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toPng } from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useRef, useState } from 'react';

interface Employee {
    id: string | number;
    name: string;
    email?: string | null;
    phone?: string | null;
    photo?: string | null;
    photo_url?: string | null;
    job_title?: string | null;
    department?: { name: string } | null;
    contract_type?: string | null;
}

interface IdCardModalProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Card render dimensions (half of native 661×1039 for crisp display;
// pixelRatio:2 on export restores native resolution).
const CARD_W = 330;
const CARD_H = 519;

export function IdCardModal({ employee, open, onOpenChange }: IdCardModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, ''); // strip non-digits just in case

    if (digits.length === 11) {
        return digits.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3'); // 0812-123-5532
    } else if (digits.length === 12) {
        return digits.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3'); // 0812-1235-5323
    } else if (digits.length === 13) {
        return digits.replace(/(\d{4})(\d{4})(\d{5})/, '$1-$2-$3'); // 0812-1235-53234
    }

    return phone; // fallback: return as-is if unexpected length
    };

    const handleDownload = useCallback(async () => {
        if (!cardRef.current || !employee) return;
        try {
            setIsDownloading(true);
            const dataUrl = await toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                cacheBust: true,
            });
            const link = document.createElement('a');
            link.download = `ID_Card_${employee.name.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to generate ID card:', error);
            alert('Failed to generate ID card. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    }, [employee]);

    const photoSrc = employee?.photo || employee?.photo_url || null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col items-center sm:max-w-md">
                <DialogHeader className="w-full">
                    <DialogTitle className="text-center">Employee ID Card</DialogTitle>
                    <DialogDescription className="text-center">
                        Preview and download the ID card.
                    </DialogDescription>
                </DialogHeader>

                {employee && (
                    <div className="flex w-full justify-center rounded-xl p-4">
                        {/*
                         * ID CARD — bg image is 661×1039, rendered at 330×519 (÷2).
                         * All dynamic content is absolute-positioned over the background.
                         *
                         * Layout guide (% of card height/width):
                         *   Photo frame  : top ~17%, left ~21%, w ~55%, h ~38%
                         *   Name         : top ~60%
                         *   Job title    : top ~66%
                         *   Contact grid : top ~71%
                         *   QR code      : top ~80%
                         *   Footer       : top ~93%
                         */}
                        <div
                            ref={cardRef}
                            style={{
                                position: 'relative',
                                width: `${CARD_W}px`,
                                height: `${CARD_H}px`,
                                borderRadius: '14px',
                                overflow: 'hidden',
                                boxShadow: '0 6px 32px rgba(0,0,0,0.22)',
                                fontFamily: "'Arial', sans-serif",
                                flexShrink: 0,
                            }}
                        >
                            {/* ── Background image ── */}
                            <img
                                src="/assets/images/bg-id-card.png"
                                alt=""
                                crossOrigin="anonymous"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'fill',
                                    display: 'block',
                                }}
                            />

                            {/* ── Photo (double-border: dark navy → white → photo) ── */}
                            {/* Outer wrapper: 3px dark navy border + 5px white padding */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${CARD_H * 0.175}px`,
                                    left: `${CARD_W * 0.215}px`,
                                    width: `${CARD_W * 0.565}px`,
                                    height: `${CARD_H * 0.375}px`,
                                    borderRadius: '16px',
                                    border: '3px solid #1a1a6e',
                                    padding: '5px',
                                    background: 'white',
                                    boxSizing: 'border-box',
                                }}
                            >
                                {/* Inner layer: clips photo to rounded corners */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        background: '#cde0d0',
                                    }}
                                >
                                    {photoSrc ? (
                                        <img
                                            src={photoSrc}
                                            alt={employee.name}
                                            crossOrigin="anonymous"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center top',
                                                display: 'block',
                                            }}
                                        />
                                    ) : (
                                        <svg
                                            viewBox="0 0 186 195"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ width: '100%', height: '100%' }}
                                        >
                                            <rect width="186" height="195" fill="#b8d8e8" />
                                            <ellipse cx="110" cy="52" rx="36" ry="22" fill="white" />
                                            <ellipse cx="88" cy="60" rx="24" ry="16" fill="white" />
                                            <ellipse cx="128" cy="62" rx="20" ry="14" fill="white" />
                                            <ellipse cx="50" cy="175" rx="90" ry="44" fill="#7cb87c" />
                                            <ellipse cx="155" cy="182" rx="75" ry="38" fill="#6aaa6a" />
                                            <ellipse cx="93" cy="215" rx="130" ry="60" fill="#4e8a4e" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* ── Name ── */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${CARD_H * 0.595}px`,
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    fontSize: '15px',
                                    fontWeight: '800',
                                    color: '#1a1a6e',
                                    letterSpacing: '0.01em',
                                    lineHeight: 1.2,
                                    padding: '0 12px',
                                }}
                            >
                                {employee.name}
                            </div>

                            {/* ── Divider (thin navy line) ── */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${CARD_H * 0.638}px`,
                                    left: `${CARD_W * 0.12}px`,
                                    right: `${CARD_W * 0.12}px`,
                                    height: '1.5px',
                                    background: '#1a1a6e',
                                }}
                            />

                            {/* ── Job title ── */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${CARD_H * 0.65}px`,
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#2563eb',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {employee.job_title || '-'}
                            </div>

                            {/* ── Contact grid (E-MAIL / PHONE) ── */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${CARD_H * 0.705}px`,
                                    left: `${CARD_W * 0.1}px`,
                                    right: `${CARD_W * 0.06}px`,
                                    display: 'grid',
                                    gridTemplateColumns: '44px 1fr',
                                    rowGap: '3px',
                                    columnGap: '6px',
                                    fontSize: '9px',
                                }}
                            >
                                <span style={{ fontWeight: '800', letterSpacing: '0.07em', color: '#444', textTransform: 'uppercase' }}>
                                    E-Mail
                                </span>
                                <span style={{ color: '#222', wordBreak: 'break-all' }}>
                                    {employee.email || '—'}
                                </span>
                                <span style={{ fontWeight: '800', letterSpacing: '0.07em', color: '#444', textTransform: 'uppercase' }}>
                                    Phone
                                </span>
                                <span style={{ color: '#222' }}>
                                    {employee.phone ? formatPhone(employee.phone) : '-'}
                                </span>
                            </div>

                            {/* ── QR Code ── */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${CARD_H * 0.795}px`,
                                    left: 0,
                                    right: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <QRCodeSVG
                                    value={JSON.stringify({ employee_id: employee.id })}
                                    size={70}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            {/* ── Footer ── */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${CARD_H * 0.935}px`,
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    fontSize: '8px',
                                    letterSpacing: '0.14em',
                                    color: '#666',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                }}
                            >
                                SOLUSIMAKMUR.COM
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-2 w-full sm:justify-center">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={isDownloading}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        disabled={isDownloading || !employee}
                    >
                        {isDownloading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Download PNG
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
