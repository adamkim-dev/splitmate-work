/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaymentHistory } from "../models";
import { IBaseResponse } from "../model/common.model";

export class PaymentService {
  fetchPaymentsByTripId = async (
    tripId: string
  ): Promise<IBaseResponse<PaymentHistory[]>> => {
    try {
      const res = await fetch(`/api/trips/${tripId}/payments`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createPayment = async (
    payment: Omit<PaymentHistory, "id">
  ): Promise<IBaseResponse<PaymentHistory>> => {
    try {
      const res = await fetch(`/api/trips/${payment.tripId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error };
      return { data: json.data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const paymentService = new PaymentService();

export default paymentService;
