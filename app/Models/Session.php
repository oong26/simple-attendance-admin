<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use \Carbon\Carbon;

class Session extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_id',
        'ip_address',
        'user_agent',
        'payload',
        'last_activity',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accessor for readable timestamp
    public function getLastActivityFormattedAttribute()
    {
        return Carbon::createFromTimestamp($this->last_activity)->toDateTimeString();
    }

    public function getLastActiveHumanAttribute()
    {
        return Carbon::createFromTimestamp($this->last_activity)->diffForHumans();
    }
}
