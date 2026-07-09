/* eslint-disable @typescript-eslint/no-explicit-any */
import { Trip } from "../models";
import { IBaseResponse } from "../model/common.model";

export class TripService {
  private baseUrl = "/api/trips";

  fetchAllTrips = async (): Promise<IBaseResponse<Trip[]>> => {
    try {
      const res = await fetch(this.baseUrl, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchTripById = async (id: string): Promise<IBaseResponse<Trip>> => {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createTrip = async (trip: Omit<Trip, "id">): Promise<IBaseResponse<Trip>> => {
    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  updateTrip = async (
    id: string,
    trip: Partial<Trip>
  ): Promise<IBaseResponse<Trip>> => {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  deleteTrip = async (id: string): Promise<IBaseResponse<null>> => {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const tripService = new TripService();

export default tripService;
