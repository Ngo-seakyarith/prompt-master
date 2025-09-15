import type { 
  PlaygroundTest, 
  PlaygroundTestResult, 
  PlaygroundComparisonMetrics,
  PlaygroundExportData,
  PlaygroundParameters
} from "@shared/schema";

/**
 * Calculate comparison metrics from test results
 */
export function calculateComparisonMetrics(results: PlaygroundTestResult[]): PlaygroundComparisonMetrics {
  const validResults = results.filter(r => !r.error);
  
  if (validResults.length === 0) {
    return {
      winner: {
        speed: "N/A",
        cost: "N/A", 
        quality: "N/A",
        efficiency: "N/A"
      },
      averageResponseTime: 0,
      totalCost: "0.00",
      responseStats: {
        minLength: 0,
        maxLength: 0,
        avgLength: 0
      }
    };
  }

  // Find winners by different metrics
  const fastestModel = validResults.reduce((prev, curr) => 
    prev.responseTime < curr.responseTime ? prev : curr
  );
  
  const cheapestModel = validResults.reduce((prev, curr) => 
    parseFloat(prev.cost) < parseFloat(curr.cost) ? prev : curr
  );

  const ratedResults = validResults.filter(r => r.rating);
  const highestRatedModel = ratedResults.length > 0 
    ? ratedResults.reduce((prev, curr) => (prev.rating || 0) > (curr.rating || 0) ? prev : curr)
    : validResults[0];

  // Calculate efficiency (rating per dollar spent)
  const efficiencyResults = validResults
    .filter(r => r.rating && parseFloat(r.cost) > 0)
    .map(r => ({ 
      ...r, 
      efficiency: (r.rating || 0) / parseFloat(r.cost) 
    }));
  
  const mostEfficientModel = efficiencyResults.length > 0
    ? efficiencyResults.reduce((prev, curr) => prev.efficiency > curr.efficiency ? prev : curr)
    : cheapestModel;

  // Calculate averages and stats
  const avgResponseTime = validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length;
  const totalCost = validResults.reduce((sum, r) => sum + parseFloat(r.cost), 0).toFixed(2);
  
  const ratings = validResults.filter(r => r.rating).map(r => r.rating!);
  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : undefined;

  // Response length statistics
  const responseLengths = validResults.map(r => r.response.length);
  const minLength = Math.min(...responseLengths);
  const maxLength = Math.max(...responseLengths);
  const avgLength = responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length;

  return {
    winner: {
      speed: fastestModel.modelName,
      cost: cheapestModel.modelName,
      quality: highestRatedModel.modelName,
      efficiency: mostEfficientModel.modelName
    },
    averageResponseTime: Math.round(avgResponseTime),
    totalCost,
    averageRating: avgRating ? Math.round(avgRating * 10) / 10 : undefined,
    responseStats: {
      minLength,
      maxLength,
      avgLength: Math.round(avgLength)
    }
  };
}

/**
 * Export test results to JSON format
 */
export function exportToJSON(test: PlaygroundTest): PlaygroundExportData {
  const metrics = calculateComparisonMetrics(test.results as PlaygroundTestResult[]);
  
  return {
    testId: test.id,
    prompt: test.promptText,
    parameters: test.parameters as PlaygroundParameters,
    results: test.results as PlaygroundTestResult[],
    metrics,
    timestamp: test.createdAt?.toISOString() || new Date().toISOString(),
    userId: test.userId
  };
}

/**
 * Export test results to CSV format
 */
