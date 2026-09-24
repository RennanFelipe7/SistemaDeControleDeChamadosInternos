<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
  public function login(Request $request): JsonResponse
  {
    $credentials = $request->validate([
      'email' => ['required', 'email', 'min:5', 'max:254'],
      'password' => ['required', 'string', 'min:8', 'max:72'],
    ]);

    $user = User::where('email', $credentials['email'])->first();

    if (! $user || ! Hash::check($credentials['password'], $user->password)) {
      throw ValidationException::withMessages([
        'email' => ['As credenciais informadas sao invalidas.'],
      ]);
    }

    return response()->json([
      'token' => $user->createToken('frontend')->plainTextToken,
      'user' => $user,
    ]);
  }

  public function logout(Request $request): JsonResponse
  {
    $request->user()->currentAccessToken()?->delete();

    return response()->json(['message' => 'Logout realizado com sucesso.']);
  }

  public function me(Request $request): JsonResponse
  {
    return response()->json(['user' => $request->user()]);
  }
}
