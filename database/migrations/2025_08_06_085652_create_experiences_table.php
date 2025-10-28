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
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Optional: developer's job title
            $table->string('icon')->nullable(); // Can be icon 
            $table->string('company_name');
            $table->string('start_year');
            $table->string('end_year')->nullable(); // e.g. "Present"
            $table->string('location');
            $table->string('emp_type'); // e.g. Full time, Part time
            $table->text('description')->nullable();
            $table->json('technologies')->nullable();
            $table->json('key_achievements')->nullable();
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};
