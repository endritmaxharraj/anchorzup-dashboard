# AnchorzUp Dashboard

A modern, interactive dashboard application built with Angular 19, featuring drag-and-drop widgets, real-time data filtering, and persistent layout customization.

## What is this project?

This is a dynamic analytics dashboard that allows users to visualize and interact with sales data through customizable widgets. Users can drag and drop widgets to rearrange their layout, resize widgets horizontally, filter data by date ranges, and have their preferences automatically saved. The dashboard includes stat cards displaying KPIs, interactive charts (line, bar, and pie), and a searchable data table with sorting and pagination.

## Architecture Overview

The project follows a modern Angular 19 architecture with **standalone components**, **Signals for state management**, and a **clean separation of concerns**:

- **Pages Layer**: Contains the main dashboard page that orchestrates the layout and widget management
- **Components Layer**: Reusable, presentation-focused widgets (stat cards, charts, tables) that receive data via inputs
- **State Layer**: Centralized state management service using Angular Signals for reactive data flow
- **API Layer**: Service layer that fetches mock data from JSON files
- **Types Layer**: TypeScript interfaces and type definitions for type safety

Key architectural decisions:
- **No Angular Modules**: Uses standalone components for better tree-shaking and modularity
- **Signals**: Reactive state management without RxJS complexity for simple state
- **inject()**: Modern dependency injection without constructors
- **New Control Flow**: Uses `@if`, `@for`, `@switch` instead of structural directives
- **Angular Material CDK**: Custom drag-drop implementation with horizontal resizing
- **localStorage**: Client-side persistence for layout and user preferences

## How to Run the Project

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v18.19.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Setup

1. **Navigate to the project directory**
```bash
cd /Users/endritmaxharraj/anchorzup-dashboard
```

2. **Install dependencies**
```bash
npm install
```

Note: If you encounter peer dependency warnings, you can use:
```bash
npm install --legacy-peer-deps
```

3. **Start the development server**
```bash
npm start
```

Alternatively, you can use:
```bash
ng serve
```

4. **Open the application**

Once the server starts, open your browser and navigate to:
```
http://localhost:4200
```

The application will automatically reload if you make any changes to the source files.

### Additional Commands

**Build for production:**
```bash
npm run build
```
The production build will be output to the `dist/` directory.

**Run unit tests:**
```bash
npm test
```

**Run linting:**
```bash
ng lint
```

## Features

### Dashboard Functionality
- **Drag & Drop**: Move widgets within their row by dragging anywhere on the widget
- **Horizontal Resize**: Resize widgets from left or right edges; adjacent widgets automatically adjust
- **Date Range Filter**: Filter all data by selecting 7, 30, or 90 days
- **Layout Persistence**: Your layout is automatically saved to localStorage
- **Save/Reset Layout**: Manually save or reset to default layout via header buttons

### Widgets
- **Total Sales Card**: Displays total sales amount with period-over-period percentage change (compares current period vs. previous equal period)
- **Sales Trend Chart**: Line chart showing sales revenue over time with actual dates (7 days shows all dates including zeros, 30/90 days show only dates with data)
- **Daily Transactions Chart**: Bar chart displaying transaction count per day
- **Revenue Distribution Chart**: Pie chart showing revenue breakdown by top 5 countries
- **Recent Sales Table**: Searchable, sortable, paginated table with sales data, empty state, and CSV export

### Responsive Design
The dashboard is fully responsive and adapts to mobile, tablet, and desktop screens.

## Technology Stack

- **Angular**: 19.2.0
- **Angular Material**: 19.2.0
- **Angular CDK**: 19.2.0 (for drag-drop)
- **Chart.js**: 4.5.1
- **Papa Parse**: 5.4.1 (for CSV export)
- **TypeScript**: 5.7.2
- **RxJS**: 7.8.0
- **SCSS**: For styling

## Data Flow

1. Mock sales data is stored in the `data/sales-data.json` file
2. `DashboardApiService` loads the JSON file and returns it as an Observable
3. `DashboardStateService` converts Observable to Signal using `toSignal()` and provides computed signals for:
   - Filtered sales data based on date range
   - Statistics with period-over-period comparison
   - Chart data (sales trend, daily transactions, revenue distribution)
4. Dashboard page accesses state signals and passes data to widget components via inputs
5. Widget components render the data and remain purely presentational
6. State service updates computed values reactively when filters change
7. Layout changes are persisted to localStorage only when explicitly saved

## Project Structure

**API Services**: Handle data fetching from mock JSON files

**State Management**: Centralized state using Angular Signals with computed properties for filtered data

**Pages**: Container components that manage layout and orchestrate widget interactions

**Components**: Presentational components for stats, charts, and tables

**Types**: TypeScript interfaces for type safety across the application

**Mock Data**: Single JSON file (`sales-data.json`) containing sales transactions; all stats and charts are computed from this data

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The project uses Angular 19's new control flow syntax (`@if`, `@for`) instead of structural directives
- State management is handled entirely with Signals, avoiding unnecessary RxJS complexity
- Drag-drop uses Angular Material CDK with custom horizontal resizing logic
- Layout is row-based with widgets movable only within their row
- Charts display all dates (including zeros) for 7-day view, but only dates with data for 30/90-day views
- Period-over-period calculations compare current period vs. previous equal-length period

---

**Built with Angular 19 for AnchorzUp Technical Assessment**
