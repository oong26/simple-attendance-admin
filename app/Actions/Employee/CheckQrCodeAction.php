<?php

namespace App\Actions\Employee;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckQrCodeAction
{
    public function execute(Request $request): JsonResponse
    {
        $request->validate([
            'qr_data' => 'required|string',
        ]);

        $payload = json_decode($request->qr_data, true);

        if (json_last_error() !== JSON_ERROR_NONE || ! isset($payload['employee_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR code format. Expected JSON with employee_id.',
            ], 422);
        }

        $employee = Employee::with(['department'])
            ->find($payload['employee_id']);

        if (! $employee) {
            return response()->json([
                'success' => false,
                'message' => 'QR code is not registered to any employee.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'photo_url' => $employee->photo_url,
                'is_active' => $employee->is_active,
                'job_title' => $employee->job_title,
                'department' => $employee->department ? [
                    'name' => $employee->department->name,
                ] : null,
            ],
        ]);
    }
}
