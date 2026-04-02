import { useContext, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';
import { validateEmail, validatePassword } from '../utils/validation';

function Login() {
  const navigate = useNavigate();
  const { token, login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/products" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!validateEmail(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!validatePassword(password)) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.success) {
        login(response.data.data.token, response.data.data.user);
        navigate('/products');
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Unable to sign in' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1200px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">Login</h1>
            <p className="text-sm text-gray-500">Access your PlexiGenius workspace</p>
          </div>
          {errors.submit ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.submit}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              required
            />
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            New here?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
