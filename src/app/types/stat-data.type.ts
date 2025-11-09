/**
 * Represents statistical data with trend information
 */
export interface StatData {
  value: number;
  change: number;
  trend: 'up' | 'down';
}

/**
 * Response structure for statistics data
 */
export interface StatsResponse {
  totalSales: StatData;
  activeUsers: StatData;
  engagementRate: StatData;
}

