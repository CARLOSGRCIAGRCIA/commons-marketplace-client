import type { Store } from '@/types';

export async function getStoreById(id: string): Promise<Store | null> {
  try {
    const response = await fetch(`${process.env.INTERNAL_API_ORIGIN || "http://commons-proxy:80"}/api/v1/stores/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

export async function getStores(status?: string): Promise<Store[]> {
  try {
    const url = status 
      ? `${process.env.INTERNAL_API_ORIGIN || "http://commons-proxy:80"}/api/v1/stores?status=${status}`
      : `${process.env.INTERNAL_API_ORIGIN || "http://commons-proxy:80"}/api/v1/stores`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
}