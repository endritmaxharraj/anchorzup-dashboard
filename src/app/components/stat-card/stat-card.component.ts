import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Stat Card Component
 * Displays a single statistic with value, label, and trend indicator
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number = 0;
  @Input() change: number = 0;
  @Input() prefix = '';
  @Input() suffix = '';

  readonly Math = Math;

  /**
   * Formats the value with prefix and suffix
   */
  formatValue(): string {
    return `${this.prefix}${this.value.toLocaleString()}${this.suffix}`;
  }
}

