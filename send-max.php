<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = explode(':', $_SERVER['HTTP_HOST'] ?? '', 2)[0];
$originHost = $origin ? parse_url($origin, PHP_URL_HOST) : '';
$allowedOrigins = [
    'https://stroj-klyuch.ru',
    'https://www.stroj-klyuch.ru',
];

if ($origin && ($originHost === $host || in_array($origin, $allowedOrigins, true))) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = [
    'bot_token' => getenv('MAX_BOT_TOKEN') ?: '',
    'recipient_type' => getenv('MAX_RECIPIENT_TYPE') ?: 'chat_id',
    'recipient_id' => getenv('MAX_RECIPIENT_ID') ?: '',
];

$configFile = __DIR__ . '/max-config.php';

if (is_file($configFile)) {
    $fileConfig = require $configFile;

    if (is_array($fileConfig)) {
        $config = array_replace($config, $fileConfig);
    }
}

$recipientType = $config['recipient_type'];
$recipientId = $config['recipient_id'];
$botToken = trim((string) $config['bot_token']);

if (!in_array($recipientType, ['chat_id', 'user_id'], true) || $recipientId === '' || $botToken === '') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'MAX config is incomplete'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody ?: '', true);
$text = trim((string) ($data['text'] ?? ''));

if ($text === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Empty message'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'cURL extension is not available'], JSON_UNESCAPED_UNICODE);
    exit;
}

$url = 'https://platform-api.max.ru/messages?' . http_build_query([
    $recipientType => $recipientId,
]);

$payload = json_encode([
    'text' => $text,
    'format' => 'markdown',
], JSON_UNESCAPED_UNICODE);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: ' . $botToken,
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT => 10,
]);

$response = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError !== '') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $curlError], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($httpCode < 200 || $httpCode >= 300) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'MAX API request failed',
        'status' => $httpCode,
        'response' => json_decode((string) $response, true) ?: $response,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'ok' => true,
    'response' => json_decode((string) $response, true) ?: $response,
], JSON_UNESCAPED_UNICODE);
