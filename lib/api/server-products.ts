import type { Product } from '@/types';

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.INTERNAL_API_ORIGIN || "http://commons-proxy:80"}/api/v1/products/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getProducts(filters?: Record<string, unknown>): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      });
    }

    const response = await fetch(`${process.env.INTERNAL_API_ORIGIN || "http://commons-proxy:80"}/api/v1/products?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.products || data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}