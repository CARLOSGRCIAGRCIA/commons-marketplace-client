'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (file: File | null) => void;
  onChangeMultiple?: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  maxImages?: number;
  images?: string[];
  onRemove?: (index: number) => void;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onChangeMultiple,
  onFileRemove,
  accept = 'image/*',
  multiple = false,
  maxImages = 1,
  images = [],
  onRemove,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [previews, setPreviews] = useState<string[]>(images);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (multiple) {
      const newPreviews: string[] = [];
      const filesArray = Array.from(files);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === filesArray.length) {
            setPreviews([...previews, ...newPreviews].slice(0, maxImages));
          }
        };
        reader.readAsDataURL(file);
      });
      if (onChangeMultiple) {
        onChangeMultiple(filesArray);
      } else if (filesArray.length > 0) {
        onChange(filesArray[0]);
      }
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePreview = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    if (onFileRemove) {
      onFileRemove(index);
    } else {
      onRemove?.(index);
    }
  };

  if (multiple) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
              <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemovePreview(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          {previews.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400"
            >
              <span className="text-2xl text-gray-400">+</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-gray-100">
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            {preview ? 'Cambiar imagen' : 'Seleccionar imagen'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              Eliminar
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}