import { useContext, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';
import { validateForm } from '../utils/validation';

const languageOptions = ['Hindi', 'English', 'German'];

function Register() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    languages: [],
    profileDescription: '',
    password: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/products" replace />;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox') {
      setFormData((current) => ({
        ...current,
        languages: checked
          ? [...current.languages, value]
          : current.languages.filter((item) => item !== value),
      }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm(
      {
        ...formData,
        languages: formData.languages.length > 0 ? 'selected' : '',
      },
      ['name', 'email', 'phone', 'address', 'gender', 'languages', 'password']
    );

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('address', formData.address);
      payload.append('gender', formData.gender);
      payload.append('languages', JSON.stringify(formData.languages));
      payload.append('profileDescription', formData.profileDescription);
      payload.append('password', formData.password);

      if (profilePhoto) {
        payload.append('profilePhoto', profilePhoto);
      }

      const response = await API.post('/auth/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        navigate('/otp', { state: { email: response.data.data.email || formData.email } });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Unable to create account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1200px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">Register</h1>
            <p className="text-sm text-gray-500">Create your account to start managing products</p>
          </div>
          {errors.submit ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.submit}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput id="name" name="name" label="Full Name" value={formData.name} onChange={handleChange} error={errors.name} required />
            <FormInput id="email" name="email" type="email" label="Email" value={formData.email} onChange={handleChange} error={errors.email} required />
            <FormInput id="phone" name="phone" label="Phone" value={formData.phone} onChange={handleChange} error={errors.phone} required />
            <FormInput id="address" name="address" label="Address" value={formData.address} onChange={handleChange} error={errors.address} required />
            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-900">
                Gender
                <span className="ml-1 text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition ${
                  errors.gender
                    ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender ? <p className="text-sm text-red-600">{errors.gender}</p> : null}
            </div>
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Language
                <span className="ml-1 text-red-500">*</span>
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {languageOptions.map((language) => (
                  <label
                    key={language}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      name="languages"
                      value={language}
                      checked={formData.languages.includes(language)}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {language}
                  </label>
                ))}
              </div>
              {errors.languages ? <p className="text-sm text-red-600">{errors.languages}</p> : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="profileDescription" className="block text-sm font-medium text-gray-900">
                Description
              </label>
              <textarea
                id="profileDescription"
                name="profileDescription"
                value={formData.profileDescription}
                onChange={handleChange}
                rows="4"
                maxLength="1500"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-sm text-gray-500">{formData.profileDescription.length}/1500</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-900">
                Profile Image
              </label>
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={(event) => setProfilePhoto(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:text-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
