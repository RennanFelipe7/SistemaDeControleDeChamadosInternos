<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('tickets', function (Blueprint $table) {
      $table->id();
      $table->string('title', 120);
      $table->text('description');
      $table->string('priority', 20)->default('baixa');
      $table->string('status', 20)->default('aberto');
      $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
      $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
      $table->timestamp('opened_at');
      $table->timestamps();

      $table->index(['status', 'priority']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('tickets');
  }
};
