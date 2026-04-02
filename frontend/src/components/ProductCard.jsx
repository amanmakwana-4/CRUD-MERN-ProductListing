import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product, canEdit, onDelete }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${product.name}"?`);
    if (!confirmed) {
      return;
    }
    setIsDeleting(true);
    await onDelete(product._id);
    setIsDeleting(false);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="h-48 overflow-hidden bg-gray-100">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
        )}
      </div>
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm font-semibold text-blue-600">INR {product.price}</p>
          <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
        </div>
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`/products/${product._id}`)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            View
          </button>
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={() => navigate(`/edit-product/${product._id}`)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
