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
  createEnhancedDensityChart('densityChart', densityData);
}

function createEnhancedDensityChart(canvasId, densityData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const chartContainer = document.getElementById('densityChartContainer');
  const tooltip = document.getElementById('densityTooltip');
  const verticalLine = document.getElementById('densityVerticalLine');
  
  // Prepare data
  const labels = densityData.map(point => point.duration);
  const data2024 = densityData.map(point => point.density2024);
  const data2025 = densityData.map(point => point.density2025);
  
  // Create x-axis labels
  const xAxisLabels = [];
  for (let i = 0; i <= 92; i += 4) {
    xAxisLabels.push(`${i}h`);
  }
  
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
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(88, 103, 221, 1)',
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
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(121, 204, 160, 1)',
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
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          min: 0,
          max: 5520, // 92 hours in minutes
          title: {
            display: true,
            text: 'Duration (minutes)'
          },
          ticks: {
            autoSkip: false,
            callback: function(value, index) {
              if (index % 60 === 0) { // Show every 4 hours (60 * 4 = 240 minutes)
                const hours = Math.floor(value / 60);
                return `${hours}h`;
              }
              return '';
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
      },
      events: ['mousemove', 'mouseout']
    }
  });
  
  // Add custom tooltip and interaction
  chartContainer.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const xValue = densityChart.scales.x.getValueForPixel(x);
    const hourValue = Math.floor(xValue / 60);
    const minuteValue = Math.round(xValue % 60);
    
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
    
    const value2024 = densityData[closestIndex].density2024.toFixed(2);
    const value2025 = densityData[closestIndex].density2025.toFixed(2);
    
    // Update tooltip
    tooltip.style.display = 'block';
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 50}px`;
    tooltip.innerHTML = `
      <div style="font-weight: bold;">${hourValue}h ${minuteValue}m</div>
      <div style="color: rgba(88, 103, 221, 1);">Feb 2024: ${value2024}</div>
      <div style="color: rgba(121, 204, 160, 1);">Feb 2025: ${value2025}</div>
    `;
    
    // Show vertical line
    verticalLine.style.display = 'block';
    verticalLine.style.left = `${x}px`;
  });
  
  chartContainer.addEventListener('mouseout', function() {
    tooltip.style.display = 'none';
    verticalLine.style.display = 'none';
  });
  
  // Add dataset points for 24h mark
  const densityCanvas = document.getElementById(canvasId);
  
  // After the chart is rendered, draw circular points at the 24h mark
  densityCanvas.addEventListener('click', function(event) {
    const rect = densityCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const xValue = densityChart.scales.x.getValueForPixel(x);
    
    // If we're close to the 24h mark (1440 minutes), show the tooltip with 24h data
    if (Math.abs(xValue - 1440) < 120) {
      // Find the closest data point to 24h
      const index24h = densityData.findIndex(d => d.duration >= 1440);
      
      if (index24h !== -1) {
        const value2024 = densityData[index24h].density2024.toFixed(2);
        const value2025 = densityData[index24h].density2025.toFixed(2);
        
        // Update tooltip
        tooltip.style.display = 'block';
        tooltip.style.left = `${densityChart.scales.x.getPixelForValue(1440) + 10}px`;
        tooltip.style.top = `${densityChart.scales.y.getPixelForValue((value2024 + value2025) / 2) - 50}px`;
        tooltip.innerHTML = `
          <div style="font-weight: bold;">24h 0m</div>
          <div style="color: rgba(88, 103, 221, 1);">Feb 2024: ${value2024}</div>
          <div style="color: rgba(121, 204, 160, 1);">Feb 2025: ${value2025}</div>
        `;
        
        // Show vertical line
        verticalLine.style.display = 'block';
        verticalLine.style.left = `${densityChart.scales.x.getPixelForValue(1440)}px`;
      }
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
