// src/pages/Home.jsx
import { useAuth0 } from "@auth0/auth0-react";
import example from "../assets/dashboard_no_background.png";

export default function Home() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="relative overflow-hidden min-h-[95vh] bg-gradient-to-r from-sky-50 to-pink-50">
      <div className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">

        {/* Text side */}
        <div className="relative z-20 space-y-6">
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
            Aggregate your checking, savings, and investments in one place. See
            real-time balances, track progress, and plan your next financial
            move.
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
        <div className="relative z-10">
          {/* Blob shapes for depth */}
          <div
            className="absolute -top-16 -right-16 w-96 h-96 invisible xl:visible
                           bg-gradient-to-br from-indigo-500 to-pink-500
                           rounded-full filter blur-3xl opacity-40 z-0"
          />
          <div
            className="absolute top-32 right-0 w-72 h-72 invisible xl:visible
                           bg-gradient-to-tr from-yellow-300 to-green-400
                           rounded-full filter blur-2xl opacity-30 z-0"
          />
          {/* Responsive image: static below on small, absolute on lg */}
          <img
            src={example}
            alt="Example screenshot"
            className="
              w-full max-w-md mx-start mt-8 object-contain opacity-100 z-20
              lg:absolute lg:top-5 lg:right-[-50%] lg:transform lg:-translate-y-1/2 lg:w-[700px] lg:max-w-none lg:mt-0
            "
          />
        </div>
      </div>
    </div>
  );
}
