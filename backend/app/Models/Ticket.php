<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
  use HasFactory;

  protected $fillable = [
    'title',
    'description',
    'priority',
    'status',
    'requester_id',
    'assignee_id',
    'opened_at',
  ];

  protected function casts(): array
  {
    return [
      'opened_at' => 'datetime',
    ];
  }

  public function requester(): BelongsTo
  {
    return $this->belongsTo(User::class, 'requester_id');
  }

  public function assignee(): BelongsTo
  {
    return $this->belongsTo(User::class, 'assignee_id');
  }
}
