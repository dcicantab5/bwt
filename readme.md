# Bed Waiting Time Analysis Dashboard

This repository contains a simple, self-contained interactive visualisation of bed waiting times data comparing February 2024 and February 2025. The visualisation is designed to be hosted on GitHub Pages without requiring any server-side processing or build steps.

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

## Implementation Details

- All dependencies loaded from CDNs
- Pure client-side implementation with React
- CSV parsing with PapaParse
- Data visualisation with Recharts
- Styling with TailwindCSS

## License

AGPL 3.0

## Data

Acknowledgment: Special thanks to Dr. Yeoh Zi Ning for sharing the valuable data that made this analysis possible. The insights derived from this dataset contribute significantly to our understanding of bed waiting time trends between 2024-2025.
