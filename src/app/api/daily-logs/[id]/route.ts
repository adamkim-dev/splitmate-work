import { NextRequest, NextResponse } from 'next/server';
import dailySpendingLogService from '@/app/services/dailySpendingLogService';
import { CreateDailySpendingLogPayload } from '@/app/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await dailySpendingLogService.fetchDailySpendingLogById(id);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    if (!response.data) {
      return NextResponse.json(
        { error: 'Daily spending log not found' },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<CreateDailySpendingLogPayload> = await request.json();

    // Validate amount if provided
    if (body.amountSpent !== undefined && body.amountSpent < 0) {
      return NextResponse.json(
        { error: 'Amount spent must be non-negative' },
        { status: 400 }
      );
    }

    // Validate date format if provided
    if (body.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.date)) {
        return NextResponse.json(
          { error: 'Date must be in YYYY-MM-DD format' },
          { status: 400 }
        );
      }
    }

    const response = await dailySpendingLogService.updateDailySpendingLog(id, body);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await dailySpendingLogService.deleteDailySpendingLog(id);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}