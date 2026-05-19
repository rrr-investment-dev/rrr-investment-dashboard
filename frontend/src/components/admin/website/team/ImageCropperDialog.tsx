"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CropIcon, RotateCcw } from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function centerAspectCrop(width: number, height: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
    width,
    height
  );
}

async function getCroppedBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  fileName: string,
  mimeType: string = "image/jpeg"
): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = pixelCrop.width * scaleX;
  canvas.height = pixelCrop.height * scaleY;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        resolve(new File([blob], fileName, { type: mimeType }));
      },
      mimeType,
      0.92
    );
  });
}

// ─── Aspect Ratio Presets ──────────────────────────────────────────────────────
const ASPECT_PRESETS = [
  { label: "4 : 5", value: 4 / 5 },
  { label: "1 : 1", value: 1 },
  { label: "3 : 4", value: 3 / 4 },
  { label: "Free", value: undefined },
] as const;

// ─── Props ─────────────────────────────────────────────────────────────────────
interface ImageCropperDialogProps {
  open: boolean;
  imageSrc: string;
  fileName: string;
  mimeType?: string;
  defaultAspect?: number;
  onCropDone: (file: File, previewUrl: string) => void;
  onCancel: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ImageCropperDialog({
  open,
  imageSrc,
  fileName,
  mimeType = "image/jpeg",
  defaultAspect = 4 / 5,
  onCropDone,
  onCancel,
}: ImageCropperDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(defaultAspect);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset when dialog opens with a new image
  useEffect(() => {
    if (open) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setAspect(defaultAspect);
    }
  }, [open, imageSrc, defaultAspect]);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      if (aspect !== undefined) {
        setCrop(centerAspectCrop(width, height, aspect));
      }
    },
    [aspect]
  );

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current && newAspect !== undefined) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, newAspect));
    }
  };

  const handleReset = () => {
    if (imgRef.current && aspect !== undefined) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      setCrop(undefined);
    }
    setCompletedCrop(undefined);
  };

  const handleApply = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedBlob(
        imgRef.current,
        completedCrop,
        fileName,
        mimeType
      );
      const previewUrl = URL.createObjectURL(croppedFile);
      onCropDone(croppedFile, previewUrl);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        className="max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden gap-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <CropIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Crop Photo
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag to reposition · Resize handles to adjust
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Aspect ratio presets */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">
            Ratio
          </span>
          {ASPECT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleAspectChange(preset.value)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                aspect === preset.value
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={handleReset}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex items-center justify-center bg-slate-900 min-h-[320px] max-h-[440px] overflow-auto p-4">
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            keepSelection
            className="max-h-[400px]"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              className="max-h-[400px] max-w-full object-contain"
              onLoad={onImageLoad}
              draggable={false}
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 font-semibold"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!completedCrop || isProcessing}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 min-w-[120px]"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CropIcon className="h-4 w-4" />
                Apply Crop
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
