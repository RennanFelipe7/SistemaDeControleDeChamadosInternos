<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
  use RefreshDatabase;

  public function test_user_can_login_with_valid_credentials(): void
  {
    $user = User::factory()->create([
      'email' => 'user@example.com',
      'password' => 'password',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
      'email' => 'user@example.com',
      'password' => 'password',
    ]);

    $response->assertOk()
      ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    $this->assertDatabaseHas('personal_access_tokens', [
      'tokenable_id' => $user->id,
      'tokenable_type' => User::class,
    ]);
  }

  public function test_login_rejects_invalid_credentials(): void
  {
    User::factory()->create([
      'email' => 'user@example.com',
      'password' => 'password',
    ]);

    $this->postJson('/api/v1/auth/login', [
      'email' => 'user@example.com',
      'password' => 'wrong-password',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['email']);
  }

  public function test_login_validates_email_and_password(): void
  {
    $this->postJson('/api/v1/auth/login', [
      'email' => 'invalid',
      'password' => 'short',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['email', 'password']);
  }

  public function test_authenticated_user_can_read_profile_and_logout(): void
  {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withToken($token)
      ->getJson('/api/v1/auth/me')
      ->assertOk()
      ->assertJsonPath('user.id', $user->id);

    $this->withToken($token)
      ->postJson('/api/v1/auth/logout')
      ->assertOk();

    $this->assertDatabaseCount('personal_access_tokens', 0);
  }

  public function test_protected_routes_require_authentication(): void
  {
    $this->getJson('/api/v1/auth/me')->assertUnauthorized();
  }
}
