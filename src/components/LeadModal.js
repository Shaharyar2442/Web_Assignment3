"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function LeadModal({ isOpen, onClose, onRefresh, existingLead = null }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "Admin";
  const isEditing = !!existingLead;
  const [agents, setAgents] = useState([]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: existingLead ? {
      ...existingLead,
      assignedTo: existingLead.assignedTo?._id || existingLead.assignedTo || "",
    } : {
      name: "",
      email: "",
      phone: "",
      propertyInterest: "",
      budget: "",
      status: "New",
      notes: "",
      assignedTo: "",
      followUpDate: "",
    },
  });

  useEffect(() => {
    if (isAdmin && isOpen) {
      // Fetch agents for assignment dropdown
      const fetchAgents = async () => {
        try {
          const res = await fetch("/api/users/agents");
          if (res.ok) {
            const data = await res.json();
            setAgents(data);
          }
        } catch (error) {
          console.error("Failed to fetch agents:", error);
        }
      };
      fetchAgents();
    }
  }, [isAdmin, isOpen]);

  useEffect(() => {
    if (existingLead) {
      reset({
        ...existingLead,
        assignedTo: existingLead.assignedTo?._id || existingLead.assignedTo || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        propertyInterest: "",
        budget: "",
        status: "New",
        notes: "",
        assignedTo: "",
        followUpDate: "",
      });
    }
  }, [existingLead, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    // Parse budget as number
    data.budget = Number(data.budget);
    
    // Handle empty assignedTo and followUpDate
    if (data.assignedTo === "") data.assignedTo = null;
    if (data.followUpDate === "") data.followUpDate = null;
    
    const toastId = toast.loading(isEditing ? "Updating lead..." : "Creating lead...");
    
    try {
      const url = isEditing ? `/api/leads/${existingLead._id}` : "/api/leads";
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        toast.error(responseData.message || "Operation failed", { id: toastId });
      } else {
        toast.success(isEditing ? "Lead updated successfully" : "Lead created successfully", { id: toastId });
        onRefresh();
        onClose();
      }
    } catch (error) {
      toast.error("An unexpected error occurred", { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl leading-6 font-semibold text-slate-900" id="modal-title">
                {isEditing ? "Edit Lead" : "Add New Lead"}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                <MdClose className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone (Intl format, no +)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="923001234567"
                    {...register("phone", { 
                      required: "Phone is required",
                      pattern: {
                        value: /^[1-9]\d{9,14}$/,
                        message: "Invalid format. Example: 923001234567"
                      }
                    })}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Property Interest</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="E.g., 5 Marla DHA Phase 8"
                    {...register("propertyInterest", { required: "Required" })}
                  />
                  {errors.propertyInterest && <p className="mt-1 text-xs text-red-600">{errors.propertyInterest.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Budget (PKR)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="15000000"
                    {...register("budget", { 
                      required: "Required",
                      min: { value: 0, message: "Cannot be negative" }
                    })}
                  />
                  {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <select
                    className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...register("status")}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Assign To Agent</label>
                    <select
                      className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      {...register("assignedTo")}
                    >
                      <option value="">Unassigned</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Follow-up Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...register("followUpDate")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  {...register("notes")}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
