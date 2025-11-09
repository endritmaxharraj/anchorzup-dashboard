/**
 * Represents a dataset within a chart
 */
export interface ChartDataset {
  label: string;
  data: number[];
}

/**
 * Chart data structure with labels and datasets
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Response structure for chart data
 */
export interface ChartResponse {
  salesTrend: ChartData;
  userActivity: ChartData;
}

