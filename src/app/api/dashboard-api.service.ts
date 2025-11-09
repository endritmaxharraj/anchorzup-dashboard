import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SalesData } from '../types/sales-data.type';

import salesDataJson from '../../../data/sales-data.json';

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
}

