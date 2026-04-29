'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/hooks/use-stores';
import { storeApi } from '@/lib/api';
import { Button, Input, Textarea, Card, CardContent, Spinner } from '@/components/ui';
import { ImageUpload } from '@/components/ui/image-upload';

export default function EditStorePage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.slug as string;

  const { store, isLoading } = useStore(storeSlug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
  });

  useEffect(() => {
    if (store) {
      const newFormData = {
        storeName: store.storeName || '',
        description: store.description || '',
      };
      setFormData((prev) => {
        if (prev.storeName === newFormData.storeName && prev.description === newFormData.description) {
          return prev;
        }
        return newFormData;
      });
    }
  }, [store]);

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
      const formDataToSend = new FormData() as unknown;
      const fd = formDataToSend as FormData;
      fd.append('storeName', formData.storeName);
      fd.append('description', formData.description);
      if (logo) {
        fd.append('logo', logo);
      }
      await storeApi.update(storeSlug, fd);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar tienda');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la tienda "${store?.storeName}"?\n\n` +
      `⚠️ IMPORTANTE: Esto eliminará também todos los productos e imágenes asociados.\n` +
      `Esta acción no se puede deshacer.`
    );
    if (!confirmed) {
      setIsDeleting(false);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await storeApi.delete(storeSlug);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar tienda');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Tienda</h1>

      {error && (
        <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              label="Logo de la tienda"
              value={logo ? URL.createObjectURL(logo) : store?.logo}
              onChange={setLogo}
              accept="image/*"
            />

            <Input
              label="Nombre de la tienda"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              required
            />

            <Textarea
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />

            <div className="flex gap-4">
              <Button type="submit" isLoading={isSubmitting}>
                Guardar Cambios
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

      <Card className="mt-6 border-red-200">
        <CardContent>
          <h2 className="text-lg font-semibold text-red-600 mb-4">Zona de Peligro</h2>
          <p className="text-sm text-gray-600 mb-4">
            Una vez que elimines tu tienda, no hay vuelta atrás. Todos los productos y datos asociados serán eliminados permanentemente.
          </p>
          <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
            Eliminar Tienda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}