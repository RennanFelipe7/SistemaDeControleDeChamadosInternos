<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
  private const PRIORITIES = 'baixa,média,alta,crítica';

  private const STATUSES = 'aberto,em andamento,resolvido,fechado';

  public function index(Request $request): JsonResponse
  {
    $filters = $request->validate([
      'search' => ['nullable', 'string', 'min:1', 'max:100'],
      'status' => ['nullable', 'in:aberto,em andamento,resolvido,fechado'],
      'priority' => ['nullable', 'in:baixa,média,alta,crítica'],
      'sort' => ['nullable', 'in:opened_at,priority,status'],
      'direction' => ['nullable', 'in:asc,desc'],
    ]);

    $query = Ticket::query()->with(['requester:id,name', 'assignee:id,name']);

    if ($request->user()->role === 'solicitante') {
      $query->where('requester_id', $request->user()->id);
    }

    $query
      ->when($filters['search'] ?? null, function ($ticketQuery, string $search) {
        $ticketQuery->where(function ($searchQuery) use ($search) {
          $searchQuery
            ->where('title', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%");
        });
      })
      ->when($filters['status'] ?? null, fn($ticketQuery, string $status) => $ticketQuery->where('status', $status))
      ->when($filters['priority'] ?? null, fn($ticketQuery, string $priority) => $ticketQuery->where('priority', $priority));

    $sort = $filters['sort'] ?? 'opened_at';
    $direction = $filters['direction'] ?? 'desc';
    $orderedQuery = $sort === 'priority'
      ? $query->orderByRaw("CASE priority WHEN 'baixa' THEN 1 WHEN 'média' THEN 2 WHEN 'alta' THEN 3 WHEN 'crítica' THEN 4 END {$direction}")
      : $query->orderBy($sort, $direction);

    return response()->json([
      'data' => $orderedQuery->paginate(10),
    ]);
  }

  public function dashboard(Request $request): JsonResponse
  {
    $query = Ticket::query();

    if ($request->user()->role === 'solicitante') {
      $query->where('requester_id', $request->user()->id);
    }

    $counts = (clone $query)
      ->selectRaw("SUM(status = 'aberto') as open_count")
      ->selectRaw("SUM(status = 'em andamento') as in_progress_count")
      ->selectRaw("SUM(status IN ('resolvido', 'fechado')) as finished_count")
      ->first();

    return response()->json([
      'data' => [
        'counts' => [
          'aberto' => (int) $counts->open_count,
          'em_andamento' => (int) $counts->in_progress_count,
          'finalizado' => (int) $counts->finished_count,
        ],
        'recent_tickets' => (clone $query)
          ->with(['requester:id,name', 'assignee:id,name'])
          ->latest('opened_at')
          ->limit(5)
          ->get(),
      ],
    ]);
  }

  public function store(Request $request): JsonResponse
  {
    $data = $request->validate($this->ticketRules());
    $data['requester_id'] = $request->user()->id;
    $data['opened_at'] = now();
    $data['status'] = 'aberto';

    if (empty($data['assignee_id'])) {
      $data['assignee_id'] = User::query()
        ->where('role', 'atendente')
        ->withCount(['assignedTickets as open_tickets_count' => fn($query) => $query->whereIn('status', ['aberto', 'em andamento'])])
        ->orderBy('open_tickets_count')
        ->orderBy('id')
        ->value('id');
    }

    $ticket = Ticket::create($data);

    return response()->json(['data' => $ticket->load(['requester:id,name', 'assignee:id,name'])], 201);
  }

  public function show(Request $request, Ticket $ticket): JsonResponse
  {
    abort_if($request->user()->role === 'solicitante' && $ticket->requester_id !== $request->user()->id, 403);

    return response()->json(['data' => $ticket->load(['requester:id,name', 'assignee:id,name'])]);
  }

  public function update(Request $request, Ticket $ticket): JsonResponse
  {
    abort_if($request->user()->role !== 'atendente', 403);

    $ticket->update($request->validate([
      ...$this->ticketRules(),
      'status' => ['required', 'in:' . self::STATUSES],
      'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
    ]));

    return response()->json(['data' => $ticket->fresh()->load(['requester:id,name', 'assignee:id,name'])]);
  }

  public function attendants(): JsonResponse
  {
    return response()->json(['data' => User::query()->where('role', 'atendente')->orderBy('name')->get(['id', 'name', 'email'])]);
  }

  private function ticketRules(): array
  {
    return [
      'title' => ['required', 'string', 'min:5', 'max:120'],
      'description' => ['required', 'string', 'min:10', 'max:5000'],
      'priority' => ['required', 'in:' . self::PRIORITIES],
      'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
    ];
  }
}
