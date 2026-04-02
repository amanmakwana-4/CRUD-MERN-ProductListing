import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          setError('Unable to load product');
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!product) {
      return;
    }

    const confirmed = window.confirm(`Delete "${product.name}"?`);
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      await API.delete(`/products/${product._id}`);
      navigate('/products');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete product');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-gray-500 md:px-8">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="px-4 py-16 text-center md:px-8">
        <p className="text-sm text-red-600">{error || 'Product not found'}</p>
        <Link to="/products" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700">
          Back to products
        </Link>
      </div>
    );
  }

  const canEdit = user && product.createdBy?._id === user._id;

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6">
          <Link to="/products" className="text-sm text-blue-600 hover:text-blue-700">
            Back to products
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full max-h-[420px] w-full object-cover" />
              ) : (
                <div className="flex h-[320px] items-center justify-center text-sm text-gray-400">No image</div>
              )}
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500">{product.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-gray-500">Price</p>
                  <p className="text-xl font-semibold text-blue-600">INR {product.price}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-gray-500">Quantity</p>
                  <p className="text-sm text-gray-900">{product.quantity}</p>
                </div>
              </div>
              {canEdit ? (
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
