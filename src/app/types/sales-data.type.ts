/**
 * Represents a sales transaction record
 */
export interface SalesData {
  id: string;
  name: string;
  email: string;
  country: string;
  sales: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

