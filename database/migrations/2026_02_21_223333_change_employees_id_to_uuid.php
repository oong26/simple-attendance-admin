<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create temporary UUID columns
        Schema::table('employees', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->uuid('employee_uuid')->nullable()->after('employee_id');
        });

        // 2. Populate UUIDs for employees
        $employees = DB::table('employees')->get();
        foreach ($employees as $employee) {
            $uuid = (string) Str::uuid();
            DB::table('employees')->where('id', $employee->id)->update(['uuid' => $uuid]);
            DB::table('attendances')->where('employee_id', $employee->id)->update(['employee_uuid' => $uuid]);
        }

        // 3. Make the temporary UUIDs non-nullable
        Schema::table('employees', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->uuid('employee_uuid')->nullable(false)->change();
        });

        // 4. Drop Foreign Keys and Old ID columns
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropColumn('employee_id');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // 5. Rename temporary columns to original names
        Schema::table('employees', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->renameColumn('employee_uuid', 'employee_id');
        });

        // 6. Recreate Primary Key and Foreign Key constraints
        Schema::table('employees', function (Blueprint $table) {
            $table->primary('id');
        });

        Schema::table('attendances', function (Blueprint $table) {
            // Need to explicitly set the foreign key again
            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Notice: Irreversible without data loss. Reverting this easily is not possible since integers are lost.
        // We will just do a stub or recreate basic columns.
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
        });
    }
};
