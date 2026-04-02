import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const navLinkClass = ({ isActive }) =>
  `text-sm ${isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`;

function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-8">
        <Link to={token ? '/products' : '/login'} className="text-xl font-semibold text-gray-900">
          PlexiGenius
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          {token ? (
            <>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
