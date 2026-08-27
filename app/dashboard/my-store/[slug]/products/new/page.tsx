'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, categoryApi } from '@/lib/api';
import type { Category } from '@/types';
import { Button, Input, Textarea, Card, CardContent, Spinner } from '@/components/ui';
import { ImageUpload } from '@/components/ui/image-upload';
import { FIELD_LIMITS, requiredText, optionalText, isPositiveNumber, isNonNegativeInt } from '@/lib/validation';
import { sanitizeFormData, validateNumericField } from '@/lib/sanitize';

export default function NewProductPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.slug as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(data);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, images: 'Cada imagen no debe superar 5MB' }));
        return;
      }
      setFieldErrors((prev) => ({ ...prev, images: '' }));
      setImages((prev) => {
        if (prev.length >= 5) return prev;
        return [...prev, file];
      });
    } else {
      setImages([]);
    }
  };

  const handleImageChangeMultiple = (newFiles: File[]) => {
    const oversized = newFiles.some((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      setFieldErrors((prev) => ({ ...prev, images: 'Cada imagen no debe superar 5MB' }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, images: '' }));
    setImages((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 5);
    });
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: Record<string, string> = {};

    const nameError = requiredText(formData.name, FIELD_LIMITS.PRODUCT_NAME, 'El nombre');
    if (nameError) errors.name = nameError;

    const descError = requiredText(formData.description, FIELD_LIMITS.PRODUCT_DESCRIPTION, 'La descripción');
    if (descError) errors.description = descError;

    if (!isPositiveNumber(formData.price)) {
      errors.price = 'El precio debe ser un número mayor o igual a 0';
    }
    if (!isNonNegativeInt(formData.stock)) {
      errors.stock = 'El stock debe ser un número entero mayor o igual a 0';
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Debes seleccionar una categoría';
    }

    if (images.length === 0) {
      errors.images = 'Debes subir al menos una imagen principal';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Por favor corrige los campos marcados en rojo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);

      const price = validateNumericField(formData.price, {});
      const stock = validateNumericField(formData.stock, { integer: true });
      data.append('price', String(price));
      data.append('stock', String(stock));

      data.append('categoryId', formData.categoryId);
      data.append('storeSlug', storeSlug);

      if (images.length > 0) {
        data.append('mainImage', images[0]);
        images.slice(1).forEach((img) => {
          data.append('additionalImages', img);
        });
      }

      await productApi.create(sanitizeFormData(data));
      router.push(`/dashboard/my-store/${storeSlug}/products`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuevo Producto</h1>

      {error && (
        <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              label="Imágenes del producto"
              onChange={handleImageChange}
              onChangeMultiple={handleImageChangeMultiple}
              onFileRemove={handleImageRemove}
              accept="image/*"
              multiple
              maxImages={5}
            />
            {fieldErrors.images && (
              <p className="text-xs font-medium text-red-600">{fieldErrors.images}</p>
            )}

            <Input
              label="Nombre del producto"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del producto"
              required
              maxLength={FIELD_LIMITS.PRODUCT_NAME}
              error={fieldErrors.name}
            />

            <Textarea
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del producto..."
              rows={3}
              maxLength={FIELD_LIMITS.PRODUCT_DESCRIPTION}
              error={fieldErrors.description}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Precio"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
                error={fieldErrors.price}
              />
              <Input
                label="Stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
                error={fieldErrors.stock}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                  fieldErrors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <p className="text-xs font-medium text-red-600">{fieldErrors.categoryId}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={isSubmitting}>
                Crear Producto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/my-store/${storeSlug}/products`)}
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