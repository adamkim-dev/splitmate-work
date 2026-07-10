/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, TripStatus } from "@/app/models";
import Link from "next/link";
import tripService from "../services/tripService";
import useUsers from "../hooks/useUsers";

export default function CreateTrip() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [tripName, setTripName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);

  const { data: reduxUsers } = useUsers();

  useEffect(() => {
    if (reduxUsers && reduxUsers.length > 0) {
      setUsers(reduxUsers);
    }
  }, [reduxUsers]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const participants = selectedUsers.map((userId) => ({
        userId,
        isPaid: false,
        totalMoneyPerUser: 0,
      }));

      const newTrip = {
        name: tripName,
        date: tripDate,
        participants,
        status: "planed" as TripStatus,
        total_money: 0,
        money_per_user: 0,
      } as any;

      const response = await tripService.createTrip(newTrip);

      if (response.data) {
        router.push(`/trips/${response.data.id}`);
      } else {
        throw new Error("Failed to create trip");
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip. Please try again.");
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

  const { addUser } = useUsers();

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPhone) {
      alert("Please fill in all user information");
      return;
    }

    setIsAddingUser(true);

    try {
      const newUser = {
        name: newUserName,
        email: newUserEmail,
        phoneNumber: newUserPhone,
      };

      const resultAction = await addUser(newUser);

      if (resultAction.meta.requestStatus === "fulfilled") {
        const createdUser = resultAction.payload as User;
        setSelectedUsers((prev) => [...prev, createdUser.id]);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPhone("");
        setShowAddUserModal(false);
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleCloseModal = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setShowAddUserModal(false);
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/trips"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Trip</h1>
          <p className="text-sm text-slate-500">Set up a new trip and invite participants</p>
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
                placeholder="e.g. Weekend in Da Nang"
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Select Participants
              </label>
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Add New User
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="max-h-64 overflow-y-auto p-3 bg-slate-50">
                {users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {users.map((user) => {
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
                              isSelected ? "bg-indigo-600" : "bg-slate-300"
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
              href="/trips"
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || !tripName || !tripDate || selectedUsers.length === 0}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl disabled:bg-slate-200 disabled:text-slate-400 hover:bg-indigo-700 transition-all shadow-sm"
            >
              {isLoading ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Add New User</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddUser}
                  disabled={isAddingUser || !newUserName || !newUserEmail || !newUserPhone}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl disabled:bg-slate-200 disabled:text-slate-400 hover:bg-indigo-700 transition-all shadow-sm"
                >
                  {isAddingUser ? "Adding..." : "Add User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
