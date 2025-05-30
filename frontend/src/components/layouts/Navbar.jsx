import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0();

  return (
    <div className="navbar bg-base-100 shadow-sm z-1000">
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
              {/* <li>
                <Link to={"./projections"}>Projections</Link>
              </li> */}
            </ul>
          </div>
        )}
        <Link
          to={!isAuthenticated ? "./" : "./dashboard"}
          className="btn btn-ghost text-xl px-0"
        >
          <img
            src={logo}
            alt="My Financial Tools logo"
            width={62}
            height={62}
          />
        </Link>
      </div>

      {isAuthenticated && (
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to={"./dashboard"}>Dashboard</Link>
            </li>
          </ul>
        </div>
      )}
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
          <button
            className="btn btn-sm btn-primary"
            onClick={() => loginWithRedirect()}
          >
            Log In
          </button>
        )}
      </div>
    </div>
  );
}
