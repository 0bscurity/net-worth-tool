import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0();

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        {isAuthenticated && (
          <div className="dropdown">
            <div tabIndex="0" role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex="0"
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to={"./dashboard"}>Dashboard</Link>
              </li>
            </ul>
          </div>
        )}
        <a className="btn btn-ghost text-xl">
          <Link to={!isAuthenticated ? "./" : "./dashboard"}>MFT</Link>
        </a>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to={"./dashboard"}>Dashboard</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        {isLoading ? (
          <span>Loading…</span>
        ) : isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Log Out
            </button>
          </div>
        ) : (
          <button className="btn btn-sm" onClick={() => loginWithRedirect()}>
            Log In
          </button>
        )}
      </div>
    </div>
  );
}
