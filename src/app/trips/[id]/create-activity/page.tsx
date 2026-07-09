"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { NewActivityPayload } from "@/app/models";
import Link from "next/link";
import activityService from "@/app/services/activityService";
import useUsers from "@/app/hooks/useUsers";
import useTrips from "@/app/hooks/useTrips";

interface ActivityFormData {
  activityName: string;
  activityTime: string;
  totalMoney: string;
  payerId: string;
  participants: string[];
}

export default function CreateActivity() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const { tripDetail, isLoading } = useTrips({ tripId: id as string });
  const { getUserById } = useUsers();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormData>({
    defaultValues: {
      activityName: "",
      activityTime: new Date().toISOString().slice(0, 16),
      totalMoney: "",
      payerId: "",
      participants: [],
    },
  });

  const onSubmit = async (data: ActivityFormData) => {
    try {
      const moneyPerUser =
        parseFloat(data.totalMoney) / selectedParticipants.length;

      const participants = selectedParticipants.map((userId) => ({
        id: userId,
        totalMoneyPerUser: moneyPerUser,
      }));

      const newActivity = {
        tripId: id as string,
        name: data.activityName,
        totalMoney: parseFloat(data.totalMoney),
        payerId: data.payerId,
        participants,
      } as NewActivityPayload;

      const response = await activityService.createActivity(newActivity);

      if (response.data) {
        router.push(`/trips/${id}`);
      } else {
        throw new Error("Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      alert("Failed to create activity. Please try again.");
    }
  };

  const toggleParticipantSelection = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

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
          <h1 className="text-2xl font-bold text-slate-900">New Activity</h1>
          <p className="text-sm text-slate-500">{tripDetail?.name || "Loading..."}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Activity Details</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Activity Name
              </label>
              <input
                type="text"
                {...register("activityName", {
                  required: "Activity name is required",
                })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="e.g. Dinner at restaurant"
              />
              {errors.activityName && (
                <p className="text-rose-500 text-sm mt-1.5 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {errors.activityName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Date & Time
              </label>
              <input
                type="datetime-local"
                {...register("activityTime", {
                  required: "Date and time is required",
                })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
              {errors.activityTime && (
                <p className="text-rose-500 text-sm mt-1.5">{errors.activityTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Total Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  {...register("totalMoney", {
                    required: "Total amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                    validate: (value) =>
                      parseFloat(value) > 0 || "Amount must be greater than 0",
                  })}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  placeholder="0.00"
                />
              </div>
              {errors.totalMoney && (
                <p className="text-rose-500 text-sm mt-1.5">{errors.totalMoney.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Who Paid?
              </label>
              <select
                {...register("payerId", { required: "Please select a payer" })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none appearance-none"
              >
                <option value="">Select payer</option>
                {tripDetail?.tripParticipants.map((par) => (
                  <option key={par.userId} value={par.userId}>
                    {getUserById(par.userId)?.name || "Unknown User"}
                  </option>
                ))}
              </select>
              {errors.payerId && (
                <p className="text-rose-500 text-sm mt-1.5">{errors.payerId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Split Between
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="max-h-64 overflow-y-auto p-3 bg-slate-50">
                {isLoading ? (
                  <div className="text-center py-6 text-sm text-slate-400">Loading...</div>
                ) : tripDetail && tripDetail.tripParticipants?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tripDetail.tripParticipants.map((par) => {
                      const isSelected = selectedParticipants.includes(par.userId);
                      const user = getUserById(par.userId);
                      return (
                        <button
                          key={par.userId}
                          type="button"
                          onClick={() => toggleParticipantSelection(par.userId)}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                            isSelected
                              ? "bg-indigo-50 border-2 border-indigo-300 shadow-sm"
                              : "bg-white border-2 border-transparent hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              isSelected ? "bg-indigo-600" : "bg-slate-300"
                            }`}
                          >
                            {isSelected ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : (
                              (user?.name?.charAt(0) || "?").toUpperCase()
                            )}
                          </div>
                          <span className={`font-medium truncate ${isSelected ? "text-indigo-900" : "text-slate-700"}`}>
                            {user?.name || "Unknown"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-slate-400">No participants available</div>
                )}
              </div>
              <div className="px-4 py-2 bg-white border-t border-slate-100 text-xs text-slate-500">
                {selectedParticipants.length} selected
              </div>
            </div>
            {selectedParticipants.length === 0 && (
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
              disabled={isLoading || selectedParticipants.length === 0}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl disabled:bg-slate-200 disabled:text-slate-400 hover:bg-indigo-700 transition-all shadow-sm"
            >
              {isLoading ? "Creating..." : "Create Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
