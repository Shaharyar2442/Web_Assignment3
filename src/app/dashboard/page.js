"use client";

import { useSession } from "next-auth/react";
import { MdDashboard } from "react-icons/md";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          <MdDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 text-sm">Welcome back, {session?.user?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <p className="text-slate-600">
          This is the {session?.user?.role} dashboard. Lead management features will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}
