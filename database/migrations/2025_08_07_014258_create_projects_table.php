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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_kh');
            $table->foreignId('pro_type_id')->constrained('project__types')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->text('description_kh')->nullable();
            $table->json('images')->nullable();
            $table->json('technologies')->nullable();
            $table->string('url_live_demo')->nullable();
            $table->string('url_code_project')->nullable();
            $table->integer('release_year');
            
            // 🆕 Date-based build duration
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->integer('customer_used')->nullable();
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
