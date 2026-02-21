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
import { Download, Loader2, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useRef, useState } from 'react';

// Using a partial Employee interface matched to what employees/index.tsx provides
interface Employee {
    id: string | number;
    name: string;
    photo?: string | null;
    department?: { name: string } | null;
    contract_type?: string | null;
}

interface IdCardModalProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function IdCardModal({ employee, open, onOpenChange }: IdCardModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = useCallback(async () => {
        if (!cardRef.current || !employee) return;
        
        try {
            setIsDownloading(true);
            const dataUrl = await toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 4, // High resolution for print clarity
                cacheBust: true, // Prevents cached CORS errors
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col items-center sm:max-w-md">
                <DialogHeader className="w-full">
                    <DialogTitle className="text-center">
                        Employee ID Card
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Preview and download the ID card.
                    </DialogDescription>
                </DialogHeader>

                {employee && (
                    <div className="flex w-full justify-center overflow-hidden rounded-xl bg-slate-100 p-8">
                        {/* ID CARD CONTAINER */}
                        <div 
                            ref={cardRef} 
                            className="relative flex h-[410px] w-[260px] flex-col items-center overflow-hidden rounded-2xl bg-white shadow-xl"
                            style={{ fontFamily: 'sans-serif' }}
                        >
                            {/* Colorful Header Background */}
                            <div className="absolute left-0 right-0 top-0 h-32 rounded-b-[40%] bg-gradient-to-br from-indigo-600 to-blue-800 shadow-inner"></div>
                            
                            {/* Logo */}
                            <div className="z-10 mt-6 rounded-lg bg-white/95 p-1.5 shadow-sm backdrop-blur-sm">
                                <img src="/logo.png" alt="Logo" className="h-8 object-contain" crossOrigin="anonymous" />
                            </div>

                            {/* Photo / Avatar */}
                            <div className="z-10 mt-5 relative">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
                                    {employee.photo ? (
                                        <img 
                                            src={employee.photo} 
                                            alt={employee.name} 
                                            className="h-full w-full object-cover"
                                            crossOrigin="anonymous"
                                        />
                                    ) : (
                                        <User className="h-12 w-12 text-slate-400" />
                                    )}
                                </div>
                            </div>

                            {/* Employee Info */}
                            <div className="z-10 mt-3 flex w-full flex-col items-center px-4 text-center">
                                <h3 className="line-clamp-2 text-lg font-bold leading-tight text-slate-800">
                                    {employee.name}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-blue-600">
                                    {employee.department?.name || 'No Department'}
                                </p>
                                {employee.contract_type && (
                                    <span className="mt-2 inline-block rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm">
                                        {employee.contract_type.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

                            {/* QR Code */}
                            <div className="z-10 mb-6 mt-auto rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
                                <QRCodeSVG
                                    value={JSON.stringify({ employee_id: employee.id })}
                                    size={64}
                                    level="H"
                                    includeMargin={false}
                                />
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
