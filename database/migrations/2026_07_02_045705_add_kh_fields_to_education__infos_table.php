<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('education__infos', function (Blueprint $table) {
            $table->string('title_kh')->nullable()->after('title');
            $table->text('bio_kh')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('education__infos', function (Blueprint $table) {
            $table->dropColumn(['title_kh', 'bio_kh']);
        });
    }
};
