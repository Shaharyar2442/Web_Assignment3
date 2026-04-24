import Link from "next/link";
import { MdErrorOutline } from "react-icons/md";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
          <MdErrorOutline className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Access Denied
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          You do not have permission to view this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
