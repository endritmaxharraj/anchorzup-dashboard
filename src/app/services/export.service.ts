import { Injectable } from '@angular/core';
import { unparse } from 'papaparse';

/**
 * Export Service
 * Handles data export functionality (CSV)
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  /**
   * Exports data to CSV file
   */
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const csv = unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

