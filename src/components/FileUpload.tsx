'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, File, Image, FileText } from 'lucide-react';
import { uploadSingleFile, uploadMultipleFiles, deleteFile, validateFile, formatFileSize, UploadedFile } from '@/services/uploadService';
import { toast } from 'sonner';

interface FileUploadProps {
  label: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  onFilesChange: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  multiple = false,
  maxFiles = 5,
  accept = "image/*,.pdf,.doc,.docx,.txt",
  onFilesChange,
  initialFiles = [],
  disabled = false
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    
    // Validate files
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(`${file.name}: ${validation.error}`);
        return;
      }
    }

    // Check file count limit
    if (multiple && files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    if (!multiple && fileArray.length > 1) {
      toast.error('Only one file allowed');
      return;
    }

    setUploading(true);

    try {
      let uploadedFiles: UploadedFile[];

      if (multiple && fileArray.length > 1) {
        const response = await uploadMultipleFiles(fileArray);
        uploadedFiles = response.files;
      } else {
        const response = await uploadSingleFile(fileArray[0]);
        uploadedFiles = [response.file];
      }

      const newFiles = multiple ? [...files, ...uploadedFiles] : uploadedFiles;
      setFiles(newFiles);
      onFilesChange(newFiles);
      
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = files[index];
    
    try {
      await deleteFile(fileToRemove.publicId);
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onFilesChange(newFiles);
      toast.success('File removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-[#2E8B57] bg-green-50'
            : 'border-gray-300 hover:border-[#2E8B57]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          {dragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-gray-500">
          {accept.includes('image') && 'Images, '}
          {accept.includes('pdf') && 'PDFs, '}
          Documents (max 10MB each)
        </p>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2E8B57]"></div>
            <span className="text-sm text-gray-600">Uploading...</span>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files:</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
