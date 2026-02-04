<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../db.php';
require_once '../cors.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    switch ($action) {
        case 'get_operator_performance':
            getOperatorPerformance($data);
            break;
        case 'get_operator_performance_with_names':
            getOperatorPerformanceWithNames($data);
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

function getOperatorPerformanceWithNames($data) {
    global $conn;
    
    $operatorId = $data['operator_id'] ?? '';
    $stationId = $data['station_id'] ?? '';
    $years = intval($data['years'] ?? 3);
    
    if (empty($operatorId) || empty($stationId)) {
        throw new Exception('Operator ID and Station ID are required');
    }
    
    // Get operator full name from users table
    $operatorName = '';
    $nameQuery = "SELECT full_name FROM users WHERE email = ? OR id = ?";
    $nameStmt = $conn->prepare($nameQuery);
    $nameStmt->bind_param("ss", $operatorId, $operatorId);
    $nameStmt->execute();
    $nameResult = $nameStmt->get_result();
    if ($nameRow = $nameResult->fetch_assoc()) {
        $operatorName = $nameRow['full_name'] ?? $operatorId;
    } else {
        $operatorName = $operatorId; // Fallback to ID if not found
    }
    
    // Calculate date range for the specified number of years
    $currentDate = new DateTime();
    $startDate = (new DateTime())->sub(new DateInterval("P{$years}Y"));
    
    $query = "SELECT 
                opl.operator_id,
                opl.station_id,
                opl.total_passed,
                opl.total_ng,
                opl.avg_processing_time,
                opl.month_year,
                YEAR(opl.month_year) as year,
                MONTH(opl.month_year) as month
              FROM operator_performance_logs opl
              WHERE opl.operator_id = ? 
                AND opl.station_id = ? 
                AND opl.month_year >= ? 
              ORDER BY opl.month_year DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $operatorId, $stationId, $startDate->format('Y-m-d'));
    $stmt->execute();
    $result = $stmt->get_result();
    
    $performanceData = [];
    while ($row = $result->fetch_assoc()) {
        $performanceData[] = [
            'operator_id' => $row['operator_id'],
            'station_id' => $row['station_id'],
            'total_passed' => intval($row['total_passed']),
            'total_ng' => intval($row['total_ng']),
            'avg_processing_time' => floatval($row['avg_processing_time']),
            'month_year' => $row['month_year'],
            'year' => intval($row['year']),
            'month' => intval($row['month']),
            'ng_rate' => $row['total_passed'] > 0 ? (intval($row['total_ng']) / (intval($row['total_passed']) + intval($row['total_ng']))) * 100 : 0
        ];
    }
    
    // Calculate seasonal averages and trends
    $seasonalAnalysis = analyzeSeasonalPatterns($performanceData);
    
    echo json_encode([
        'success' => true,
        'operator_full_name' => $operatorName,
        'data' => $performanceData,
        'seasonal_analysis' => $seasonalAnalysis,
        'operator_id' => $operatorId,
        'station_id' => $stationId,
        'years_analyzed' => $years
    ]);
}

function getOperatorPerformance($data) {
    global $conn;
    
    $operatorId = $data['operator_id'] ?? '';
    $stationId = $data['station_id'] ?? '';
    $years = intval($data['years'] ?? 3);
    
    if (empty($operatorId) || empty($stationId)) {
        throw new Exception('Operator ID and Station ID are required');
    }
    
    // Calculate date range for the specified number of years
    $currentDate = new DateTime();
    $startDate = (new DateTime())->sub(new DateInterval("P{$years}Y"));
    
    $query = "SELECT 
                operator_id,
                station_id,
                total_passed,
                total_ng,
                avg_processing_time,
                month_year,
                YEAR(month_year) as year,
                MONTH(month_year) as month
              FROM operator_performance_logs 
              WHERE operator_id = ? 
                AND station_id = ? 
                AND month_year >= ? 
              ORDER BY month_year DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $operatorId, $stationId, $startDate->format('Y-m-d'));
    $stmt->execute();
    $result = $stmt->get_result();
    
    $performanceData = [];
    while ($row = $result->fetch_assoc()) {
        $performanceData[] = [
            'operator_id' => $row['operator_id'],
            'station_id' => $row['station_id'],
            'total_passed' => intval($row['total_passed']),
            'total_ng' => intval($row['total_ng']),
            'avg_processing_time' => floatval($row['avg_processing_time']),
            'month_year' => $row['month_year'],
            'year' => intval($row['year']),
            'month' => intval($row['month']),
            'ng_rate' => $row['total_passed'] > 0 ? (intval($row['total_ng']) / (intval($row['total_passed']) + intval($row['total_ng']))) * 100 : 0
        ];
    }
    
    // Calculate seasonal averages and trends
    $seasonalAnalysis = analyzeSeasonalPatterns($performanceData);
    
    echo json_encode([
        'success' => true,
        'data' => $performanceData,
        'seasonal_analysis' => $seasonalAnalysis,
        'operator_id' => $operatorId,
        'station_id' => $stationId,
        'years_analyzed' => $years
    ]);
}

