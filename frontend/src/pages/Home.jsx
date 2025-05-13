// src/pages/Home.jsx
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="relative">
      <div className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <div className="relative z-10 space-y-6">
          {/* Decorative SVG behind the heading */}
          <svg
            className="absolute -top-8 -left-8 w-64 h-64 opacity-20 text-primary"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            <defs>
              <pattern
                id="dots"
                patternUnits="userSpaceOnUse"
                width="10"
                height="10"
              >
                <circle cx="1" cy="1" r="1" />
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#dots)" />
          </svg>
          <h1 className="text-5xl font-extrabold leading-tight">
            Track and Project Your Net Worth
          </h1>
          <p className="text-lg text-base-content/70 max-w-md">
            Aggregate your checking, savings, and investments in one place. See real-time balances, track progress, and plan your next financial move.
          </p>
          <ul className="space-y-3 text-base-content">
            <li className="flex items-center">
              <span className="text-primary mr-2">✓</span>
              Automatic account aggregation
            </li>
            <li className="flex items-center">
              <span className="text-primary mr-2">✓</span>
              Interactive net-worth insights
            </li>
            <li className="flex items-center">
              <span className="text-primary mr-2">✓</span>
              Customizable projections
            </li>
          </ul>
          <button
            onClick={() => loginWithRedirect()}
            className="btn btn-primary btn-lg mt-4"
          >
            Get Started — It’s Free
          </button>
        </div>

        {/* Graphic side */}
        <div className="hidden lg:block relative">
          {/* Abstract blob shape */}
          <div
            className="
              absolute -top-16 -right-16
              w-96 h-96
              bg-gradient-to-br from-indigo-500 to-pink-500
              rounded-full filter blur-3xl opacity-40
            "
          />
          {/* Secondary shape for depth */}
          <div
            className="
              absolute top-32 right-0
              w-72 h-72
              bg-gradient-to-tr from-yellow-300 to-green-400
              rounded-full filter blur-2xl opacity-30
            "
          />
        </div>
      </div>
    </div>
  );
}
