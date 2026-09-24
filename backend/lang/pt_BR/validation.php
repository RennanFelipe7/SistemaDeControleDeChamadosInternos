<?php

return [
  'required' => 'O campo :attribute é obrigatório.',
  'email' => 'Informe um e-mail válido.',
  'string' => 'O campo :attribute deve ser um texto.',
  'integer' => 'O campo :attribute deve ser um número inteiro.',
  'in' => 'O valor selecionado para :attribute é inválido.',
  'exists' => 'O :attribute selecionado não existe.',
  'min' => [
    'string' => 'O campo :attribute deve ter no mínimo :min caracteres.',
  ],
  'max' => [
    'string' => 'O campo :attribute deve ter no máximo :max caracteres.',
  ],
  'attributes' => [
    'email' => 'e-mail',
    'password' => 'senha',
    'title' => 'título',
    'description' => 'descrição',
    'priority' => 'prioridade',
    'status' => 'status',
    'assignee_id' => 'responsável',
    'search' => 'busca',
    'sort' => 'ordenação',
    'direction' => 'direção',
  ],
];
