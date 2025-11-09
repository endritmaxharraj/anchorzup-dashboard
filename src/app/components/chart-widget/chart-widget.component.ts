import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Chart Widget Component
 * Displays various types of charts (line, bar, pie) with optional controls
 */
@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, FormsModule],
  templateUrl: './chart-widget.component.html',
  styleUrl: './chart-widget.component.scss'
})
export class ChartWidgetComponent implements OnInit, OnChanges {
  @Input() title = 'Chart';
  @Input() chartType: 'line' | 'bar' | 'pie' = 'line';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() label = 'Data';
  @Input() showControls = false;

  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  currentChartType: 'line' | 'bar' | 'pie' = 'line';

  ngOnInit(): void {
    this.currentChartType = this.chartType;
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['labels']) && this.chart) {
      this.updateChartData();
    }
  }

  /**
   * Updates the chart type and re-renders
   */
  updateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    this.initChart();
  }

  /**
   * Updates chart data without re-creating the chart
   */
  private updateChartData(): void {
    if (!this.chart) return;
    
    this.chart.data.labels = this.labels;
    this.chart.data.datasets[0].data = this.data;
    this.chart.update();
  }

  /**
   * Initializes the chart with current configuration
   */
  private initChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, this.getChartConfig());
  }

  /**
   * Generates chart configuration based on current settings
   */
  private getChartConfig(): ChartConfiguration {
    return {
      type: this.currentChartType as any,
      data: {
        labels: this.labels,
        datasets: [{
          label: this.label,
          data: this.data,
          backgroundColor: this.currentChartType === 'pie' 
            ? ['#5d3fd3', '#7d5fe6', '#9d7ff0', '#bd9ffa', '#ddbfff']
            : 'rgba(93, 63, 211, 0.2)',
          borderColor: '#5d3fd3',
          borderWidth: 2,
          fill: this.currentChartType === 'line'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          }
        },
        plugins: {
          legend: {
            display: this.currentChartType === 'pie',
            position: 'right',
            align: 'center',
            labels: {
              boxWidth: 15,
              padding: 10,
              font: {
                size: 11
              }
            }
          }
        },
        scales: this.currentChartType !== 'pie' ? {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 10
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            }
          }
        } : undefined
      }
    };
  }
}

