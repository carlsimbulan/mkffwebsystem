<?php
/**
 * MKFF Manufacturing - AI Diagnostic Engine (Final Stable)
 * Location: /backend/api/gemini_diagnose.php
 */

// 1. 🔑 CORS & BROWSER SECURITY HEADERS
// Mahalaga ito para payagan ang React (localhost:3000) na makausap ang PHP (localhost:80)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 🛡️ Pre-flight request handler para sa Axios
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. 🔑 GEMINI CONFIGURATION
$api_key = "AIzaSyB-ZGtrly3AozgFBHDqpFvPOJBBmHtX1g4";
// Ginamit ang v1beta para sa Flash model stability
$api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $api_key;

// 3. 📥 INPUT PROCESSING
$json_input = file_get_contents("php://input");
$data = json_decode($json_input, true);

// I-verify kung may laman ang request mula sa React
if (!$data || !isset($data['station']) || !isset($data['unit_data'])) {
    http_response_code(400); 
    echo json_encode([
        "status" => "error", 
        "message" => "Invalid Request: Missing manufacturing context."
    ]);
    exit();
}

$station = $data['station'];
$unit = $data['unit_data'];

// 🧠 4. THE AI PROMPT
// Technical instruction para sa manufacturing diagnosis
$prompt = "Act as a Senior Manufacturing Engineer at MKFF Manufacturing. 
Task: Diagnose this unit's manufacturing lag or defect.
- Station: $station
- Unit Model: {$unit['model']}
- Assembly No: {$unit['assembly_no']}
- Checklist Data: " . json_encode($unit) . "

INSTRUCTIONS:
1. Identify 'NO GO' or 'FAIL' marks as the immediate technical root cause.
2. If readings (Voltage, etc.) are out of standard range, flag calibration error.
3. Suggest one technical corrective action for the technician.
4. Keep the response technical and direct (Max 2 sentences). No fluff.";

// 5. 📦 PAYLOAD PREPARATION
$payload = [
    "contents" => [
        ["parts" => [["text" => $prompt]]]
    ]
];

// 6. 🚀 EXECUTE API CALL (CURL)
$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

// 🛠️ CRITICAL FIX FOR LOCALHOST (XAMPP/WAMP):
// Pinipigilan nito ang 'API Request failed' error sa localhost
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

// 7. 🏁 FINAL JSON RESPONSE
if ($http_code === 200) {
    $result = json_decode($response, true);
    
    // Kunin ang generated response text mula sa JSON structure ng Gemini
    if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        $ai_text = $result['candidates'][0]['content']['parts'][0]['text'];
        echo json_encode([
            "status" => "success",
            "analysis" => trim($ai_text)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "AI response format invalid.",
            "debug" => $result
        ]);
    }
} else {
    // Nagbabalik ng malinaw na error code para sa debugging
    http_response_code($http_code ?: 500);
    echo json_encode([
        "status" => "error", 
        "message" => "Gemini API Connection failed (HTTP $http_code)",
        "details" => $curl_error ?: "Check your API key or internet connection."
    ]);
}
?>