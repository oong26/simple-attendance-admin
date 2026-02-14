<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'two_factor_confirmed_at' => $this->two_factor_confirmed_at,
            'role' => $this->roles->first() ? [
                'id' => $this->roles->first()->id,
                'name' => $this->roles->first()->name,
                'guard_name' => $this->roles->first()->guard_name,
            ] : null,
        ];
    }
}