export function exportToCSV(test: PlaygroundTest): string {
  const headers = [
    'Model Name',
    'Response Length (chars)',
    'Token Count', 
    'Cost (USD)',
    'Response Time (ms)',
    'Rating (1-5)',
    'Rated At',
    'Error'
  ];

  const rows = (test.results as PlaygroundTestResult[]).map((result: PlaygroundTestResult) => [
    result.modelName,
    result.response.length.toString(),
    result.tokenCount.toString(),
    result.cost,
    result.responseTime.toString(),
    result.rating?.toString() || '',
    result.ratedAt || '',
    result.error || ''
  ]);

  const csvContent = [
    `"Test ID","${test.id}"`,
    `"Prompt","${test.promptText.replace(/"/g, '""')}"`,
    `"Temperature","${(test.parameters as PlaygroundParameters).temperature}"`,
    `"Max Tokens","${(test.parameters as PlaygroundParameters).maxTokens}"`,
    `"Top P","${(test.parameters as PlaygroundParameters).topP}"`,
    `"Total Cost","${test.totalCost}"`,
    `"Created At","${test.createdAt?.toISOString() || ''}"`,
    '',
    headers.map(h => `"${h}"`).join(','),
    ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Export test results to formatted text
 */
export function exportToText(test: PlaygroundTest): string {
  const metrics = calculateComparisonMetrics(test.results as PlaygroundTestResult[]);
  
  let textContent = `AI PLAYGROUND TEST RESULTS\n`;
  textContent += `${'='.repeat(50)}\n\n`;
  
  textContent += `Test ID: ${test.id}\n`;
  textContent += `Date: ${test.createdAt?.toLocaleString() || 'Unknown'}\n`;
  textContent += `Total Cost: $${test.totalCost}\n\n`;
  
  textContent += `PROMPT:\n`;
  textContent += `${'-'.repeat(20)}\n`;
  textContent += `${test.promptText}\n\n`;
  
  textContent += `PARAMETERS:\n`;
  textContent += `${'-'.repeat(20)}\n`;
  textContent += `Temperature: ${(test.parameters as PlaygroundParameters).temperature}\n`;
  textContent += `Max Tokens: ${(test.parameters as PlaygroundParameters).maxTokens}\n`;
  textContent += `Top P: ${(test.parameters as PlaygroundParameters).topP}\n\n`;

  textContent += `COMPARISON SUMMARY:\n`;
  textContent += `${'-'.repeat(20)}\n`;
  textContent += `Fastest: ${metrics.winner.speed}\n`;
  textContent += `Cheapest: ${metrics.winner.cost}\n`;
  textContent += `Highest Rated: ${metrics.winner.quality}\n`;
  textContent += `Most Efficient: ${metrics.winner.efficiency}\n`;
  if (metrics.averageRating) {
    textContent += `Average Rating: ${metrics.averageRating}/5 stars\n`;
  }
  textContent += `\n`;

  textContent += `MODEL RESPONSES:\n`;
  textContent += `${'='.repeat(50)}\n\n`;

  (test.results as PlaygroundTestResult[]).forEach((result: PlaygroundTestResult, index: number) => {
    textContent += `${index + 1}. ${result.modelName.toUpperCase()}\n`;
    textContent += `${'-'.repeat(30)}\n`;
    textContent += `Cost: $${result.cost}\n`;
    textContent += `Tokens: ${result.tokenCount}\n`;
    textContent += `Response Time: ${result.responseTime}ms\n`;
    if (result.rating) {
      textContent += `Rating: ${'★'.repeat(result.rating)}${'☆'.repeat(5 - result.rating)} (${result.rating}/5)\n`;
    }
    if (result.error) {
      textContent += `Error: ${result.error}\n`;
    } else {
      textContent += `\nResponse:\n${result.response}\n`;
    }
    textContent += `\n${'-'.repeat(50)}\n\n`;
  });

  return textContent;
}

/**
 * Create clipboard-friendly formatted comparison
 */
export function exportToClipboard(test: PlaygroundTest): string {
  const metrics = calculateComparisonMetrics(test.results as PlaygroundTestResult[]);
  
  let clipboardContent = `🧪 AI Playground Test Results\n\n`;
  
  clipboardContent += `📝 Prompt: ${test.promptText}\n`;
  clipboardContent += `💰 Total Cost: $${test.totalCost}\n`;
  if (metrics.averageRating) {
    clipboardContent += `⭐ Average Rating: ${metrics.averageRating}/5\n`;
  }
  clipboardContent += `\n🏆 Winners:\n`;
  clipboardContent += `⚡ Fastest: ${metrics.winner.speed}\n`;
  clipboardContent += `💲 Cheapest: ${metrics.winner.cost}\n`;
  clipboardContent += `⭐ Highest Rated: ${metrics.winner.quality}\n`;
  clipboardContent += `🎯 Most Efficient: ${metrics.winner.efficiency}\n\n`;

  (test.results as PlaygroundTestResult[]).forEach((result: PlaygroundTestResult) => {
    clipboardContent += `🤖 ${result.modelName}\n`;
    clipboardContent += `   Cost: $${result.cost} | Time: ${result.responseTime}ms | Tokens: ${result.tokenCount}\n`;
    if (result.rating) {
      clipboardContent += `   Rating: ${'⭐'.repeat(result.rating)} (${result.rating}/5)\n`;
    }
    if (result.error) {
      clipboardContent += `   ❌ Error: ${result.error}\n`;
    }
    clipboardContent += `\n`;
  });

  return clipboardContent;
}