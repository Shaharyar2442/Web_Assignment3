"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { MdAdd, MdEdit, MdDelete, MdPhone, MdEmail, MdHistory, MdWarning } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import LeadModal from "@/components/LeadModal";
import ActivityTimelineModal from "@/components/ActivityTimelineModal";

export default function LeadsPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Timeline state
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [timelineLead, setTimelineLead] = useState(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      toast.error("Error loading leads");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    
    // Real-time updates fallback: Polling every 10 seconds
    const interval = setInterval(() => {
      fetchLeads();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCreate = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleTimeline = (lead) => {
    setTimelineLead(lead);
    setIsTimelineOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    
    const toastId = toast.loading("Deleting lead...");
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      toast.success("Lead deleted successfully", { id: toastId });
      fetchLeads();
    } catch (error) {
      toast.error("Error deleting lead", { id: toastId });
    }
  };

  const getScoreColor = (score) => {
    switch (score) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-orange-100 text-orange-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800";
      case "Contacted": return "bg-purple-100 text-purple-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Closed": return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const isStale = (lastActivityAt) => {
    if (!lastActivityAt) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(lastActivityAt) < sevenDaysAgo;
  };

  const isFollowUpOverdue = (followUpDate) => {
    if (!followUpDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fDate = new Date(followUpDate);
    fDate.setHours(0, 0, 0, 0);
    return fDate < today;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Management</h1>
          <p className="text-slate-600 text-sm">Manage your properties and potential clients</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <MdAdd className="h-5 w-5" />
          Add New Lead
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Lead Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Property & Budget
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Loading leads...
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                    No leads found. Click "Add New Lead" to get started.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{lead.name}</span>
                        <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                          <MdEmail /> {lead.email}
                        </div>
                        <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                          <MdPhone /> +{lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900">{lead.propertyInterest}</span>
                        <span className="text-sm font-medium text-slate-600 mt-1">
                          Rs. {lead.budget.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(lead.score)} ${lead.score === 'High' ? 'animate-pulse ring-2 ring-red-400 ring-offset-1' : ''}`}>
                          Priority: {lead.score}
                        </span>
                        
                        {(isStale(lead.lastActivityAt) || isFollowUpOverdue(lead.followUpDate)) && lead.status !== 'Closed' && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <MdWarning className="h-3 w-3" />
                            {isFollowUpOverdue(lead.followUpDate) ? "Follow-up Overdue!" : "Stale (No Activity)"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {lead.assignedTo ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{lead.assignedTo.name}</span>
                            <span className="text-xs text-slate-500">{lead.assignedTo.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <a
                          href={`https://wa.me/${lead.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 p-1 bg-green-50 hover:bg-green-100 rounded transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp className="h-5 w-5" />
                        </a>
                        <button 
                          onClick={() => handleTimeline(lead)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                          title="Activity Timeline"
                        >
                          <MdHistory className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(lead)}
                          className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          title="Edit Lead"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(lead._id)}
                          className="text-red-600 hover:text-red-900 p-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                          title="Delete Lead"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchLeads} 
        existingLead={selectedLead} 
      />

      <ActivityTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        lead={timelineLead}
      />
    </div>
  );
}
