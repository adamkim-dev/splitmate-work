import { NextRequest, NextResponse } from 'next/server';
import fixedExpenseService from '@/app/services/fixedExpenseService';
import { CreateFixedExpensePayload } from '@/app/models';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const response = await fixedExpenseService.fetchFixedExpenseById(id);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 404 }
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

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: Partial<CreateFixedExpensePayload> = await request.json();

    if (body.name !== undefined && typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Name must be a string' },
        { status: 400 }
      );
    }

    if (body.amount !== undefined && (typeof body.amount !== 'number' || body.amount < 0)) {
      return NextResponse.json(
        { error: 'Amount must be a non-negative number' },
        { status: 400 }
      );
    }

    if (body.frequency !== undefined && body.frequency !== 'monthly' && body.frequency !== 'weekly') {
      return NextResponse.json(
        { error: 'Frequency must be either "monthly" or "weekly"' },
        { status: 400 }
      );
    }

    const response = await fixedExpenseService.updateFixedExpense(id, body);

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
    const response = await fixedExpenseService.deleteFixedExpense(id);

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