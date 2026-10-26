'use client';

import * as React from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloudIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  maxFiles?: number;
}

export function Dropzone({
  onFilesAccepted,
  disabled,
  className,
  label = 'Drop PDF files here, or click to browse',
  maxFiles = 5,
}: DropzoneProps) {
  const onDropRejected = React.useCallback((rejections: FileRejection[]) => {
    rejections.forEach(({ file, errors }) => {
      toast.error(`${file.name}: ${errors.map((e) => e.message).join(', ')}`);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled,
    onDropAccepted: onFilesAccepted,
    onDropRejected,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center text-xs',
        isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <input {...getInputProps()} />
      <UploadCloudIcon className="size-6 text-muted-foreground mb-1.5" />
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground mt-0.5">
        PDFs up to 10MB (max {maxFiles} files)
      </span>
    </div>
  );
}
