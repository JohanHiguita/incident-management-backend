<?php

declare(strict_types=1);

/**
 * Legacy client for fetching open incidents from the modern platform API.
 */
final class OpenIncidentsClient
{
    public function __construct(
        private readonly string $apiBaseUrl,
        private readonly int $timeoutSeconds = 10,
    ) {
    }

    public static function fromEnvironment(): self
    {
        $baseUrl = getenv('INCIDENTS_API_BASE_URL') ?: 'http://localhost:3000';

        return new self(rtrim($baseUrl, '/'));
    }

    /**
     * @return list<array{
     *   id: string,
     *   affectedApplication: string,
     *   severity: string,
     *   status: string,
     *   createdAt: string
     * }>
     */
    public function fetchOpenIncidents(): array
    {
        $url = $this->apiBaseUrl . '/api/v1/incidents/open';
        $body = $this->httpGet($url);

        $decoded = json_decode($body, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('Invalid JSON response from incidents API');
        }

        return $decoded;
    }

    private function httpGet(string $url): string
    {
        if (function_exists('curl_init')) {
            return $this->httpGetWithCurl($url);
        }

        return $this->httpGetWithStream($url);
    }

    private function httpGetWithCurl(string $url): string
    {
        $handle = curl_init($url);

        if ($handle === false) {
            throw new RuntimeException('Unable to initialize cURL');
        }

        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeoutSeconds,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);

        $body = curl_exec($handle);
        $statusCode = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
        $error = curl_error($handle);
        curl_close($handle);

        if ($body === false) {
            throw new RuntimeException('cURL request failed: ' . $error);
        }

        if ($statusCode >= 400) {
            throw new RuntimeException(
                sprintf('Incidents API returned HTTP %d: %s', $statusCode, $body),
            );
        }

        return $body;
    }

    private function httpGetWithStream(string $url): string
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "Accept: application/json\r\n",
                'timeout' => $this->timeoutSeconds,
                'ignore_errors' => true,
            ],
        ]);

        $body = file_get_contents($url, false, $context);

        if ($body === false) {
            throw new RuntimeException('HTTP request to incidents API failed');
        }

        $statusCode = $this->resolveHttpStatusCode($http_response_header ?? []);

        if ($statusCode >= 400) {
            throw new RuntimeException(
                sprintf('Incidents API returned HTTP %d: %s', $statusCode, $body),
            );
        }

        return $body;
    }

    /**
     * @param list<string> $headers
     */
    private function resolveHttpStatusCode(array $headers): int
    {
        if ($headers === []) {
            return 0;
        }

        if (preg_match('/\s(\d{3})\s/', $headers[0], $matches) === 1) {
            return (int) $matches[1];
        }

        return 0;
    }
}
