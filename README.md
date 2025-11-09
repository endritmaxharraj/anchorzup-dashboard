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
- **Total Sales Card**: Displays total sales amount with percentage change indicator
- **Sales Trend Chart**: Line chart showing sales trends over time
- **User Activity Chart**: Bar chart displaying daily user activity
- **Revenue Distribution Chart**: Pie chart showing revenue breakdown
- **Recent Sales Table**: Searchable, sortable, paginated table with sales data

### Responsive Design
The dashboard is fully responsive and adapts to mobile, tablet, and desktop screens.

## Technology Stack

- **Angular**: 19.2.0
- **Angular Material**: 19.2.0
- **Angular CDK**: 19.2.0 (for drag-drop)
- **Chart.js**: 4.5.1
- **TypeScript**: 5.7.2
- **RxJS**: 7.8.0
- **SCSS**: For styling

## Data Flow

1. Mock JSON data is stored in the `data/` folder
2. `DashboardApiService` loads the JSON files and returns them as Observables
3. `DashboardStateService` converts Observables to Signals and manages filtered/computed state
4. Dashboard page subscribes to state signals and passes data to widget components
5. Widget components render the data and emit user interactions
6. State service updates based on user actions (filtering, layout changes)
7. Layout changes are persisted to localStorage

## Project Structure

**API Services**: Handle data fetching from mock JSON files

**State Management**: Centralized state using Angular Signals with computed properties for filtered data

**Pages**: Container components that manage layout and orchestrate widget interactions

**Components**: Presentational components for stats, charts, and tables

**Types**: TypeScript interfaces for type safety across the application

**Mock Data**: JSON files containing sales data, stats, and chart information

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The project uses Angular 19's new control flow syntax (`@if`, `@for`) instead of structural directives
- State management is handled entirely with Signals, avoiding unnecessary RxJS complexity
- All components are standalone with no NgModules
- Drag-drop uses Angular Material CDK with custom resizing logic
- Layout is row-based with widgets movable only within their row

---

**Built with Angular 19 for AnchorzUp Technical Assessment**
