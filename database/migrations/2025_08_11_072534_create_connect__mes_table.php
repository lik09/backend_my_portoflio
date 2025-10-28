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
        Schema::create('connect__mes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_kh');
            $table->string('connection');
            $table->string('description')->nullable();
            $table->string('description_kh')->nullable();
            $table->string('icon_name')->nullable();
            $table->string('icon_import')->nullable();
            $table->string('bg_box')->nullable();
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connect__mes');
    }
};
