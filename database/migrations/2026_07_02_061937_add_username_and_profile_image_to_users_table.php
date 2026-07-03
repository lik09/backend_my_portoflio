<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('profile_image')->nullable()->after('language');
        });

        // Set a default username for existing rows (lowercase name, underscores instead of spaces)
        DB::table('users')->whereNull('username')->update([
            'username' => DB::raw("LOWER(REPLACE(name, ' ', '_'))"),
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'profile_image']);
        });
    }
};
