<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('photo')
                ->nullable()
                ->after('phone');
            $table->enum('contract_type', ['full_time', 'part_time', 'contract', 'internship'])
                ->nullable()
                ->after('department_id');
            $table->enum('attendance_type', ['onsite', 'remote', 'hybrid'])
                ->nullable()
                ->after('contract_type');
            $table->date('contract_end_date')
                ->nullable()
                ->after('attendance_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('photo');
            $table->dropColumn('contract_type');
            $table->dropColumn('attendance_type');
            $table->dropColumn('contract_end_date');
        });
    }
};
