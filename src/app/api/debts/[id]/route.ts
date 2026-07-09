import { NextRequest, NextResponse } from 'next/server';
import debtService from '@/app/services/debtService';
import { CreateDebtPayload } from '@/app/models';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: Partial<CreateDebtPayload> = await request.json();

    if (body.creditor !== undefined && typeof body.creditor !== 'string') {
      return NextResponse.json(
        { error: 'Creditor must be a string' },
        { status: 400 }
      );
    }

    if (body.amountRemaining !== undefined && (typeof body.amountRemaining !== 'number' || body.amountRemaining < 0)) {
      return NextResponse.json(
        { error: 'Amount remaining must be a non-negative number' },
        { status: 400 }
      );
    }

    if (body.monthlyPayment !== undefined && (typeof body.monthlyPayment !== 'number' || body.monthlyPayment < 0)) {
      return NextResponse.json(
        { error: 'Monthly payment must be a non-negative number' },
        { status: 400 }
      );
    }

    const response = await debtService.updateDebt(id, body);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: response.data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const response = await debtService.deleteDebt(id);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: response.data } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}