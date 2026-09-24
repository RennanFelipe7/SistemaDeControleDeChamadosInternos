<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->delete();

        User::create([
            'name' => 'Joao Silva',
            'email' => 'joao.silva@example.com',
            'password' => Hash::make('password'),
            'role' => 'solicitante',
        ]);

        foreach (
            [
                ['name' => 'Ana Souza', 'email' => 'ana.souza@example.com'],
                ['name' => 'Bruno Lima', 'email' => 'bruno.lima@example.com'],
                ['name' => 'Carla Mendes', 'email' => 'carla.mendes@example.com'],
            ] as $attendant
        ) {
            User::create([
                ...$attendant,
                'password' => Hash::make('password'),
                'role' => 'atendente',
            ]);
        }
    }
}
