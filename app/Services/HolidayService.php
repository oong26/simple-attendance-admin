<?php

namespace App\Services;

use App\Interfaces\HolidayInterface;
use App\Models\Holiday;
use Illuminate\Support\Facades\Http;

class HolidayService
{
    private $holidayRepository;
    private const BASE_URL = 'https://libur.deno.dev/api';

    public function __construct(HolidayInterface $holidayRepository)
    {
        $this->holidayRepository = $holidayRepository;
    }

    public function getDayOffThisYear(): array
    {
        $url = self::BASE_URL;
        $response = Http::get($url);
        if ($response->getStatusCode() == 404) {
            return ['error' => 'Sumber libur nasional tidak ditemukan'];
        }

        return $response->json();
    }

    public function synchronize(): array
    {
        $result = $this->getDayOffThisYear();
        if (isset($result['error'])) {
            return $result;
        }

        $count = 0;
        foreach ($result as $dayOff) {
            Holiday::updateOrCreate(
                ['date' => $dayOff['date'], 'name' => $dayOff['name']]
            );

            $count++;
        }

        return ['count' => $count];
    }
}