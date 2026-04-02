import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/auth/profile');
        if (response.data.success) {
          setProfile(response.data.data);
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

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-gray-500 md:px-8">Loading profile...</div>;
  }

  if (error || !profile) {
    return <div className="px-4 py-16 text-center text-sm text-red-600 md:px-8">{error || 'Profile not found'}</div>;
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-500">
                    {profile.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-semibold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/edit-profile')}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 sm:w-auto"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm text-gray-500">Phone</p>
              <p className="text-sm text-gray-900">{profile.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">Address</p>
              <p className="text-sm text-gray-900">{profile.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">Language</p>
              <p className="text-sm text-gray-900">
                {Array.isArray(profile.languages) && profile.languages.length
                  ? profile.languages.join(', ')
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">Gender</p>
              <p className="text-sm text-gray-900">
                {profile.gender ? `${profile.gender.charAt(0).toUpperCase()}${profile.gender.slice(1)}` : 'Not provided'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="mb-1 text-sm text-gray-500">Description</p>
              <p className="text-sm text-gray-900">{profile.profileDescription || 'No description added'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
