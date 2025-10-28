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
        Schema::create('short__courses', function (Blueprint $table) {
            $table->id();
            $table->string('course_name', 191);
            $table->string('course_name_kh', 191);
            $table->string('teacher_name', 191);
            $table->string('teacher_name_kh', 191);
            $table->text('description')->nullable();
            $table->text('description_kh')->nullable();
            $table->string('time_study', 100)->nullable();
            $table->enum('mode', ['online', 'direct'])->default('online');
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('short__courses');
    }
};
