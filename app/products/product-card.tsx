'use client';

import Link from 'next/link';
import Image from 'next/image';
import { memo } from 'react';
import type { Product } from '@/types';
import { Badge, Button } from '@/components/ui';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { getProductId, getProductSlug } from '@/types';

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
  showEdit?: boolean;
  editHref?: string;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  showWishlist = true,
  showEdit = false,
  showDelete = false,
  editHref,
  onDelete,
}: ProductCardProps) {
  const productId = getProductId(product);
  const productSlug = getProductSlug(product);
  const imageUrl = product.mainImageUrl || product.imageUrls?.[0] || '/placeholder-product.jpg';
  const { isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist: checkInStore } = useWishlistStore();
  const isInWishlist = checkInStore(productId);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isInWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onDelete) return;
    const confirmed = window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`);
    if (confirmed) {
      await onDelete(productId);
    }
  };

  return (
    <div className="relative group">
      {/* Edit Button */}
      {showEdit && editHref && (
        <div className="absolute top-3 left-3 z-20">
          <Link href={editHref}>
            <Button
              variant="outline"
              size="sm"
              className="bg-surface/95 backdrop-blur-sm text-xs font-mono uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--gray-300)]"
            >
              Editar
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Button */}
      {showDelete && onDelete && (
        <div className="absolute top-3 right-3 z-20">
          <Button
            variant="danger"
            size="sm"
            className="bg-danger/95 backdrop-blur-sm text-xs font-mono uppercase tracking-wider"
            onClick={handleDeleteClick}
          >
            Eliminar
          </Button>
        </div>
      )}

      <Link href={`/products/${productSlug}`} className="block">
        <div className="industrial-card rounded-none overflow-hidden transition-all duration-300 hover:shadow-[8px_8px_0px_-2px_var(--gray-400)]">
          {/* Image Container */}
          <div
            className="relative bg-gray-100 overflow-hidden border-b-2 border-gray-200"
            style={{ aspectRatio: '4/3' }}
          >
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
            />

            {/* Noise Overlay on Image */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                backgroundSize: '128px 128px',
              }}
            />

            {/* Wishlist Button */}
            {showWishlist && (
              <button
                onClick={handleWishlistClick}
                disabled={!isAuthenticated}
                className={`absolute top-3 right-3 z-10 p-2.5 border-2 transition-all duration-200 ${
                  isInWishlist
                    ? 'bg-primary text-white border-primary scale-110'
                    : 'bg-surface/90 backdrop-blur-sm text-gray-400 border-gray-300 hover:text-primary hover:border-primary'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isInWishlist ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}

            {/* Out of Stock Overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-surface/70 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-gray-800 text-white text-xs font-display font-semibold px-4 py-1.5 uppercase tracking-wider border-2 border-gray-700">
                  Sin stock
                </span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-2 p-4 bg-surface">
            {product.store?.storeName && (
              <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider truncate">
                {product.store.storeName}
              </p>
            )}
            <h3 className="font-display font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            <div className="flex items-center justify-between mt-1 pt-3 border-t-2 border-gray-100">
              <span className="text-lg font-mono font-bold text-primary tracking-tight">
                ${product.price.toFixed(2)}
              </span>
              {product.stock > 0 && (
                <Badge variant="success" className="text-[11px] font-mono">
                  {product.stock} en stock
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

export default ProductCard;
