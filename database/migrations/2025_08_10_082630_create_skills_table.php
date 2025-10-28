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
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_kh');
            $table->foreignId('skill_type_id')->constrained('skill__types')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->text('description_kh')->nullable();
            $table->text('images')->nullable();
            $table->unsignedTinyInteger('pct_status')->default(0);
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};
