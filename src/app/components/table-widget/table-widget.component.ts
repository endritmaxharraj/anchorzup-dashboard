import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { SalesData } from '../../types/sales-data.type';

/**
 * Table Widget Component
 * Displays sales data in a sortable, filterable, paginated table
 */
@Component({
  selector: 'app-table-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './table-widget.component.html',
  styleUrl: './table-widget.component.scss'
})
export class TableWidgetComponent {
  @Input() title = 'Data Table';
  @Input() set data(value: SalesData[]) {
    this.rawData.set(value);
  }

  private pageIndex = signal(0);
  private sortColumn = signal('');
  private sortDirection = signal<'asc' | 'desc'>('asc');

  readonly displayedColumns: string[] = ['name', 'email', 'country', 'sales', 'status'];
  searchTerm = signal('');
  rawData = signal<SalesData[]>([]);
  pageSize = signal(10);

  /**
   * Filtered data based on search term
   */
  readonly filteredData = computed(() => {
    const data = this.rawData();
    const term = this.searchTerm().toLowerCase();
    
    if (!term) return data;
    
    return data.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.country.toLowerCase().includes(term)
    );
  });

  /**
   * Length of filtered data
   */
  readonly filteredDataLength = computed(() => this.filteredData().length);

  /**
   * Sorted data based on current sort configuration
   */
  readonly sortedData = computed(() => {
    const data = [...this.filteredData()];
    const column = this.sortColumn();
    const direction = this.sortDirection();
    
    if (!column) return data;
    
    return data.sort((a, b) => {
      const aValue = a[column as keyof SalesData];
      const bValue = b[column as keyof SalesData];
      const comparison = aValue > bValue ? 1 : -1;
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  /**
   * Paginated data for current page
   */
  readonly displayedData = computed(() => {
    const data = this.sortedData();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return data.slice(start, end);
  });

  /**
   * Handles search term changes
   */
  onSearchChange(): void {
    this.pageIndex.set(0);
  }

  /**
   * Clears the search field
   */
  clearSearch(): void {
    this.searchTerm.set('');
    this.onSearchChange();
  }

  /**
   * Handles sort changes from table header
   */
  onSortChange(sort: Sort): void {
    this.sortColumn.set(sort.active);
    this.sortDirection.set(sort.direction as 'asc' | 'desc');
  }

  /**
   * Handles pagination changes
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}

