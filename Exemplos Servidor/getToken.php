<?php

function getToken($sistema, $tipo, $stackId, $user, $hash, $devMode = false) {
  $endPointBack = 'https://of.pantanaltec.com.br';

  $postData = json_encode([
      "sistema" => $sistema,
      "tipo" => $tipo,
      "user" => $user,
      strtolower((string)$tipo) => $stackId,
      "password" => $hash,
  ]);

  $headers = [
      'Content-Type: application/json',
      'Content-Length: ' . strlen($postData),
  ];

  $url = $endPointBack . '/loginAPI';

  $context = stream_context_create([
      'http' => [
          'method' => 'POST',
          'header' => implode("\r\n", $headers),
          'content' => $postData,
      ],
  ]);

  $rawResponse = file_get_contents($url, false, $context);

  if ($rawResponse === false) {
      return false; // Tratamento de erro: não foi possível obter os dados
  }

  $content = json_decode($rawResponse, true);

  if (isset($content['token'])) {
      return $content['token'];
  } else {
      return false;
  }
}

// Exemplo de uso
$tipo = 'FORNECEDOR'; // OU 'CLIENTE'
$fornecedorId = 2814; // OU CLIENTE = 1
$stackId = $fornecedorId;
$user = 'marcos.joaquim@jumasa.com.br';
$hash = 'b1687e0ecc5a84a7a5cf3378ebb051d4';

$token = getToken('ABRANGE', $tipo, $stackId, $user, $hash, false);

if ($token !== false) {
  echo 'Token: ' . $token;
} else {
  echo 'Erro ao obter o token.';
}

?>