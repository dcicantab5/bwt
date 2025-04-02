# Bed Waiting Time Analysis Dashboard

This repository contains a simple, self-contained interactive visualization of bed waiting times data comparing February 2024 and February 2025. The visualization is designed to be hosted on GitHub Pages without requiring any server-side processing or build steps.

## Features

- **Multiple Visualization Types:**
  - Histogram view (percentage and count)
  - Density plot distribution
  - Box plot with statistical summaries
  - Ward-specific comparison
  - Statistical analysis with significance testing

- **Key Metrics:**
  - 4-hour waiting time standard compliance
  - Extended waits (>24 hours)
  - Ward-level performance
  - Year-over-year comparisons

## Demo

The live dashboard is available at: [https://yourUsername.github.io/bed-waiting-time-analysis](https://yourUsername.github.io/bed-waiting-time-analysis)

## Implementation Details

- All dependencies loaded from CDNs
- Pure client-side implementation with React
- CSV parsing with PapaParse
- Data visualization with Recharts
- Styling with TailwindCSS

## Local Development

To run this project locally:

1. Clone the repository:
   ```
   git clone https://github.com/yourUsername/bed-waiting-time-analysis.git
   ```

2. Navigate to the project directory:
   ```
   cd bed-waiting-time-analysis
   ```

3. Open `index.html` in your browser or use a local server:
   ```
   # Using Python's built-in HTTP server
   python -m http.server
   
   # Or using Node.js http-server if installed
   npx http-server
   ```

## Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Push the code to your repository
3. Enable GitHub Pages in your repository settings (Settings > Pages)
4. Select the branch you want to deploy (usually `main` or `master`)
5. Your site will be published at `https://yourUsername.github.io/repositoryName`

## License

MIT

## Data

The sample data in this repository is synthetic and created for demonstration purposes.
