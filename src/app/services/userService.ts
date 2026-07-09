/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../models";
import { IBaseResponse } from "../model/common.model";

export class UserService {
  private baseUrl = "/api/users";

  fetchAllUsers = async (): Promise<IBaseResponse<User[]>> => {
    try {
      const res = await fetch(this.baseUrl, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchAllUsersWithFinance = async (): Promise<IBaseResponse<any[]>> => {
    try {
      const res = await fetch("/api/users/with-finance", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchUserById = async (id: string): Promise<IBaseResponse<User>> => {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createUser = async (
    user: Omit<User, "id" | "spentMoney">
  ): Promise<IBaseResponse<User>> => {
    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const userService = new UserService();

export default userService;
