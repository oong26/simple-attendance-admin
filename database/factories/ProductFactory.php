<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true), // e.g. "Premium Steel Chair"
            'price' => $this->faker->randomFloat(2, 10, 5000), // e.g. 199.99
            'description' => $this->faker->sentence(10), // e.g. "A durable and stylish office chair."
        ];
    }
}