function analyzeSeasonalPatterns($performanceData) {
    if (empty($performanceData)) {
        return null;
    }
    
    // Group data by month (1-12) to identify seasonal patterns
    $monthlyPatterns = [];
    $totalRecords = count($performanceData);
    
    foreach ($performanceData as $record) {
        $month = intval($record['month']);
        if (!isset($monthlyPatterns[$month])) {
            $monthlyPatterns[$month] = [
                'total_ng' => 0,
                'total_passed' => 0,
                'avg_processing_time' => 0,
                'count' => 0,
                'years' => []
            ];
        }
        
        $monthlyPatterns[$month]['total_ng'] += $record['total_ng'];
        $monthlyPatterns[$month]['total_passed'] += $record['total_passed'];
        $monthlyPatterns[$month]['avg_processing_time'] += $record['avg_processing_time'];
        $monthlyPatterns[$month]['count']++;
        $monthlyPatterns[$month]['years'][] = $record['year'];
    }
    
    // Calculate averages for each month
    foreach ($monthlyPatterns as $month => &$data) {
        $totalUnits = $data['total_passed'] + $data['total_ng'];
        $data['avg_ng_rate'] = $totalUnits > 0 ? ($data['total_ng'] / $totalUnits) * 100 : 0;
        $data['avg_processing_time'] = $data['count'] > 0 ? $data['avg_processing_time'] / $data['count'] : 0;
        $data['month_name'] = date('F', mktime(0, 0, 0, $month, 1));
        $data['years_spanned'] = count(array_unique($data['years']));
    }
    
    // Identify trends (improving, declining, stable)
    $trendAnalysis = analyzeTrends($performanceData);
    
    return [
        'monthly_patterns' => $monthlyPatterns,
        'trend_analysis' => $trendAnalysis,
        'data_quality' => [
            'total_months' => count($monthlyPatterns),
            'total_records' => $totalRecords,
            'years_spanned' => count(array_unique(array_column($performanceData, 'year')))
        ]
    ];
}

function analyzeTrends($performanceData) {
    if (count($performanceData) < 3) {
        return ['trend' => 'insufficient_data', 'confidence' => 0];
    }
    
    // Sort by date to analyze trends over time
    usort($performanceData, function($a, $b) {
        return strtotime($a['month_year']) - strtotime($b['month_year']);
    });
    
    // Calculate NG rate trend
    $ngRates = array_column($performanceData, 'ng_rate');
    $processingTimes = array_column($performanceData, 'avg_processing_time');
    
    $ngTrend = calculateLinearTrend($ngRates);
    $processingTrend = calculateLinearTrend($processingTimes);
    
    // Determine overall trend
    $overallTrend = 'stable';
    $confidence = 0;
    
    if (abs($ngTrend) > 0.5 || abs($processingTrend) > 0.5) {
        if ($ngTrend > 1 || $processingTrend > 1) {
            $overallTrend = 'declining';
        } elseif ($ngTrend < -1 || $processingTrend < -1) {
            $overallTrend = 'improving';
        }
        $confidence = min(abs($ngTrend) + abs($processingTrend), 10) / 10;
    }
    
    return [
        'trend' => $overallTrend,
        'confidence' => round($confidence, 2),
        'ng_rate_trend' => round($ngTrend, 2),
        'processing_time_trend' => round($processingTrend, 2)
    ];
}

function calculateLinearTrend($values) {
    if (count($values) < 2) return 0;
    
    $n = count($values);
    $sumX = 0;
    $sumY = 0;
    $sumXY = 0;
    $sumX2 = 0;
    
    for ($i = 0; $i < $n; $i++) {
        $sumX += $i;
        $sumY += $values[$i];
        $sumXY += $i * $values[$i];
        $sumX2 += $i * $i;
    }
    
    $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
    
    return $slope;
}
?>
