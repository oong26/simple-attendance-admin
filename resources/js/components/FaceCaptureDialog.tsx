import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import * as faceapi from '@vladmandic/face-api';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FaceCaptureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCapture: (file: File, embedding: number[]) => void;
}

export function FaceCaptureDialog({
    open,
    onOpenChange,
    onCapture,
}: FaceCaptureDialogProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [lastDetection, setLastDetection] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load models
    useEffect(() => {
        if (!open) return;

        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
            } catch (err: any) {
                console.error('Error loading face-api models:', err);
                setError(
                    'Failed to load face detection models. Please check your internet connection.',
                );
            }
        };

        if (!modelsLoaded) {
            loadModels();
        }
    }, [open, modelsLoaded]);

    // Start video stream
    useEffect(() => {
        if (!open || !modelsLoaded) return;

        let activeStream: MediaStream | null = null;
        const startVideo = async () => {
            try {
                activeStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                });
                setStream(activeStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = activeStream;
                }
            } catch (err: any) {
                console.error('Error accessing webcam:', err);
                setError(
                    'Could not access your webcam. Please allow camera permissions.',
                );
            }
        };

        startVideo();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [open, modelsLoaded]);

    const handleVideoPlay = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

        setIsDetecting(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;

        let animationFrameId: number;

        const scan = async () => {
            if (!video || video.paused || video.ended) return;

            // Determine dimensions based on video element
            const displaySize = {
                width: video.videoWidth,
                height: video.videoHeight,
            };
            if (displaySize.width === 0) {
                animationFrameId = requestAnimationFrame(scan);
                return;
            }

            faceapi.matchDimensions(canvas, displaySize);

            const detection = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                const resizedDetections = faceapi.resizeResults(
                    detection,
                    displaySize,
                );
                canvas
                    .getContext('2d')
                    ?.clearRect(0, 0, canvas.width, canvas.height);
                // faceapi.draw.drawDetections(canvas, resizedDetections);
                // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                // Draw a simple box instead of the full landmarks for cleaner UI if desired
                const box = resizedDetections.detection.box;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(box.x, box.y, box.width, box.height);
                }

                setFaceDetected(true);
                setLastDetection(detection);
            } else {
                canvas
                    .getContext('2d')
                    ?.clearRect(0, 0, canvas.width, canvas.height);
                setFaceDetected(false);
            }

            animationFrameId = requestAnimationFrame(scan);
        };

        scan();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [modelsLoaded]);

    const handleCapture = async () => {
        if (!videoRef.current || !lastDetection) return;

        const video = videoRef.current;

        // Capture image from video
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const file = new File([blob], 'face-capture.jpg', {
                            type: 'image/jpeg',
                        });
                        // Convert Float32Array to regular Array
                        const descriptorArray = Array.from(
                            lastDetection.descriptor,
                        );
                        onCapture(file, descriptorArray);
                        onOpenChange(false);
                    }
                },
                'image/jpeg',
                0.9,
            );
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v && stream) {
                    stream.getTracks().forEach((track) => track.stop());
                    setStream(null);
                }
                onOpenChange(v);
            }}
        >
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Record Face</DialogTitle>
                    <DialogDescription>
                        Please position your face clearly in the camera view
                        until a green box appears.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-md bg-black">
                    {error ? (
                        <div className="p-4 text-center text-red-500">
                            {error}
                        </div>
                    ) : !modelsLoaded ? (
                        <div className="text-white">
                            Loading face-api models...
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                onPlay={handleVideoPlay}
                                className="h-auto max-h-[400px] w-full object-cover"
                            />
                            <canvas
                                ref={canvasRef}
                                className="pointer-events-none absolute top-0 left-0 h-full w-full"
                            />
                        </>
                    )}
                </div>

                <DialogFooter className="flex w-full items-center justify-between sm:justify-between">
                    <div className="w-full text-sm text-muted-foreground">
                        {modelsLoaded &&
                            !error &&
                            (faceDetected ? (
                                <span className="font-medium text-green-500">
                                    Face detected. Ready to capture.
                                </span>
                            ) : (
                                <span className="text-yellow-600">
                                    Looking for face...
                                </span>
                            ))}
                    </div>
                    <Button
                        type="button"
                        onClick={handleCapture}
                        disabled={!faceDetected || !modelsLoaded}
                        className="min-w-[120px]"
                    >
                        Capture & Use
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
