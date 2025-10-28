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
        Schema::create('high__schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('edu_type_id')
                ->constrained('education__types')
                ->onDelete('cascade');

            $table->string('name_school', 191)->unique();
            $table->string('name_school_kh', 191)->unique();
            $table->string('logo_school')->nullable();
            $table->longText('description_study')->nullable();
            $table->longText('description_study_kh')->nullable();
            $table->string('location')->nullable();
            $table->string('location_kh')->nullable();
            $table->json('images')->nullable();
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('high__schools');
    }
};
