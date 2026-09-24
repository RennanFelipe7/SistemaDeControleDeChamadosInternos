<?php

namespace Tests\Feature\Api;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketTest extends TestCase
{
  use RefreshDatabase;

  public function test_requester_creates_open_ticket_with_automatic_assignment(): void
  {
    $requester = User::factory()->create(['role' => 'solicitante']);
    $firstAttendant = User::factory()->create(['role' => 'atendente']);
    $secondAttendant = User::factory()->create(['role' => 'atendente']);
    $this->createTicket($firstAttendant, 2);
    $this->createTicket($secondAttendant, 1);

    $response = $this->actingAs($requester)->postJson('/api/v1/tickets', [
      'title' => 'Computador não inicia',
      'description' => 'O computador do setor não liga desde esta manhã.',
      'priority' => 'alta',
    ]);

    $response->assertCreated()
      ->assertJsonPath('data.requester_id', $requester->id)
      ->assertJsonPath('data.assignee_id', $secondAttendant->id)
      ->assertJsonPath('data.status', 'aberto');
    $this->assertNotNull($response->json('data.opened_at'));
  }

  public function test_automatic_assignment_uses_lowest_id_on_tie(): void
  {
    $requester = User::factory()->create(['role' => 'solicitante']);
    $firstAttendant = User::factory()->create(['role' => 'atendente']);
    $secondAttendant = User::factory()->create(['role' => 'atendente']);
    $this->createTicket($firstAttendant);
    $this->createTicket($secondAttendant);

    $response = $this->actingAs($requester)->postJson('/api/v1/tickets', [
      'title' => 'Acesso ao sistema',
      'description' => 'O acesso ao sistema interno está indisponível.',
      'priority' => 'média',
    ]);

    $response->assertCreated()->assertJsonPath('data.assignee_id', $firstAttendant->id);
  }

