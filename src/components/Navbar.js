"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { MdOutlineRealEstateAgent } from "react-hot-toast"; // Wait, react-icons! I'll use react-icons/md
import { MdRealEstateAgent, MdLogout, MdDashboard } from "react-icons/md";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex flex-shrink-0 items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <MdRealEstateAgent className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                PropertyCRM
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md"></div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <MdDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/leads"
                  className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Leads
                </Link>
                <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-700">
                      {session.user.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-100">
                      {session.user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    title="Sign out"
                  >
                    <MdLogout className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
