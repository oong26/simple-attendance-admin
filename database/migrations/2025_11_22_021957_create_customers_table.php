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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            $table->string('name', 100);
            $table->string('email', 100)->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();

            $table->string('phone_code', 3);
            $table->string('phone', 15)->unique();
            $table->timestamp('phone_verified_at')->nullable();

            $table->string('password', 60);
            $table->rememberToken();

            $table->integer('failed_attempts')->default(0)
                ->comment('will be incremented on login failure and reset to zero on successful login');

            $table->boolean('locked_by_system')->default(false)
                ->comment('auto-lock by system after too many failed attempts');

            $table->boolean('locked_by_admin')->default(false)
                ->comment('manual lock by admin');

            $table->dateTime('locked_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
