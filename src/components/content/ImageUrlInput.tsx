import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink, Upload, Link as LinkIcon, ChevronDown, ChevronUp, X } from 'lucide-react';
import { validateImageUrl } from '@/lib/markdown-utils';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export function ImageUrlInput({ value, onChange, label, error }: ImageUrlInputProps) {
  const [imageError, setImageError] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, isUploading, uploadProgress, validateFile } = useImageUpload();

  const handleUrlChange = (newValue: string) => {
    onChange(newValue);
    setIsValidUrl(validateImageUrl(newValue) || newValue === '');
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      onChange(imageUrl);
      setIsValidUrl(true);
      setImageError(false);
    } catch (error: any) {
      console.error('Upload failed:', error);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClearImage = () => {
    onChange('');
    setIsValidUrl(true);
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !value && 'border-muted-foreground/25 hover:border-muted-foreground/50',
          value && 'border-green-500/50 bg-green-50/50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!value ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">
              {isDragging ? 'Drop image here' : 'Upload an image'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Drag and drop, or click to browse
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, GIF, or WebP (max 10 MB)
            </p>
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-green-700">
              <Upload className="h-4 w-4" />
              <span className="font-medium">Image uploaded successfully</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearImage}
              disabled={isUploading}
            >
              <X className="mr-2 h-4 w-4" />
              Remove & Upload Different Image
            </Button>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Advanced: URL Input */}
      <div className="border-t pt-2">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LinkIcon className="h-4 w-4" />
          <span>Advanced: Use image URL instead</span>
          {showUrlInput ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showUrlInput && (
          <div className="mt-2 space-y-2">
            <Input
              type="url"
              value={value}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={!isValidUrl ? 'border-destructive' : ''}
              disabled={isUploading}
            />
            {!isValidUrl && value && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please enter a valid image URL (jpg, jpeg, png, gif, webp, svg)
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Image Preview */}
      {value && isValidUrl && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Preview:</span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              View full size <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="relative rounded-lg border bg-muted overflow-hidden">
            {imageError ? (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-2" />
                <p className="text-sm">Failed to load image</p>
                <p className="text-xs">Check if the URL is correct and accessible</p>
              </div>
            ) : (
              <img
                src={value}
                alt="Preview"
                className="w-full h-auto max-h-[300px] object-contain"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
