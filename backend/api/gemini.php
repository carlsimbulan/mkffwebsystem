<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// Secure API key (stored server-side)
$GEMINI_API_KEY = 'AIzaSyDfEKh1vvkHBa6hayqvwGBkFGKUlb8pEpM';
$GEMINI_V1_BASE = 'https://generativelanguage.googleapis.com/v1';

try {
    // Check if we need to list models or generate content
    if (isset($input['action']) && $input['action'] === 'list_models') {
        // List available models
        $response = file_get_contents($GEMINI_V1_BASE . '/models?key=' . urlencode($GEMINI_API_KEY));
        
        if ($response === false) {
            throw new Exception('Failed to fetch models');
        }
        
        $data = json_decode($response, true);
        if (!$data || !isset($data['models'])) {
            throw new Exception('Invalid response from models API');
        }
        
        // Find first model that supports generateContent
        $model = null;
        foreach ($data['models'] as $m) {
            if (isset($m['supportedGenerationMethods']) && 
                is_array($m['supportedGenerationMethods']) && 
                in_array('generateContent', $m['supportedGenerationMethods'])) {
                $model = $m['name'];
                break;
            }
        }
        
        if (!$model) {
            throw new Exception('No available Gemini model supports generateContent');
        }
        
        echo json_encode(['modelName' => $model]);
        
    } elseif (isset($input['modelName']) && isset($input['prompt'])) {
        // Generate content
        $modelName = $input['modelName'];
        $prompt = $input['prompt'];
        
        $payload = [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];
        
        $ch = curl_init($GEMINI_V1_BASE . '/' . $modelName . ':generateContent?key=' . urlencode($GEMINI_API_KEY));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($response === false) {
            throw new Exception('Failed to execute cURL request: ' . $curlError);
        }
        
        // Debug: Log the actual URL and response for troubleshooting
        error_log("Gemini API Request URL: " . $GEMINI_V1_BASE . '/' . $modelName . ':generateContent?key=' . urlencode($GEMINI_API_KEY));
        error_log("Gemini API Response Code: " . $httpCode);
        error_log("Gemini API Response: " . $response);
        
        if ($httpCode !== 200) {
            throw new Exception("generateContent failed ($httpCode): " . $response);
        }
        
        $data = json_decode($response, true);
        if (!$data) {
            throw new Exception('Invalid JSON response from Gemini API');
        }
        
        $text = '';
        if (isset($data['candidates'][0]['content']['parts'])) {
            foreach ($data['candidates'][0]['content']['parts'] as $part) {
                if (isset($part['text']) && $part['text']) {
                    $text .= $part['text'];
                }
            }
        }
        
        if (empty($text)) {
            throw new Exception('Empty AI response');
        }
        
        echo json_encode(['text' => $text]);
        
    } else {
        throw new Exception('Missing required parameters');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>