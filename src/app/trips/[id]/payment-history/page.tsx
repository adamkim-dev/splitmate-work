"use client";

import { PaymentHistory, Trip, User } from "@/app/models";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import tripService from "@/app/services/tripService";
import paymentService from "@/app/services/paymentService";
import useUsers from "@/app/hooks/useUsers";
import { Utility } from "@/app/utils";

const avatarColors = [
  "from-indigo-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-500",
];

export default function PaymentHistoryPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const { data: reduxUsers } = useUsers();

  useEffect(() => {
    if (reduxUsers && reduxUsers.length > 0) {
      setUsers(reduxUsers);
    }
  }, [reduxUsers]);

  useEffect(() => {
    const fetchData = async () => {
      const tripResponse = await tripService.fetchTripById(id as string);
      if (tripResponse.data) {
        setTrip(tripResponse.data);
      }

      const paymentsResponse = await paymentService.fetchPaymentsByTripId(
        id as string
      );
      if (paymentsResponse.data) {
        setPayments(paymentsResponse.data);
      }
    };

    fetchData();
  }, [id]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-slate-500">Loading...</span>
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
          <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
          <p className="text-sm text-slate-500">{trip.name}</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Total Payments</div>
            <div className="text-2xl font-bold text-slate-900">
              ${Utility.formatMoney(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Records</div>
            <div className="text-2xl font-bold text-slate-900">{payments.length}</div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-3xl">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">All Payments</h3>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <p className="text-slate-500 mb-1">No payment records</p>
            <p className="text-sm text-slate-400">Payments will appear here once they are recorded.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((payment, idx) => {
              const user = users.find((u) => u.id === payment.userId);
              const colorIdx = users.findIndex((u) => u.id === payment.userId);
              const color = avatarColors[(colorIdx >= 0 ? colorIdx : idx) % avatarColors.length];
              return (
                <div key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{user?.name || "Unknown"}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(payment.paymentDate).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {payment.note && (
                      <div className="text-sm text-slate-400 italic mt-0.5">{payment.note}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700">
                      +${Utility.formatMoney(payment.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
