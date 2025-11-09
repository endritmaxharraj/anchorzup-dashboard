import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SalesData } from '../types/sales-data.type';
import { StatsResponse } from '../types/stat-data.type';
import { ChartResponse } from '../types/chart-data.type';

// Import mock data
import salesDataJson from '../../../data/sales-data.json';
import statsDataJson from '../../../data/stats-data.json';
import chartDataJson from '../../../data/chart-data.json';

/**
 * Dashboard API Service
 * Provides access to dashboard data through observable streams
 * Currently uses mock data from JSON files
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  /**
   * Fetches sales transaction data
   */
  getSalesData(): Observable<SalesData[]> {
    return of(salesDataJson as SalesData[]);
  }

  /**
   * Fetches statistical metrics data
   */
  getStatsData(): Observable<StatsResponse> {
    return of(statsDataJson as StatsResponse);
  }

  /**
   * Fetches chart visualization data
   */
  getChartData(): Observable<ChartResponse> {
    return of(chartDataJson as ChartResponse);
  }
}

