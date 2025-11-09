/**
 * Configuration for dashboard widgets including position and display settings
 */
export interface WidgetConfig {
  id: string;
  type: 'stat' | 'chart' | 'table';
  title: string;
  cols: number;
  rows: number;
  x: number;
  y: number;
  width?: number;
  chartType?: 'line' | 'bar' | 'pie';
  dataSource?: string;
}

