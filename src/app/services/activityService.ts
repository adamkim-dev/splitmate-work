/* eslint-disable @typescript-eslint/no-explicit-any */
import { Activity, NewActivityPayload } from "../models";
import { IBaseResponse } from "../model/common.model";

export class ActivityService {
  fetchAllActivities = async (): Promise<IBaseResponse<Activity[]>> => {
    try {
      const res = await fetch("/api/activities", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchActivitiesByTripId = async (
    tripId: string
  ): Promise<IBaseResponse<Activity[]>> => {
    try {
      const res = await fetch(`/api/activities?tripId=${tripId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchActivityById = async (id: string): Promise<IBaseResponse<Activity>> => {
    try {
      const res = await fetch(`/api/activities/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createActivity = async (
    activity: NewActivityPayload
  ): Promise<IBaseResponse<Activity>> => {
    try {
      const res = await fetch(`/api/trips/${activity.tripId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  updateActivity = async (
    id: string,
    activity: Partial<Activity>
  ): Promise<IBaseResponse<Activity>> => {
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  deleteActivity = async (id: string): Promise<IBaseResponse<null>> => {
    try {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const activityService = new ActivityService();

export default activityService;
