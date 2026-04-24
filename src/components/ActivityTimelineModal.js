"use client";

import { useState, useEffect } from "react";
import { MdClose, MdHistory } from "react-icons/md";
import toast from "react-hot-toast";

export default function ActivityTimelineModal({ isOpen, onClose, lead }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && lead) {
      const fetchActivities = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/leads/${lead._id}/activity`);
          if (!res.ok) throw new Error("Failed to fetch activities");
          const data = await res.json();
          setActivities(data);
        } catch (error) {
          toast.error("Failed to load activity timeline");
        } finally {
          setIsLoading(false);
        }
      };
      fetchActivities();
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-slate-50 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MdHistory className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl leading-6 font-bold text-slate-900" id="modal-title">
                  Activity Timeline
                </h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <MdClose className="h-6 w-6" />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              History for <span className="font-semibold text-slate-700">{lead.name}</span>
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6 max-h-[60vh] overflow-y-auto bg-slate-50">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No activity recorded yet.</p>
            ) : (
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {activities.map((activity, activityIdx) => (
                    <li key={activity._id}>
                      <div className="relative pb-8">
                        {activityIdx !== activities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-50 ${activity.action === 'Lead Created' ? 'bg-green-500' : 'bg-blue-500'}`}>
                              <span className="text-white text-xs font-bold">
                                {activity.performedBy.name.charAt(0).toUpperCase()}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-slate-800 font-medium">
                                {activity.action}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                {activity.details}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                By {activity.performedBy.name} ({activity.performedBy.role})
                              </p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-slate-500">
                              <time dateTime={activity.createdAt}>
                                {new Date(activity.createdAt).toLocaleString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="bg-white px-4 py-3 border-t border-slate-200 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
