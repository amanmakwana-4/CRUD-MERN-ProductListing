import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';

const languageOptions = ['Hindi', 'English', 'German'];

function EditProfile() {
  const navigate = useNavigate();
  const { token, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gender: '',
    languages: [],
    profileDescription: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/auth/profile');
        if (response.data.success) {
          const data = response.data.data;
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
            gender: data.gender || '',
            languages: data.languages || [],
            profileDescription: data.profileDescription || '',
          });
        } else {
          setError('Unable to load profile');
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
    setSubmitting(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('phone', formData.phone);
      payload.append('address', formData.address);
      payload.append('gender', formData.gender);
      payload.append('languages', JSON.stringify(formData.languages));
      payload.append('profileDescription', formData.profileDescription);

      if (profilePhoto) {
        payload.append('profilePhoto', profilePhoto);
      }

      const response = await API.put('/auth/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        login(token, response.data.data);
        navigate('/profile');
      } else {
        setError('Unable to save profile');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-gray-500 md:px-8">Loading profile...</div>;
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-[1200px] justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500">Update your account details</p>
          </div>
          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput name="name" label="Name" value={formData.name} onChange={handleChange} />
            <FormInput name="phone" label="Phone" value={formData.phone} onChange={handleChange} />
            <FormInput name="address" label="Address" value={formData.address} onChange={handleChange} />
            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-900">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Language</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {languageOptions.map((language) => (
                  <label
                    key={language}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      value={language}
                      checked={formData.languages.includes(language)}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {language}
                  </label>
                ))}
              </div>
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
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
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

export default EditProfile;
