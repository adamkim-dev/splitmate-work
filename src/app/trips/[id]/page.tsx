"use client";

import useTrips from "@/app/hooks/useTrips";
import useUsers from "@/app/hooks/useUsers";
import { TripActivity, TripStatus } from "@/app/models";
import tripService from "@/app/services/tripService";
import { Utility } from "@/app/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

const statusConfig: Record<TripStatus, { label: string; bg: string; text: string; dot: string }> = {
  planed: { label: "Planned", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  "on-going": { label: "On Going", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  ended: { label: "Ended", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

function StatusBadge({ status }: { status: TripStatus }) {
  const config = statusConfig[status] || statusConfig.planed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

const avatarColors = [
  "from-indigo-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-500",
  "from-violet-500 to-fuchsia-500",
];

function UserAvatar({ name, index, size = "md" }: { name: string; index: number; size?: "sm" | "md" }) {
  const color = avatarColors[index % avatarColors.length];
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-white font-bold shadow-sm`}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

export default function TripDetail() {
  const { id } = useParams();
  const { tripDetail, refetchTripDetail } = useTrips({ tripId: id as string });
  const router = useRouter();
  const {
    tripParticipants: participants,
    activities,
    tripPayers,
  } = tripDetail || {};

  const { data: users, getUserById } = useUsers();

  const changeStatus = async () => {
    if (!tripDetail) return;
    const statusOrder: TripStatus[] = ["planed", "on-going", "ended"];
    const currentIndex = statusOrder.indexOf(tripDetail.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];

    try {
      const response = await tripService.updateTrip(id as string, {
        status: newStatus,
      });

      if (response.data) {
        refetchTripDetail(response.data.id);
      }
    } catch (error) {
      console.error("Error updating trip status:", error);
    }
  };

  const getUserDetailById = useCallback(
    (userId: string) => {
      return users?.find((user) => user.id === userId);
    },
    [users]
  );

  if (!tripDetail) {
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
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">{tripDetail.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={tripDetail.status} />
            <span className="text-sm text-slate-500">
              {tripDetail.date ? Utility.formatDate(tripDetail.date) : "No date"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-slate-900">${Utility.formatMoney(tripDetail.totalMoney ?? 0)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Per Person</div>
          <div className="text-2xl font-bold text-indigo-600">${Utility.formatMoney(tripDetail.moneyPerUser ?? 0)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Participants</div>
          <div className="text-2xl font-bold text-slate-900">{participants?.length || 0}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Activities</div>
          <div className="text-2xl font-bold text-slate-900">{activities?.length || 0}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tripDetail.status !== "planed" && (
          <Link
            href={`/trips/${id}/payment-history`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Payment History
          </Link>
        )}

        {tripDetail.status === "on-going" && (
          <Link
            href={`/trips/${id}/create-activity`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Activity
          </Link>
        )}

        <Link
          href={`/trips/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit Trip
        </Link>

        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
          onClick={changeStatus}
        >
          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Change Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Payers & Participants */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payers */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Payers</h3>
            </div>
            <div className="p-4">
              {tripPayers?.length ? (
                <div className="space-y-3">
                  {tripPayers.map((payer, idx) => {
                    const user = getUserDetailById(payer.userId);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <UserAvatar name={user?.name || "?"} index={idx} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{user?.name || "Unknown"}</div>
                          <div className="text-sm text-emerald-600 font-semibold">
                            ${Utility.formatMoney(payer.spentMoney)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-slate-400">No payers yet</div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Participants</h3>
            </div>
            <div className="p-4">
              {participants?.length ? (
                <div className="space-y-3">
                  {participants.map((participant, idx) => {
                    const user = getUserById(participant.userId);
                    const owed = participant.totalMoneyPerUser - participant.paidAmount;
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <UserAvatar name={user?.name || "?"} index={idx + 3} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">{user?.name || "Unknown"}</div>
                            <div className="text-sm text-slate-500">
                              Share: ${Utility.formatMoney(participant.totalMoneyPerUser)}
                            </div>
                          </div>
                        </div>
                        {owed > 0 && (
                          <div className="ml-13 mt-1 flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full w-fit">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            Owes ${Utility.formatMoney(owed)}
                          </div>
                        )}
                        {owed < 0 && (
                          <div className="ml-13 mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Refund ${Utility.formatMoney(Math.abs(owed))}
                          </div>
                        )}
                        {owed === 0 && participant.totalMoneyPerUser > 0 && (
                          <div className="ml-13 mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Settled
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-slate-400">No participants yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Activities</h3>
              {tripDetail.status === "on-going" && (
                <Link
                  href={`/trips/${id}/create-activity`}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Add
                </Link>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {activities?.length ? (
                activities.map((activity: TripActivity, idx: number) => {
                  const payer = users.find((u) => u.id === activity.payerId);
                  return (
                    <Link
                      key={activity.id}
                      href={`/activity/${activity.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl text-indigo-600 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {activity.name}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1.5">
                          <span>Paid by</span>
                          <span className="font-medium text-slate-700">{payer?.name || "Unknown"}</span>
                          <span className="text-slate-300">|</span>
                          <span>{Utility.formatDate(activity.updatedAt || activity.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          ${Utility.formatMoney(activity.totalMoney)}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">No activities recorded yet</p>
                  {tripDetail.status === "on-going" && (
                    <Link
                      href={`/trips/${id}/create-activity`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Create one now
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
