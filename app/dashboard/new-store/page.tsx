'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storeApi } from '@/lib/api';
import { Button, Input, Textarea, Card, CardContent } from '@/components/ui';
import { ImageUpload } from '@/components/ui/image-upload';

export default function NewStorePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('storeName', formData.storeName);
      data.append('description', formData.description);
      if (logo) {
        data.append('logo', logo);
      }
      await storeApi.create(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tienda');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Tienda</h1>

      {error && (
        <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              label="Logo de la tienda"
              value={logo ? URL.createObjectURL(logo) : undefined}
              onChange={setLogo}
              accept="image/*"
            />

            <Input
              label="Nombre de la tienda"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="Mi Tienda"
              required
            />

            <Textarea
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción de tu tienda..."
              rows={4}
            />

            <div className="flex gap-4">
              <Button type="submit" isLoading={isSubmitting}>
                Crear Tienda
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}