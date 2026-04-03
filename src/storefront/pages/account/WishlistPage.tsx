import React from 'react';
import { useStorefrontWishlist } from '@/storefront/hooks/useStorefrontWishlist';
import ProductCard from '@/storefront/components/shared/ProductCard';
import { Link } from 'react-router-dom';

const AccountWishlistPage: React.FC = () => {
  const { products, loading } = useStorefrontWishlist();

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight text-foreground mb-6">My Wishlist</h1>
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-bold text-foreground mb-2">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mb-4">Browse products and save your favourites.</p>
          <Link to="/store" className="text-sm font-bold text-primary hover:underline">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default AccountWishlistPage;
