import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Face, RGB } from '@/lib/color-utils';
import { sample3x3Averages } from '@/lib/color-utils';
import { Upload } from 'lucide-react';

interface Props {
  face: Face;
  title: string;
  onProcessed: (rgbGrid: RGB[], imageUrl: string) => void;
}

export const CubeFaceUploader: React.FC<Props> = ({ face, title, onProcessed }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = async () => {
      const rgbs = await sample3x3Averages(img);
      onProcessed(rgbs, url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title} ({face})</h3>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2" /> {preview ? 'Re-upload' : 'Upload'}
          </Button>
        </div>
      </div>
      <div className="rounded-md border bg-card p-2 flex items-center justify-center min-h-24">
        {preview ? (
          <img src={preview} alt={`${title} face preview`} className="max-h-36 rounded-sm" />
        ) : (
          <p className="text-sm text-muted-foreground">No image uploaded</p>
        )}
      </div>
    </div>
  );
};