  public function test_ticket_creation_validates_business_fields(): void
  {
    $user = User::factory()->create(['role' => 'solicitante']);

    $this->actingAs($user)->postJson('/api/v1/tickets', [
      'title' => 'abc',
      'description' => 'curta',
      'priority' => 'urgente',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['title', 'description', 'priority']);
  }

  public function test_requester_only_lists_own_tickets(): void
  {
    $requester = User::factory()->create(['role' => 'solicitante']);
    $otherRequester = User::factory()->create(['role' => 'solicitante']);
    $attendant = User::factory()->create(['role' => 'atendente']);
    $ownTicket = $this->createTicket($attendant, 0, $requester);
    $otherTicket = $this->createTicket($attendant, 0, $otherRequester);

    $response = $this->actingAs($requester)->getJson('/api/v1/tickets');

    $response->assertOk()
      ->assertJsonPath('data.data.0.id', $ownTicket->id)
      ->assertJsonMissing(['id' => $otherTicket->id]);
  }

  public function test_attendant_lists_all_tickets_and_can_update_them(): void
  {
    $attendant = User::factory()->create(['role' => 'atendente']);
    $requester = User::factory()->create(['role' => 'solicitante']);
    $ticket = $this->createTicket($attendant, 0, $requester);

    $this->actingAs($attendant)->getJson('/api/v1/tickets')
      ->assertOk()
      ->assertJsonPath('data.total', 1);

    $this->actingAs($attendant)->putJson("/api/v1/tickets/{$ticket->id}", [
      'title' => $ticket->title,
      'description' => $ticket->description,
      'priority' => 'crítica',
      'status' => 'resolvido',
      'assignee_id' => $attendant->id,
    ])->assertOk()
      ->assertJsonPath('data.priority', 'crítica')
      ->assertJsonPath('data.status', 'resolvido');
  }

  public function test_requester_cannot_read_or_update_another_users_ticket(): void
  {
    $requester = User::factory()->create(['role' => 'solicitante']);
    $owner = User::factory()->create(['role' => 'solicitante']);
    $attendant = User::factory()->create(['role' => 'atendente']);
    $ticket = $this->createTicket($attendant, 0, $owner);

    $this->actingAs($requester)->getJson("/api/v1/tickets/{$ticket->id}")->assertForbidden();
    $this->actingAs($requester)->putJson("/api/v1/tickets/{$ticket->id}", [
      'title' => 'Alteração indevida',
      'description' => 'Tentativa de atualização não autorizada.',
      'priority' => 'alta',
      'status' => 'aberto',
    ])->assertForbidden();
  }

  public function test_missing_ticket_returns_a_readable_not_found_message(): void
  {
    $attendant = User::factory()->create(['role' => 'atendente']);

    $this->actingAs($attendant)
      ->getJson('/api/v1/tickets/999999')
      ->assertNotFound()
      ->assertJson(['message' => 'Chamado não encontrado.']);
  }

  public function test_list_filters_and_sorts_by_priority_and_paginates_by_ten(): void
  {
    $attendant = User::factory()->create(['role' => 'atendente']);
    $requester = User::factory()->create(['role' => 'solicitante']);
    foreach (['baixa', 'crítica', 'média', 'alta'] as $priority) {
      $this->createTicket($attendant, 0, $requester, ['priority' => $priority]);
    }
    for ($index = 0; $index < 7; $index++) {
      $this->createTicket($attendant, 0, $requester, ['priority' => 'baixa']);
    }

    $response = $this->actingAs($attendant)->getJson('/api/v1/tickets?sort=priority');

    $response->assertOk()
      ->assertJsonPath('data.per_page', 10)
      ->assertJsonPath('data.last_page', 2)
      ->assertJsonPath('data.data.0.priority', 'crítica')
      ->assertJsonPath('data.data.1.priority', 'alta')
      ->assertJsonPath('data.data.2.priority', 'média');
  }

  public function test_attendants_endpoint_returns_only_attendants_ordered_by_name(): void
  {
    $user = User::factory()->create(['role' => 'atendente']);
    User::factory()->create(['role' => 'solicitante', 'name' => 'Solicitante']);
    User::factory()->create(['role' => 'atendente', 'name' => 'Ana']);
    User::factory()->create(['role' => 'atendente', 'name' => 'Bruno']);

    $this->actingAs($user)->getJson('/api/v1/attendants')
      ->assertOk()
      ->assertJsonPath('data.0.name', 'Ana')
      ->assertJsonMissing(['name' => 'Solicitante']);
  }

  public function test_dashboard_returns_status_counts_and_recent_tickets_for_the_authenticated_scope(): void
  {
    $attendant = User::factory()->create(['role' => 'atendente']);
    $requester = User::factory()->create(['role' => 'solicitante']);
    $otherRequester = User::factory()->create(['role' => 'solicitante']);
    $this->createTicket($attendant, 0, $requester, ['status' => 'aberto', 'opened_at' => now()->subMinutes(3)]);
    $this->createTicket($attendant, 0, $requester, ['status' => 'em andamento', 'opened_at' => now()->subMinutes(2)]);
    $this->createTicket($attendant, 0, $requester, ['status' => 'resolvido', 'opened_at' => now()->subMinute()]);
    $this->createTicket($attendant, 0, $otherRequester, ['status' => 'fechado']);

    $this->actingAs($requester)->getJson('/api/v1/dashboard')
      ->assertOk()
      ->assertJsonPath('data.counts.aberto', 1)
      ->assertJsonPath('data.counts.em_andamento', 1)
      ->assertJsonPath('data.counts.finalizado', 1)
      ->assertJsonCount(3, 'data.recent_tickets')
      ->assertJsonPath('data.recent_tickets.0.status', 'resolvido');

    $this->actingAs($attendant)->getJson('/api/v1/dashboard')
      ->assertOk()
      ->assertJsonPath('data.counts.finalizado', 2)
      ->assertJsonCount(4, 'data.recent_tickets');
  }

  private function createTicket(User $assignee, int $amount = 0, ?User $requester = null, array $attributes = []): Ticket
  {
    $requester ??= User::factory()->create(['role' => 'solicitante']);
    $ticket = Ticket::create(array_merge([
      'title' => 'Chamado de teste',
      'description' => 'Descrição suficientemente longa para o teste.',
      'priority' => 'baixa',
      'status' => 'aberto',
      'requester_id' => $requester->id,
      'assignee_id' => $assignee->id,
      'opened_at' => now(),
    ], $attributes));

    for ($index = 1; $index < $amount; $index++) {
      Ticket::create([
        'title' => "Chamado de carga {$index}",
        'description' => 'Descrição de carga suficientemente longa.',
        'priority' => 'baixa',
        'status' => 'aberto',
        'requester_id' => $requester->id,
        'assignee_id' => $assignee->id,
        'opened_at' => now(),
      ]);
    }

    return $ticket;
  }
}
