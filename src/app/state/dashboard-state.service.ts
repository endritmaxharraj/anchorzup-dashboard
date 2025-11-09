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

  private filterState = signal<FilterConfig>({
    dateRange: 90,
  });
  readonly filters = this.filterState.asReadonly();

  private widgetLayoutState = signal<WidgetConfig[]>(this.getDefaultLayout());
  readonly widgetLayout = this.widgetLayoutState.asReadonly();

  /**
   * Filtered sales data based on date range filter (current period)
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
   * Previous period sales data for comparison
   */
  private previousPeriodSalesData = computed(() => {
    const data = this.salesData();
    const filters = this.filterState();
    
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - filters.dateRange);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - filters.dateRange);
    
    return data.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= previousPeriodStart && saleDate < currentPeriodStart;
    });
  });

  /**
   * Computed statistics based on filtered data with period-over-period comparison
   */
  readonly filteredStats = computed(() => {
    const current = this.filteredSalesData();
    const previous = this.previousPeriodSalesData();
    
    const currentTotalSales = current.reduce((sum, sale) => sum + sale.sales, 0);
    const previousTotalSales = previous.reduce((sum, sale) => sum + sale.sales, 0);
    
    const salesChange = previousTotalSales > 0 
      ? ((currentTotalSales - previousTotalSales) / previousTotalSales) * 100 
      : 0;
    
    return {
      totalSales: {
        value: currentTotalSales,
        change: Math.round(salesChange * 10) / 10,
        trend: salesChange >= 0 ? 'up' as const : 'down' as const
      },
      recordCount: current.length
    };
  });

  /**
   * Computed chart data from filtered sales
   */
  readonly filteredChartData = computed(() => {
    const filtered = this.filteredSalesData();
    const dateRange = this.filterState().dateRange;
    
    const salesByDate: Map<string, number> = new Map();
    const transactionsByDate: Map<string, number> = new Map();
    const revenueByCountry: Map<string, number> = new Map();
    
    filtered.forEach(sale => {
      const dateStr = sale.date;
      
      salesByDate.set(dateStr, (salesByDate.get(dateStr) || 0) + sale.sales);
      transactionsByDate.set(dateStr, (transactionsByDate.get(dateStr) || 0) + 1);
      
      revenueByCountry.set(
        sale.country, 
        (revenueByCountry.get(sale.country) || 0) + sale.sales
      );
    });
    
    let salesTrendLabels: string[];
    let salesTrendData: number[];
    let transactionLabels: string[];
    let transactionData: number[];
    
    if (dateRange === 7) {
      const now = new Date();
      const allDates: string[] = [];
      for (let i = dateRange - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        allDates.push(dateStr);
      }
      
      salesTrendLabels = allDates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
      salesTrendData = allDates.map(date => salesByDate.get(date) || 0);
      
      transactionLabels = allDates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
      transactionData = allDates.map(date => transactionsByDate.get(date) || 0);
    } else {
      const sortedDates = Array.from(salesByDate.keys()).sort();
      
      salesTrendLabels = sortedDates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
      salesTrendData = sortedDates.map(date => salesByDate.get(date) || 0);
      
      transactionLabels = sortedDates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
      transactionData = sortedDates.map(date => transactionsByDate.get(date) || 0);
    }
    
    const topCountries = Array.from(revenueByCountry.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      salesTrend: {
        labels: salesTrendLabels.length > 0 ? salesTrendLabels : ['No Data'],
        datasets: [{
          label: 'Sales Revenue',
          data: salesTrendData.length > 0 ? salesTrendData : [0]
        }]
      },
      userActivity: {
        labels: transactionLabels.length > 0 ? transactionLabels : ['No Data'],
        datasets: [{
          label: 'Daily Transactions',
          data: transactionData.length > 0 ? transactionData : [0]
        }]
      },
      revenueDistribution: {
        labels: topCountries.map(([country]) => country),
        datasets: [{
          label: 'Revenue',
          data: topCountries.map(([, revenue]) => revenue)
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
        title: 'Daily Transactions',
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
        dataSource: 'revenueDistribution',
      },
    ];
  }
}

