<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            $table->string('title_kh')->nullable()->after('title');
            $table->string('company_name_kh')->nullable()->after('company_name');
            $table->string('location_kh')->nullable()->after('location');
            $table->string('emp_type_kh')->nullable()->after('emp_type');
            $table->text('description_kh')->nullable()->after('description');
            $table->json('key_achievements_kh')->nullable()->after('key_achievements');
        });
    }

    public function down(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn(['title_kh', 'company_name_kh', 'location_kh', 'emp_type_kh', 'description_kh', 'key_achievements_kh']);
        });
    }
};
