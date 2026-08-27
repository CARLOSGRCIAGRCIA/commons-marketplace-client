'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/use-products';
import { productApi, categoryApi } from '@/lib/api';
import type { Category } from '@/types';
import { Button, Input, Textarea, Card, CardContent, Spinner } from '@/components/ui';
import { ImageUpload } from '@/components/ui/image-upload';
import { FIELD_LIMITS, requiredText, isPositiveNumber, isNonNegativeInt } from '@/lib/validation';
import { sanitizeFormData, validateNumericField } from '@/lib/sanitize';

const PRODUCT_STATUSES = ['Active', 'Inactive'] as const;

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.prodId as string;
  const storeSlug = params.slug as string;

  const { product, isLoading } = useProduct(productId);
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
    status: 'Active',
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

  useEffect(() => {
    if (!product) return;
    // Deferred to a timeout: synchronous setState inside effect bodies
    // is disallowed by react-hooks/set-state-in-effect.
    const timer = setTimeout(() => {
      const normalizedStatus = PRODUCT_STATUSES.includes(product.status as (typeof PRODUCT_STATUSES)[number])
        ? (product.status as string)
        : 'Active';
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price),
        stock: String(product.stock),
        categoryId: product.categoryId || '',
        status: normalizedStatus,
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [product]);

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
      setImages([file]);
    } else {
      setImages([]);
    }
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
      data.append('status', formData.status);

      if (images.length > 0) {
        data.append('mainImage', images[0]);
        images.slice(1).forEach((img) => {
          data.append('additionalImages', img);
        });
      }

      await productApi.update(productId, sanitizeFormData(data));
      router.push(`/dashboard/my-store/${storeSlug}/products`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar producto');
    } finally {
      setIsSubmitting(false);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Producto</h1>

      {error && (
        <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              label="Imágenes del producto"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              maxImages={5}
              images={product?.imageUrls}
            />
            {fieldErrors.images && (
              <p className="text-xs font-medium text-red-600">{fieldErrors.images}</p>
            )}

            <Input
              label="Nombre del producto"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={FIELD_LIMITS.PRODUCT_NAME}
              error={fieldErrors.name}
            />

            <Textarea
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {PRODUCT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === 'Active' ? 'Activo' : 'Inactivo'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={isSubmitting}>
                Guardar Cambios
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