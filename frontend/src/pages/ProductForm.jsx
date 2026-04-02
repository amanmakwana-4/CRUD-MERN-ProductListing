import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput';
import API from '../services/api';

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);
        if (response.data.success) {
          const product = response.data.data;
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            quantity: product.quantity || '',
          });
        } else {
          setErrors({ submit: 'Unable to load product' });
        }
      } catch (requestError) {
        setErrors({ submit: requestError.response?.data?.message || 'Unable to load product' });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      nextErrors.description = 'Description is required';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      nextErrors.price = 'Enter a valid price';
    }
    if (formData.quantity === '' || Number(formData.quantity) < 0) {
      nextErrors.quantity = 'Enter a valid quantity';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('quantity', formData.quantity);

      if (image) {
        payload.append('image', image);
      }

      const response = isEdit
        ? await API.put(`/products/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await API.post('/products', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

      if (response.data.success) {
        navigate(`/products/${response.data.data._id}`);
      } else {
        setErrors({ submit: 'Unable to save product' });
      }
    } catch (requestError) {
      setErrors({ submit: requestError.response?.data?.message || 'Unable to save product' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-gray-500 md:px-8">Loading product...</div>;
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-[1200px] justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Update product information' : 'Create a new product entry'}
            </p>
          </div>
          {errors.submit ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.submit}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              name="name"
              label="Product Name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                Description
                <span className="ml-1 text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition ${
                  errors.description
                    ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
              {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
            </div>
            <FormInput
              name="price"
              type="number"
              step="0.01"
              min="0"
              label="Price"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              required
            />
            <FormInput
              name="quantity"
              type="number"
              min="0"
              label="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              required
            />
            <div className="space-y-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-900">
                Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:text-gray-700"
              />
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
