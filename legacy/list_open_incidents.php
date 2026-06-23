<?php

declare(strict_types=1);

require_once __DIR__ . '/OpenIncidentsClient.php';

function respondWithError(int $statusCode, string $message): void
{
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }

    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit(1);
}

try {
    $client = OpenIncidentsClient::fromEnvironment();
    $incidents = $client->fetchOpenIncidents();

    if (PHP_SAPI === 'cli') {
        echo json_encode($incidents, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        echo PHP_EOL;
        exit(0);
    }

    header('Content-Type: application/json');
    echo json_encode($incidents, JSON_UNESCAPED_SLASHES);
} catch (Throwable $exception) {
    respondWithError(502, $exception->getMessage());
}
