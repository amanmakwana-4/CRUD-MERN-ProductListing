import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';

function Products() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/products');
        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          setError('Unable to load products');
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      setProducts((current) => current.filter((product) => product._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete product');
    }
  };

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-gray-500 md:px-8">Loading products...</div>;
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">
              {products.length ? `${products.length} products available` : 'Manage your product inventory'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/add-product')}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 sm:w-auto"
          >
            Add Product
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">No products yet</h2>
            <p className="mt-2 text-sm text-gray-500">Start by adding your first product.</p>
            <button
              type="button"
              onClick={() => navigate('/add-product')}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 sm:w-auto"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                canEdit={user && product.createdBy?._id === user._id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
