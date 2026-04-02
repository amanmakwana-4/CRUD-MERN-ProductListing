import { useContext, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';

function OTPVerification() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token, login } = useContext(AuthContext);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const email = state?.email;

  if (token) {
    return <Navigate to="/products" replace />;
  }

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (otp.length !== 4) {
      setErrors({ otp: 'Enter the 4-digit code' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await API.post('/auth/verify-otp', { email, otp });
      if (response.data.success) {
        login(response.data.data.token, response.data.data.user);
        navigate('/products');
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Unable to verify code' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1200px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">Verify OTP</h1>
            <p className="text-sm text-gray-500">Enter the code sent to {email}</p>
          </div>
          {errors.submit ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.submit}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-900">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                className={`w-full rounded-lg border px-3 py-2.5 text-center text-sm text-gray-900 outline-none transition ${
                  errors.otp
                    ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
                placeholder="0000"
              />
              {errors.otp ? <p className="text-sm text-red-600">{errors.otp}</p> : null}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;
