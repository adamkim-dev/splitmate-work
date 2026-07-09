import { NextRequest, NextResponse } from 'next/server';
import loanService from '@/app/services/loanService';
import { CreateLoanPayload } from '@/app/models';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: Partial<CreateLoanPayload> = await request.json();

    if (body.borrower !== undefined && typeof body.borrower !== 'string') {
      return NextResponse.json(
        { error: 'Borrower must be a string' },
        { status: 400 }
      );
    }

    if (body.amountRemaining !== undefined && (typeof body.amountRemaining !== 'number' || body.amountRemaining < 0)) {
      return NextResponse.json(
        { error: 'Amount remaining must be a non-negative number' },
        { status: 400 }
      );
    }

    if (body.monthlyCollect !== undefined && (typeof body.monthlyCollect !== 'number' || body.monthlyCollect < 0)) {
      return NextResponse.json(
        { error: 'Monthly collect must be a non-negative number' },
        { status: 400 }
      );
    }

    const response = await loanService.updateLoan(id, body);

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
    const response = await loanService.deleteLoan(id);

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