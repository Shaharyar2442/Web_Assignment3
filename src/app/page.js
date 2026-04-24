import Link from "next/link";
import { MdRealEstateAgent, MdArrowForward } from "react-icons/md";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 text-center px-4">
      <div className="bg-blue-100 p-4 rounded-full mb-6">
        <MdRealEstateAgent className="h-16 w-16 text-blue-600" />
      </div>
      <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
        Property Dealer CRM System
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mb-8">
        The ultimate lead management and tracking solution for real estate professionals in Pakistan. Organize leads, track priorities, and close deals faster.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          Go to Dashboard <MdArrowForward />
        </Link>
      </div>
    </div>
  );
}
