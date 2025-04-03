// Main application script for Bed Waiting Time Analysis Dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Load data
  fetch('data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      // Initialize the dashboard with the data
      initializeDashboard(data);
      // Hide loading spinner
      document.getElementById('loadingSpinner').style.display = 'none';
    })
    .catch(error => {
      console.error('Error loading data:', error);
      alert('Error loading data. Please check console for details.');
      document.getElementById('loadingSpinner').style.display = 'none';
    });
});

function initializeDashboard(data) {
  // Initialize Histogram Tab
  initializeHistogramTab(data.statistics.histogram);
  
  // Initialize Density Plot Tab
  initializeDensityTab(data.statistics.densityData);
  
  // Initialize Box Plot Tab
  initializeBoxPlotTab(data.statistics.overall);
  
  // Initialize By Ward Tab
  initializeByWardTab(data.statistics.byWard, data.summary);
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

function initializeHistogramTab(histogramData) {
  // Create histogram charts
  createHistogramChart('histogramPercentChart', histogramData, 'percent');
  createHistogramChart('histogramCountChart', histogramData, 'count');
}

function createHistogramChart(canvasId, histogramData, type) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Prepare data
  const labels = histogramData.map(bin => bin.bin);
  const data2024 = histogramData.map(bin => type === 'percent' ? bin.percent2024 : bin.count2024);
  const data2025 = histogramData.map(bin => type === 'percent' ? bin.percent2025 : bin.count2025);
  
  // Create chart
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Feb 2024',
          data: data2024,
          backgroundColor: 'rgba(88, 103, 221, 0.7)',
          borderColor: 'rgba(88, 103, 221, 1)',
          borderWidth: 1
        },
        {
          label: 'Feb 2025',
          data: data2025,
          backgroundColor: 'rgba(121, 204, 160, 0.7)',
          borderColor: 'rgba(121, 204, 160, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return type === 'percent' ? value + '%' : value;
            }
          },
          title: {
            display: true,
            text: type === 'percent' ? 'Percentage of Cases (%)' : 'Number of Cases'
          }
        },
        x: {
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'Waiting Time Range'
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'rect'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value}${type === 'percent' ? '%' : ''}`;
            }
          }
        }
      }
    }
  });
}

function initializeDensityTab(densityData) {
  // Create density plot
  createDensityChart('densityChart', densityData);
}

function createDensityChart(canvasId, densityData) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const chartContainer = document.getElementById('densityChartContainer');
  const tooltip = document.getElementById('densityTooltip');
  const verticalLine = document.getElementById('densityVerticalLine');
  
  // Prepare data
  const labels = densityData.map(point => point.duration);
  const data2024 = densityData.map(point => point.density2024);
  const data2025 = densityData.map(point => point.density2025);
  
  // Create chart
  const densityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Feb 2024',
          data: data2024,
          borderColor: 'rgba(88, 103, 221, 1)',
          backgroundColor: 'rgba(88, 103, 221, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Feb 2025',
          data: data2025,
          borderColor: 'rgba(121, 204, 160, 1)',
          backgroundColor: 'rgba(121, 204, 160, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 80,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          title: {
            display: true,
            text: 'Density'
          }
        },
        x: {
          type: 'linear',
          min: 0,
          max: 5520, // 92 hours in minutes
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          title: {
            display: true,
            text: 'Duration (minutes)'
          },
          ticks: {
            stepSize: 240, // 4 hours
            callback: function(value) {
              return `${Math.floor(value / 60)}h`;
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'rect'
          }
        },
        tooltip: {
          enabled: false // Disable the default tooltip
        }
      }
    }
  });
  
  // Create SVG for intersection points
  const pointsContainer = document.createElement('div');
  pointsContainer.id = 'densityPointsContainer';
  pointsContainer.style.position = 'absolute';
  pointsContainer.style.top = '0';
  pointsContainer.style.left = '0';
  pointsContainer.style.width = '100%';
  pointsContainer.style.height = '100%';
  pointsContainer.style.pointerEvents = 'none';
  chartContainer.appendChild(pointsContainer);
  
  // Add interactivity
  chartContainer.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Get chart area positions
    const chartArea = densityChart.chartArea;
    const yAxisBottom = chartArea.bottom;
    
    // Check if the mouse is within the chart area (horizontally)
    if (x < chartArea.left || x > chartArea.right) {
      tooltip.style.display = 'none';
      verticalLine.style.display = 'none';
      pointsContainer.innerHTML = '';
      return;
    }
    
    const xValue = densityChart.scales.x.getValueForPixel(x);
    
    // Find closest data point
    let closestIndex = 0;
    let minDistance = Math.abs(densityData[0].duration - xValue);
    
    for (let i = 1; i < densityData.length; i++) {
      const distance = Math.abs(densityData[i].duration - xValue);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    // Get y values for both datasets at this x position
    const y2024 = densityData[closestIndex].density2024;
    const y2025 = densityData[closestIndex].density2025;
    
    // Convert y values to canvas coordinates
    const y2024Pixel = densityChart.scales.y.getPixelForValue(y2024);
    const y2025Pixel = densityChart.scales.y.getPixelForValue(y2025);
    
    // Update tooltip
    tooltip.style.display = 'block';
    tooltip.style.left = (x + 10) + 'px';
    tooltip.style.top = (y - 50) + 'px';
    
    // Format time
    const hours = Math.floor(xValue / 60);
    const minutes = Math.round(xValue % 60);
    const timeStr = `${hours}h ${minutes}m`;
    
    tooltip.innerHTML = `
      <div style="font-weight: bold;">${timeStr}</div>
      <div style="color: rgba(88, 103, 221, 1);">Feb 2024: ${y2024.toFixed(2)}</div>
      <div style="color: rgba(121, 204, 160, 1);">Feb 2025: ${y2025.toFixed(2)}</div>
    `;
    
    // Show vertical line only within chart area
    verticalLine.style.display = 'block';
    verticalLine.style.height = (yAxisBottom - chartArea.top) + 'px';
    verticalLine.style.left = x + 'px';
    verticalLine.style.top = chartArea.top + 'px';
    
    // Add intersection points
    pointsContainer.innerHTML = '';
    
    // Create point for 2024 data
    if (y2024 > 0) {
      const point2024 = document.createElement('div');
      point2024.style.position = 'absolute';
      point2024.style.width = '8px';
      point2024.style.height = '8px';
      point2024.style.borderRadius = '50%';
      point2024.style.backgroundColor = 'rgba(88, 103, 221, 1)';
      point2024.style.transform = 'translate(-4px, -4px)';
      point2024.style.left = x + 'px';
      point2024.style.top = y2024Pixel + 'px';
      pointsContainer.appendChild(point2024);
    }
    
    // Create point for 2025 data
    if (y2025 > 0) {
      const point2025 = document.createElement('div');
      point2025.style.position = 'absolute';
      point2025.style.width = '8px';
      point2025.style.height = '8px';
      point2025.style.borderRadius = '50%';
      point2025.style.backgroundColor = 'rgba(121, 204, 160, 1)';
      point2025.style.transform = 'translate(-4px, -4px)';
      point2025.style.left = x + 'px';
      point2025.style.top = y2025Pixel + 'px';
      pointsContainer.appendChild(point2025);
    }
  });
  
  chartContainer.addEventListener('mouseout', function() {
    tooltip.style.display = 'none';
    verticalLine.style.display = 'none';
    pointsContainer.innerHTML = '';
  });
  
  // Special point at 24h
  canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const xValue = densityChart.scales.x.getValueForPixel(x);
    const chartArea = densityChart.chartArea;
    
    // If near 24h mark (1440 minutes), show special tooltip
    if (Math.abs(xValue - 1440) < 120) {
      const x24h = densityChart.scales.x.getPixelForValue(1440);
      
      // Get y values at 24h
      const y2024At24h = 3.51;
      const y2025At24h = 13.14;
      
      // Convert to pixel positions
      const y2024Pixel = densityChart.scales.y.getPixelForValue(y2024At24h);
      const y2025Pixel = densityChart.scales.y.getPixelForValue(y2025At24h);
      
      tooltip.style.display = 'block';
      tooltip.style.left = (x24h + 10) + 'px';
      tooltip.style.top = (rect.top + 10) + 'px';
      tooltip.innerHTML = `
        <div style="font-weight: bold;">24h 0m</div>
        <div style="color: rgba(88, 103, 221, 1);">Feb 2024: 3.51</div>
        <div style="color: rgba(121, 204, 160, 1);">Feb 2025: 13.14</div>
      `;
      
      verticalLine.style.display = 'block';
      verticalLine.style.height = (chartArea.bottom - chartArea.top) + 'px';
      verticalLine.style.left = x24h + 'px';
      verticalLine.style.top = chartArea.top + 'px';
      
      // Add intersection points
      pointsContainer.innerHTML = '';
      
      // Create point for 2024 data
      const point2024 = document.createElement('div');
      point2024.style.position = 'absolute';
      point2024.style.width = '8px';
      point2024.style.height = '8px';
      point2024.style.borderRadius = '50%';
      point2024.style.backgroundColor = 'rgba(88, 103, 221, 1)';
      point2024.style.transform = 'translate(-4px, -4px)';
      point2024.style.left = x24h + 'px';
      point2024.style.top = y2024Pixel + 'px';
      pointsContainer.appendChild(point2024);
      
      // Create point for 2025 data
      const point2025 = document.createElement('div');
      point2025.style.position = 'absolute';
      point2025.style.width = '8px';
      point2025.style.height = '8px';
      point2025.style.borderRadius = '50%';
      point2025.style.backgroundColor = 'rgba(121, 204, 160, 1)';
      point2025.style.transform = 'translate(-4px, -4px)';
      point2025.style.left = x24h + 'px';
      point2025.style.top = y2025Pixel + 'px';
      pointsContainer.appendChild(point2025);
    }
  });
}

function initializeBoxPlotTab(overallData) {
  // Create box plots
  createBoxPlot('boxPlot2024', overallData.stats2024);
  createBoxPlot('boxPlot2025', overallData.stats2025);
  
  // Create key statistics table
  const keyStatsTable = document.getElementById('keyStatsTable');
  keyStatsTable.innerHTML = '';
  
  // Add rows to the table
  addStatRow(keyStatsTable, 'Median', overallData.stats2024.median, overallData.stats2025.median, overallData.comparison.medianChange, overallData.comparison.medianChangePercent);
  addStatRow(keyStatsTable, 'Mean', overallData.stats2024.mean, overallData.stats2025.mean, overallData.comparison.meanChange, overallData.comparison.meanChangePercent);
  addStatRow(keyStatsTable, 'Q1 (25th percentile)', overallData.stats2024.q1, overallData.stats2025.q1, overallData.comparison.q1Change, overallData.comparison.q1ChangePercent);
  addStatRow(keyStatsTable, 'Q3 (75th percentile)', overallData.stats2024.q3, overallData.stats2025.q3, overallData.comparison.q3Change, overallData.comparison.q3ChangePercent);
  addStatRow(keyStatsTable, 'IQR (Q3-Q1)', overallData.stats2024.iqr, overallData.stats2025.iqr, overallData.comparison.iqrChange, overallData.comparison.iqrChangePercent);
}

function createBoxPlot(containerId, stats) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  // Calculate the positions relative to the container width
  const maxVal = 5000; // We'll cap at 5000 for better visibility
  const minPos = (stats.min / maxVal) * 100;
  const q1Pos = (stats.q1 / maxVal) * 100;
  const medianPos = (stats.median / maxVal) * 100;
  const q3Pos = (stats.q3 / maxVal) * 100;
  const maxPos = Math.min((stats.max / maxVal) * 100, 100);
  const meanPos = Math.min((stats.mean / maxVal) * 100, 100);
  
  // Create the elements
  const axis = document.createElement('div');
  axis.className = 'box-plot-axis';
  container.appendChild(axis);
  
  const box = document.createElement('div');
  box.className = 'box-plot-box';
  box.style.left = q1Pos + '%';
  box.style.width = (q3Pos - q1Pos) + '%';
  box.setAttribute('data-bs-toggle', 'tooltip');
  box.setAttribute('data-bs-placement', 'top');
  box.setAttribute('title', `IQR: ${stats.q1} to ${stats.q3}`);
  container.appendChild(box);
  
  const median = document.createElement('div');
  median.className = 'box-plot-median';
  median.style.left = medianPos + '%';
  median.setAttribute('data-bs-toggle', 'tooltip');
  median.setAttribute('data-bs-placement', 'top');
  median.setAttribute('title', `Median: ${stats.median}`);
  container.appendChild(median);
  
  const minWhisker = document.createElement('div');
  minWhisker.className = 'box-plot-whisker';
  minWhisker.style.left = minPos + '%';
  minWhisker.setAttribute('data-bs-toggle', 'tooltip');
  minWhisker.setAttribute('data-bs-placement', 'top');
  minWhisker.setAttribute('title', `Min: ${stats.min}`);
  container.appendChild(minWhisker);
  
  const maxWhisker = document.createElement('div');
  maxWhisker.className = 'box-plot-whisker';
  maxWhisker.style.left = maxPos + '%';
  maxWhisker.setAttribute('data-bs-toggle', 'tooltip');
  maxWhisker.setAttribute('data-bs-placement', 'top');
  maxWhisker.setAttribute('title', `Max: ${stats.max > maxVal ? maxVal + '+' : stats.max}`);
  container.appendChild(maxWhisker);
  
  const mean = document.createElement('div');
  mean.className = 'box-plot-mean';
  mean.style.left = meanPos + '%';
  mean.setAttribute('data-bs-toggle', 'tooltip');
  mean.setAttribute('data-bs-placement', 'top');
  mean.setAttribute('title', `Mean: ${stats.mean}`);
  container.appendChild(mean);
  
  // Add whisker lines
  const minToQ1Line = document.createElement('div');
  minToQ1Line.style.position = 'absolute';
  minToQ1Line.style.top = '50px';
  minToQ1Line.style.height = '1px';
  minToQ1Line.style.backgroundColor = '#333';
  minToQ1Line.style.left = minPos + '%';
  minToQ1Line.style.width = (q1Pos - minPos) + '%';
  container.appendChild(minToQ1Line);
  
  const q3ToMaxLine = document.createElement('div');
  q3ToMaxLine.style.position = 'absolute';
  q3ToMaxLine.style.top = '50px';
  q3ToMaxLine.style.height = '1px';
  q3ToMaxLine.style.backgroundColor = '#333';
  q3ToMaxLine.style.left = q3Pos + '%';
  q3ToMaxLine.style.width = (maxPos - q3Pos) + '%';
  container.appendChild(q3ToMaxLine);
  
  // Add labels with spacing
  const labels = [
    { pos: minPos, text: `Min: ${stats.min}` },
    { pos: q1Pos, text: `Q1: ${stats.q1}` },
    { pos: medianPos, text: `Median: ${stats.median}` },
    { pos: q3Pos, text: `Q3: ${stats.q3}` },
    { pos: maxPos, text: `Max: ${stats.max > maxVal ? maxVal + '+' : stats.max}` }
  ];
  
  // Add mean text beneath
  const meanText = document.createElement('div');
  meanText.style.position = 'absolute';
  meanText.style.top = '110px';
  meanText.style.left = '50%';
  meanText.style.transform = 'translateX(-50%)';
  meanText.style.textAlign = 'center';
  meanText.innerHTML = `<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; background-color: #dc3545; border-radius: 50%; margin-right: 5px;"></span>Mean: ${stats.mean}</span>`;
  container.appendChild(meanText);
}

