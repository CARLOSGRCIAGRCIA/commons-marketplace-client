'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/use-products';
import { productApi, categoryApi } from '@/lib/api';
import type { Category } from '@/types';
import { Button, Input, Textarea, Card, CardContent, Spinner } from '@/components/ui';
import { ImageUpload } from '@/components/ui/image-upload';

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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    status: 'active',
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
    if (product) {
      const newFormData = {
        name: product.name || '',
        description: product.description || '',
        price: String(product.price),
        stock: String(product.stock),
        categoryId: product.categoryId || '',
        status: product.status || 'active',
      };
      setFormData((prev) => {
        if (
          prev.name === newFormData.name &&
          prev.price === newFormData.price &&
          prev.stock === newFormData.stock
        ) {
          return prev;
        }
        return newFormData;
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImages([file]);
    } else {
      setImages([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('categoryId', formData.categoryId);
      data.append('status', formData.status);
      
      if (images.length > 0) {
        data.append('mainImage', images[0]);
        images.slice(1).forEach((img) => {
          data.append('additionalImages', img);
        });
      }

      await productApi.update(productId, data);
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

            <Input
              label="Nombre del producto"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Textarea
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
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
              />
              <Input
                label="Stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
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
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
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