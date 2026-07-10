import { NextRequest, NextResponse } from 'next/server';
import savingPlanService from '@/app/services/savingPlanService';
import { CreateSavingPlanPayload } from '@/app/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await savingPlanService.fetchSavingPlanById(id);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    if (!response.data) {
      return NextResponse.json(
        { error: 'Saving plan not found' },
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
    const body: Partial<CreateSavingPlanPayload> = await request.json();

    // Validate percentage range if provided
    if (body.percentageOfSalary !== undefined && (body.percentageOfSalary < 0 || body.percentageOfSalary > 100)) {
      return NextResponse.json(
        { error: 'Percentage of salary must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate fixed amount if provided
    if (body.fixedAmount !== undefined && body.fixedAmount < 0) {
      return NextResponse.json(
        { error: 'Fixed amount must be non-negative' },
        { status: 400 }
      );
    }

    const response = await savingPlanService.updateSavingPlan(id, body);

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

    const response = await savingPlanService.deleteSavingPlan(id);

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