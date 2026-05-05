<?php

namespace Database\Seeders;

use App\Models\ScannerType;
use Illuminate\Database\Seeder;

class ScannerTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ScannerType::updateOrCreate([
            'id' => 1,
        ], [
            'type' => 'barcode',
        ]);
    }
}