function addStatRow(table, label, value2024, value2025, change, percentChange) {
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td class="fw-bold">${label}</td>
    <td>${value2024}</td>
    <td>${value2025}</td>
    <td>${change}</td>
    <td>${percentChange}%</td>
  `;
  
  table.appendChild(row);
}

function initializeByWardTab(wardData, summaryData) {
  // Create ward comparison charts
  createWardComparisonChart('wardMeanChart', wardData, 'mean', 'Mean Waiting Time by Ward');
  createWardComparisonChart('wardMedianChart', wardData, 'median', 'Median Waiting Time by Ward');
  createWardCasesChart('wardCasesChart', summaryData);
}

function createWardComparisonChart(canvasId, wardData, metric, title) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Prepare data
  const wards = Object.keys(wardData);
  const data2024 = wards.map(ward => wardData[ward].stats2024[metric]);
  const data2025 = wards.map(ward => wardData[ward].stats2025[metric]);
  
  // Create chart
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: wards,
      datasets: [
        {
          label: 'Feb 2024',
          data: data2024,
          backgroundColor: 'rgba(88, 103, 221, 0.7)',
          borderColor: 'rgba(88, 103, 221, 1)',
          borderWidth: 1
        },
        {
          label: 'Feb 2025',
          data: data2025,
          backgroundColor: 'rgba(121, 204, 160, 0.7)',
          borderColor: 'rgba(121, 204, 160, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          title: {
            display: true,
            text: metric === 'mean' ? 'Mean Duration (minutes)' : 'Median Duration (minutes)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'rect'
          }
        },
        title: {
          display: false,
          text: title
        }
      }
    }
  });
}

function createWardCasesChart(canvasId, summaryData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Prepare data
  const wards = Object.keys(summaryData.wardCounts2024);
  const data2024 = wards.map(ward => summaryData.wardCounts2024[ward]);
  const data2025 = wards.map(ward => summaryData.wardCounts2025[ward]);
  
  // Create chart
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: wards,
      datasets: [
        {
          label: 'Feb 2024',
          data: data2024,
          backgroundColor: 'rgba(88, 103, 221, 0.7)',
          borderColor: 'rgba(88, 103, 221, 1)',
          borderWidth: 1
        },
        {
          label: 'Feb 2025',
          data: data2025,
          backgroundColor: 'rgba(121, 204, 160, 0.7)',
          borderColor: 'rgba(121, 204, 160, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          title: {
            display: true,
            text: 'Number of Cases'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'rect'
          }
        }
      }
    }
  });
}
