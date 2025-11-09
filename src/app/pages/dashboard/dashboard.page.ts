import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DashboardStateService } from '../../state/dashboard-state.service';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ChartWidgetComponent } from '../../components/chart-widget/chart-widget.component';
import { TableWidgetComponent } from '../../components/table-widget/table-widget.component';
import { WidgetConfig } from '../../types/widget-config.type';

/**
 * Dashboard Page Component
 * Main dashboard view with draggable/resizable widgets, filtering, and layout persistence
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    StatCardComponent,
    ChartWidgetComponent,
    TableWidgetComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  private readonly stateService = inject(DashboardStateService);
  private readonly snackBar = inject(MatSnackBar);

  private resizing = signal(false);
  private resizeStartX = 0;
  private resizeStartWidth = 0;
  private resizingWidget: WidgetConfig | null = null;
  private adjacentWidget: WidgetConfig | null = null;
  private adjacentStartWidth = 0;

  readonly statsData = this.stateService.filteredStats;
  readonly chartData = this.stateService.filteredChartData;
  readonly salesData = this.stateService.filteredSalesData;
  readonly widgetLayout = this.stateService.widgetLayout;
  readonly filters = this.stateService.filters;

  readonly row0Widgets = computed(() => 
    this.widgetLayout().filter(w => w.y === 0).sort((a, b) => a.x - b.x)
  );
  
  readonly row1Widgets = computed(() => 
    this.widgetLayout().filter(w => w.y === 1).sort((a, b) => a.x - b.x)
  );

  selectedDateRange: number = 90;
  readonly dateRanges = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 }
  ];

  ngOnInit(): void {
    this.selectedDateRange = this.filters()?.dateRange || 90;
  }

  /**
   * Handles date range filter changes
   */
  onDateRangeChange(): void {
    const rangeValue = Number(this.selectedDateRange);
    this.stateService.updateFilters({ dateRange: rangeValue });
  }

  /**
   * Saves current widget layout to localStorage
   */
  saveLayout(): void {
    const currentLayout = this.widgetLayout();
    this.stateService.saveLayoutToStorage([...currentLayout]);
    
    this.snackBar.open('✓ Layout saved successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Resets widget layout to default configuration
   */
  resetLayout(): void {
    this.stateService.resetLayout();
    
    this.snackBar.open('✓ Layout reset to default!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Gets stat value by data source key
   */
  getStatValue(key: string): number {
    const stats = this.statsData();
    
    if (key === 'totalSales') {
      return stats.totalSales?.value || 0;
    }
    return 0;
  }

  /**
   * Gets stat change percentage by data source key
   */
  getStatChange(key: string): number {
    const stats = this.statsData();
    
    if (key === 'totalSales') {
      return stats.totalSales?.change || 0;
    }
    return 0;
  }

  /**
   * Gets chart labels by data source key
   */
  getChartLabels(source: string): string[] {
    const data = this.chartData();
    return data[source as keyof typeof data]?.labels || [];
  }

  /**
   * Gets chart data array by data source key
   */
  getChartData(source: string): number[] {
    const data = this.chartData();
    return data[source as keyof typeof data]?.datasets[0]?.data || [];
  }

  /**
   * Calculates widget width as percentage
   */
  getWidgetWidth(widget: WidgetConfig): string {
    return `calc(${(widget.cols / 12) * 100}% - 16px)`;
  }

  /**
   * Handles drag-drop for row 0 widgets
   */
  dropRow0(event: CdkDragDrop<WidgetConfig[]>): void {
    const widgets = [...this.row0Widgets()];
    moveItemInArray(widgets, event.previousIndex, event.currentIndex);
    
    widgets.forEach((widget, index) => {
      let xPos = 0;
      for (let i = 0; i < index; i++) {
        xPos += widgets[i].cols;
      }
      widget.x = xPos;
    });

    this.updateLayout();
  }

  /**
   * Handles drag-drop for row 1 widgets
   */
  dropRow1(event: CdkDragDrop<WidgetConfig[]>): void {
    const widgets = [...this.row1Widgets()];
    moveItemInArray(widgets, event.previousIndex, event.currentIndex);
    
    widgets.forEach((widget, index) => {
      let xPos = 0;
      for (let i = 0; i < index; i++) {
        xPos += widgets[i].cols;
      }
      widget.x = xPos;
    });

    this.updateLayout();
  }

  /**
   * Initiates widget resize operation
   */
  startResize(event: MouseEvent, widget: WidgetConfig, side: 'left' | 'right'): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.resizing.set(true);
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = widget.cols;
    this.resizingWidget = widget;

    const rowWidgets = this.widgetLayout().filter(w => w.y === widget.y).sort((a, b) => a.x - b.x);
    const widgetIndex = rowWidgets.findIndex(w => w.id === widget.id);
    
    if (side === 'right' && widgetIndex < rowWidgets.length - 1) {
      this.adjacentWidget = rowWidgets[widgetIndex + 1];
      this.adjacentStartWidth = this.adjacentWidget.cols;
    } else if (side === 'left' && widgetIndex > 0) {
      this.adjacentWidget = rowWidgets[widgetIndex - 1];
      this.adjacentStartWidth = this.adjacentWidget.cols;
    }

    const mouseMoveHandler = (e: MouseEvent) => this.onResize(e, side);
    const mouseUpHandler = () => this.stopResize(mouseMoveHandler, mouseUpHandler);

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  /**
   * Equalizes widget widths within each row
   */
  private equalizeWidths(): void {
    const layout = [...this.widgetLayout()];
    
    const row0 = layout.filter(w => w.y === 0);
    if (row0.length > 0) {
      const colsPerWidget = Math.floor(12 / row0.length);
      row0.forEach((widget, index) => {
        widget.cols = colsPerWidget;
        widget.x = index * colsPerWidget;
      });
    }

    const row1 = layout.filter(w => w.y === 1);
    if (row1.length > 0) {
      const colsPerWidget = Math.floor(12 / row1.length);
      row1.forEach((widget, index) => {
        widget.cols = colsPerWidget;
        widget.x = index * colsPerWidget;
      });
    }

    this.stateService.updateLayoutState(layout);
  }

  /**
   * Handles resize drag movement
   */
  private onResize(event: MouseEvent, side: 'left' | 'right'): void {
    if (!this.resizingWidget || !this.resizing()) return;

    const deltaX = event.clientX - this.resizeStartX;
    const containerWidth = window.innerWidth - 32;
    const colWidth = containerWidth / 12;
    const deltaColumns = Math.round(deltaX / colWidth);

    if (side === 'right') {
      let newCols = this.resizeStartWidth + deltaColumns;
      newCols = Math.max(2, Math.min(10, newCols));
      
      if (this.adjacentWidget) {
        const totalCols = this.resizeStartWidth + this.adjacentStartWidth;
        const adjacentNewCols = totalCols - newCols;
        
        if (adjacentNewCols >= 2) {
          this.resizingWidget.cols = newCols;
          this.adjacentWidget.cols = adjacentNewCols;
          this.adjacentWidget.x = this.resizingWidget.x + newCols;
        }
      } else {
        this.resizingWidget.cols = newCols;
      }
    } else {
      let newCols = this.resizeStartWidth - deltaColumns;
      newCols = Math.max(2, Math.min(10, newCols));
      
      if (this.adjacentWidget) {
        const totalCols = this.resizeStartWidth + this.adjacentStartWidth;
        const adjacentNewCols = totalCols - newCols;
        
        if (adjacentNewCols >= 2) {
          this.resizingWidget.cols = newCols;
          this.resizingWidget.x = this.adjacentWidget.x + adjacentNewCols;
          this.adjacentWidget.cols = adjacentNewCols;
        }
      }
    }
  }

  /**
   * Completes resize operation and cleans up event listeners
   */
  private stopResize(mouseMoveHandler: (e: MouseEvent) => void, mouseUpHandler: () => void): void {
    this.resizing.set(false);
    this.resizingWidget = null;
    this.adjacentWidget = null;
    
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  }

  /**
   * Updates layout state without persisting to localStorage
   */
  private updateLayout(): void {
    const layout = this.widgetLayout();
    this.stateService.updateLayoutState([...layout]);
  }
}
