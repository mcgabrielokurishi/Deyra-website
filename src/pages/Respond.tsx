import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Respond() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-6">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-600">
          Pay<span className="text-black">4Light</span>
        </h1>

        <span className="bg-orange-100 text-black px-4 py-1 rounded-full text-sm font-medium">
          Coming soon!
        </span>
      </div>

      {/* Success Icon */}
      <div className="mt-16 flex flex-col items-center">
        <div className="relative">
          <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
              <Check className="text-green-600 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-3xl font-bold mt-8 text-gray-800">
          You're on the list!
        </h2>

        <p className="text-gray-500 text-center mt-3 max-w-sm">
          We've reserved your spot. Keep an eye on your inbox for product
          updates.
        </p>
      </div>

      {/* Share Card */}
      <div className="mt-12 w-full max-w-md bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-center">Share the light</h3>

        <p className="text-center text-sm mt-1">
          Share your waitlist link with friends
        </p>

        <div className="mt-5 bg-white rounded-xl flex items-center justify-between px-4 py-3">
          <span className="text-orange-600 font-medium text-sm">
            pay4light.ng/waitlist
          </span>

          <Check className="text-green-500 w-5 h-5" />
        </div>
      </div>

      {/* Back Button */}
      <Link to="/">
        <button className="mt-10 border border-orange-500 text-orange-600 px-8 py-3 rounded-full font-medium hover:bg-orange-50 cursor-pointer">
          Back Home
        </button>
      </Link>
    </div>
  );
}
