import { Injectable, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardApiService } from '../api/dashboard-api.service';
import { SalesData } from '../types/sales-data.type';
import { WidgetConfig } from '../types/widget-config.type';
import { FilterConfig } from '../types/filter-config.type';

const LAYOUT_STORAGE_KEY = 'dashboard-layout';

/**
 * Dashboard State Service
 * Manages global state for the dashboard including data, filters, and layout
 * Provides computed signals for filtered and transformed data
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardStateService {
  private readonly apiService = inject(DashboardApiService);

  readonly salesData = toSignal(this.apiService.getSalesData(), {
    initialValue: [],
  });
  readonly statsData = toSignal(this.apiService.getStatsData());
  readonly chartData = toSignal(this.apiService.getChartData());

  private filterState = signal<FilterConfig>({
    dateRange: 90,
  });
  readonly filters = this.filterState.asReadonly();

  private widgetLayoutState = signal<WidgetConfig[]>(this.getDefaultLayout());
  readonly widgetLayout = this.widgetLayoutState.asReadonly();

  /**
   * Filtered sales data based on date range filter
   */
  readonly filteredSalesData = computed(() => {
    const data = this.salesData();
    const filters = this.filterState();
    
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
    
    return data.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= cutoffDate;
    });
  });

  /**
   * Computed statistics based on filtered data
   */
  readonly filteredStats = computed(() => {
    const filtered = this.filteredSalesData();
    const totalSales = filtered.reduce((sum, sale) => sum + sale.sales, 0);
    
    return {
      totalSales: {
        value: totalSales,
        change: 12.5,
        trend: 'up' as const
      },
      activeUsers: {
        value: filtered.length * 10,
        change: 8.2,
        trend: 'up' as const
      },
      recordCount: filtered.length
    };
  });

  /**
   * Computed chart data grouped by day of week from filtered sales
   */
  readonly filteredChartData = computed(() => {
    const filtered = this.filteredSalesData();
    
    const salesByDay: Record<string, number> = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };
    const activityByDay: Record<string, number> = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };
    
    filtered.forEach(sale => {
      const date = new Date(sale.date);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[date.getDay()];
      
      salesByDay[dayName] += sale.sales;
      activityByDay[dayName] += 1;
    });
    
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return {
      salesTrend: {
        labels,
        datasets: [{
          label: 'Sales',
          data: labels.map(day => salesByDay[day])
        }]
      },
      userActivity: {
        labels,
        datasets: [{
          label: 'Active Users',
          data: labels.map(day => activityByDay[day] * 100)
        }]
      }
    };
  });

  constructor() {
    this.loadLayout();
  }

  /**
   * Updates filter configuration
   */
  updateFilters(filters: Partial<FilterConfig>): void {
    this.filterState.update((current) => ({ ...current, ...filters }));
  }

  /**
   * Updates widget layout in memory only (no persistence)
   */
  updateLayoutState(layout: WidgetConfig[]): void {
    this.widgetLayoutState.set(layout);
  }

  /**
   * Updates widget layout and saves to localStorage
   */
  updateLayout(layout: WidgetConfig[]): void {
    this.widgetLayoutState.set(layout);
    this.saveLayoutToStorage(layout);
  }

  /**
   * Saves current layout to localStorage
   */
  saveLayoutToStorage(layout: WidgetConfig[]): void {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  }

  /**
   * Resets layout to default configuration
   */
  resetLayout(): void {
    this.widgetLayoutState.set(this.getDefaultLayout());
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
  }

  /**
   * Loads layout from localStorage on initialization
   */
  private loadLayout(): void {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved) {
      try {
        this.widgetLayoutState.set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load layout', e);
      }
    }
  }

  /**
   * Returns the default widget layout configuration
   */
  private getDefaultLayout(): WidgetConfig[] {
    return [
      {
        id: 'stat-1',
        type: 'stat',
        title: 'Total Sales',
        cols: 3,
        rows: 1,
        x: 0,
        y: 0,
        dataSource: 'totalSales',
      },
      {
        id: 'table-1',
        type: 'table',
        title: 'Recent Sales',
        cols: 9,
        rows: 1,
        x: 3,
        y: 0,
      },
      {
        id: 'chart-1',
        type: 'chart',
        title: 'Sales Trend',
        cols: 4,
        rows: 1,
        x: 0,
        y: 1,
        chartType: 'line',
        dataSource: 'salesTrend',
      },
      {
        id: 'chart-2',
        type: 'chart',
        title: 'User Activity',
        cols: 4,
        rows: 1,
        x: 4,
        y: 1,
        chartType: 'bar',
        dataSource: 'userActivity',
      },
      {
        id: 'chart-3',
        type: 'chart',
        title: 'Revenue Distribution',
        cols: 4,
        rows: 1,
        x: 8,
        y: 1,
        chartType: 'pie',
        dataSource: 'userActivity',
      },
    ];
  }
}

