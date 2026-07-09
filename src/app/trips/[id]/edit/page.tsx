"use client";

import { Trip, TripParticipant, User } from "@/app/models";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import tripService from "@/app/services/tripService";
import useUsers from "@/app/hooks/useUsers";

export default function EditTrip() {
  const { id } = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [tripName, setTripName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: reduxUsers } = useUsers();

  useEffect(() => {
    const fetchData = async () => {
      const tripResponse = await tripService.fetchTripById(id as string);
      if (tripResponse.data) {
        const data = tripResponse.data;
        setTrip(data);
        setTripName(data.name);
        setTripDate(data.date);
        setSelectedUsers(
          data.tripParticipants.map((p: TripParticipant) => p.userId)
        );
      }

      if (reduxUsers.length > 0) {
        setUsers(reduxUsers);
      }
    };

    fetchData();
  }, [id, reduxUsers]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!trip) return;

      const existingParticipants = trip.tripParticipants || [];
      const updatedParticipants: TripParticipant[] = selectedUsers.map(
        (userId) => {
          const existingParticipant = existingParticipants.find(
            (p) => p.userId === userId
          );
          if (existingParticipant) return existingParticipant;
          return {
            userId,
            isPaid: false,
            totalMoneyPerUser: 0,
            paidAmount: 0,
          };
        }
      );

      const response = await tripService.updateTrip(id as string, {
        name: tripName,
        date: tripDate,
        tripParticipants: updatedParticipants,
      });

      if (response.data) {
        router.push(`/trips/${id}`);
      } else {
        throw new Error("Failed to update trip");
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      alert("Failed to update trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-slate-500">Loading trip details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/trips/${id}`}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Trip</h1>
          <p className="text-sm text-slate-500">{trip.name}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Trip Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Trip Name
              </label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="Enter trip name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Select Participants
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="max-h-64 overflow-y-auto p-3 bg-slate-50">
                {users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {users.map((user, idx) => {
                      const isSelected = selectedUsers.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleUserSelection(user.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                            isSelected
                              ? "bg-indigo-50 border-2 border-indigo-300 shadow-sm"
                              : "bg-white border-2 border-transparent hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              isSelected
                                ? "bg-indigo-600"
                                : "bg-slate-300"
                            }`}
                          >
                            {isSelected ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${isSelected ? "text-indigo-900" : "text-slate-700"}`}>
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate">{user.email}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-slate-400">Loading users...</div>
                )}
              </div>
              <div className="px-4 py-2 bg-white border-t border-slate-100 text-xs text-slate-500">
                {selectedUsers.length} selected
              </div>
            </div>
            {selectedUsers.length === 0 && (
              <p className="text-rose-500 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                Please select at least one participant
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href={`/trips/${id}`}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || !tripName || !tripDate || selectedUsers.length === 0}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl disabled:bg-slate-200 disabled:text-slate-400 hover:bg-indigo-700 transition-all shadow-sm"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
