// Main application script for Bed Waiting Time Distribution Dashboard
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
  // Set metadata and update footer
  displayMetadata(data.metadata);
  
  // Initialize Histogram Tab
  initializeHistogramTab(data.statistics.histogram);
  
  // Initialize Density Plot Tab
  initializeDensityTab(data.statistics.densityData);
  
  // Initialize Box Plot Tab
  initializeBoxPlotTab(data.statistics.overall);
  
  // Initialize By Ward Tab
  initializeByWardTab(data.statistics.byWard, data.summary);
  
  // Initialize Statistical Analysis Tab
  initializeStatisticalTab(data.statistics.statAnalysis, data.statistics.overall, data.statistics.thresholds);
  
  // Set global observations
  setGlobalObservations(data.keyObservations);
}

function displayMetadata(metadata) {
  // Format and display the generation date
  const date = new Date(metadata.generatedDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('footerDate').textContent = formattedDate;
}

function initializeHistogramTab(histogramData) {
  // Create histogram charts
  createHistogramChart('histogramPercentChart', histogramData, 'percent');
  createHistogramChart('histogramCountChart', histogramData, 'count');
  
  // Set histogram observations
  const histogramObservations = document.getElementById('histogramObservations');
  const observations = [
    "The proportion of patients with waits under 4 hours decreased dramatically from 45.5% in 2024 to only 19.0% in 2025.",
    "In 2024, the majority of patients (70.6%) waited less than 8 hours, compared to only 39.3% in 2025.",
    "The proportion of patients waiting 16-24 hours increased from 4.9% in 2024 to 17.6% in 2025.",
    "The percentage of patients with extremely long waits (over 24 hours) increased from 4.4% in 2024 to 24.6% in 2025.",
    "The 2024 distribution is heavily skewed toward shorter waiting times, while the 2025 distribution is more spread out across all time intervals."
  ];
  
  observations.forEach(obs => {
    const li = document.createElement('li');
    li.textContent = obs;
    histogramObservations.appendChild(li);
  });
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
  
  // Set density plot observations
  const densityObservations = document.getElementById('densityObservations');
  const observations = [
    "The 2024 distribution has a single peak at around 4 hours, showing most patients were seen relatively quickly.",
    "The 2025 distribution is much flatter with less pronounced peaks, indicating greater variability in waiting times.",
    "In 2024, the density drops sharply after 8 hours, while in 2025 it remains substantial even beyond 24 hours.",
    "The 2025 distribution shows a secondary peak around 16-18 hours, suggesting a potential bottleneck in the system at this duration.",
    "The area under the curve past 24 hours (1440 minutes) is significantly larger in 2025, confirming the increase in extended waits."
  ];
  
  observations.forEach(obs => {
    const li = document.createElement('li');
    li.textContent = obs;
    densityObservations.appendChild(li);
  });
}

function createDensityChart(canvasId, densityData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Prepare data
  const labels = densityData.map(point => point.duration);
  const data2024 = densityData.map(point => point.density2024);
  const data2025 = densityData.map(point => point.density2025);
  
  // Create chart
  new Chart(ctx, {
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
          title: {
            display: true,
            text: 'Duration (minutes)'
          },
          ticks: {
            callback: function(value) {
              return `${Math.floor(value/60)}h`;
            },
            maxRotation: 0
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
            title: function(context) {
              const value = context[0].raw;
              const minutes = context[0].label;
              return `${Math.floor(minutes/60)}h ${minutes%60}m`;
            }
          }
        }
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
  
  // Add rows to the table
  addStatRow(keyStatsTable, 'Median', overallData.stats2024.median, overallData.stats2025.median, overallData.comparison.medianChange, overallData.comparison.medianChangePercent);
  addStatRow(keyStatsTable, 'Mean', overallData.stats2024.mean, overallData.stats2025.mean, overallData.comparison.meanChange, overallData.comparison.meanChangePercent);
  addStatRow(keyStatsTable, 'Q1 (25th percentile)', overallData.stats2024.q1, overallData.stats2025.q1, overallData.comparison.q1Change, overallData.comparison.q1ChangePercent);
  addStatRow(keyStatsTable, 'Q3 (75th percentile)', overallData.stats2024.q3, overallData.stats2025.q3, overallData.comparison.q3Change, overallData.comparison.q3ChangePercent);
  addStatRow(keyStatsTable, 'IQR (Q3-Q1)', overallData.stats2024.iqr, overallData.stats2025.iqr, overallData.comparison.iqrChange, overallData.comparison.iqrChangePercent);
  
  // Set box plot observations
  const boxPlotObservations = document.getElementById('boxPlotObservations');
  const observations = [
    "Median waiting time increased from 271 minutes in 2024 to 765 minutes in 2025, a 182.3% increase.",
    "The interquartile range (IQR) widened substantially from 372 minutes in 2024 to 1124 minutes in 2025, indicating much greater variability in 2025.",
    "The 75th percentile (Q3) increased by 167.4%, from 534 minutes to 1428 minutes, showing a dramatic shift in the upper range of waiting times.",
    "Even the 25th percentile (Q1) increased by 87.7%, from 162 minutes to 304 minutes, indicating that even the quicker admissions took longer in 2025.",
    "The position of the mean relative to the median in both years suggests a right-skewed distribution, with some extremely long waits pulling the mean higher than the median."
  ];
  
  observations.forEach(obs => {
    const li = document.createElement('li');
    li.textContent = obs;
    boxPlotObservations.appendChild(li);
  });
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
  container.appendChild(box);
  
  const median = document.createElement('div');
  median.className = 'box-plot-median';
  median.style.left = medianPos + '%';
  container.appendChild(median);
  
  const minWhisker = document.createElement('div');
  minWhisker.className = 'box-plot-whisker';
  minWhisker.style.left = minPos + '%';
  container.appendChild(minWhisker);
  
  const maxWhisker = document.createElement('div');
  maxWhisker.className = 'box-plot-whisker';
  maxWhisker.style.left = maxPos + '%';
  container.appendChild(maxWhisker);
  
  const mean = document.createElement('div');
  mean.className = 'box-plot-mean';
  mean.style.left = meanPos + '%';
  container.appendChild(mean);
  
  // Add labels
  const labels = [
    { pos: minPos, text: 'Min: ' + stats.min },
    { pos: q1Pos, text: 'Q1: ' + stats.q1 },
    { pos: medianPos, text: 'Median: ' + stats.median },
    { pos: q3Pos, text: 'Q3: ' + stats.q3 },
    { pos: maxPos, text: 'Max: ' + (stats.max > maxVal ? maxVal + '+' : stats.max) }
  ];
  
  labels.forEach(label => {
    const element = document.createElement('div');
    element.className = 'box-plot-label';
    element.style.left = label.pos + '%';
    element.textContent = label.text;
    container.appendChild(element);
  });
  
  // Add mean label below box
  const meanLabel = document.createElement('div');
  meanLabel.style.position = 'absolute';
  meanLabel.style.top = '110px';
  meanLabel.style.width = '100%';
  meanLabel.style.textAlign = 'center';
  meanLabel.innerHTML = '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; background-color: #dc3545; border-radius: 50%; margin-right: 5px;"></span>Mean: ' + stats.mean + '</span>';
  container.appendChild(meanLabel);
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
  
  // Set ward observations
  const byWardObservations = document.getElementById('byWardObservations');
  const observations = [
    "All wards except W6D show substantial increases in median waiting times from 2024 to 2025.",
    "W6B had the most dramatic increase in median waiting time, from 207 minutes in 2024 to 895 minutes in 2025 (332% increase).",
    "W6A's median waiting time increased from 345 minutes in 2024 to 940 minutes in 2025 (172% increase).",
    "W6D is the only ward that showed improvement, with median waiting time decreasing from 479 minutes in 2024 to 452 minutes in 2025 (5.6% decrease).",
    "W6D saw a significant increase in patient volume, from 60 patients in 2024 to 195 in 2025, which may have affected its performance.",
    "W6B had the shortest median waiting time in 2024 (207 minutes) but the second longest in 2025 (895 minutes)."
  ];
  
  observations.forEach(obs => {
    const li = document.createElement('li');
    li.textContent = obs;
    byWardObservations.appendChild(li);
  });
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

function initializeStatisticalTab(statData, overallData, thresholdData) {
  // Populate Mann-Whitney test table
  const mannWhitneyTable = document.getElementById('mannWhitneyTable');
  
  addSimpleRow(mannWhitneyTable, 'U statistic', statData.mannWhitney.uStatistic);
  addSimpleRow(mannWhitneyTable, 'Z score', statData.mannWhitney.zScore.toFixed(4));
  addSimpleRow(mannWhitneyTable, 'p-value', `< ${statData.mannWhitney.pValue}`);
  addSimpleRow(mannWhitneyTable, 'Median 2024', `${overallData.stats2024.median} minutes`);
  addSimpleRow(mannWhitneyTable, 'Median 2025', `${overallData.stats2025.median} minutes`);
  
  // Populate Bootstrap table
  const bootstrapTable = document.getElementById('bootstrapTable');
  addSimpleRow(bootstrapTable, 'Observed difference (2025 - 2024)', `${statData.bootstrapMedian.observedDifference} minutes`);
  addSimpleRow(bootstrapTable, '95% Confidence Interval', `[${statData.bootstrapMedian.ci95[0]}, ${statData.bootstrapMedian.ci95[1]}]`);
  
  // Populate 4-hour standard table
  const fourHourTable = document.getElementById('fourHourTable');
  const fourHourData = thresholdData.find(t => t.threshold === "4 hours");
  
  addSimpleRow(fourHourTable, 'Chi-square statistic', statData.chiSquare4Hour.statistic.toFixed(4));
  addSimpleRow(fourHourTable, 'p-value', `< ${statData.chiSquare4Hour.pValue}`);
  addSimpleRow(fourHourTable, 'Odds ratio', statData.chiSquare4Hour.oddsRatio.toFixed(2));
  addSimpleRow(fourHourTable, '95% CI for odds ratio', `[${statData.chiSquare4Hour.ci95[0]}, ${statData.chiSquare4Hour.ci95[1]}]`);
  addSimpleRow(fourHourTable, 'Proportion meeting threshold 2024', `${fourHourData.within2024.percent}%`);
  addSimpleRow(fourHourTable, 'Proportion meeting threshold 2025', `${fourHourData.within2025.percent}%`);
  
  // Populate 6-hour standard table
  const sixHourTable = document.getElementById('sixHourTable');
  const sixHourData = thresholdData.find(t => t.threshold === "6 hours");
  
  addSimpleRow(sixHourTable, 'Chi-square statistic', statData.chiSquare6Hour.statistic.toFixed(4));
  addSimpleRow(sixHourTable, 'p-value', `< ${statData.chiSquare6Hour.pValue}`);
  addSimpleRow(sixHourTable, 'Odds ratio', statData.chiSquare6Hour.oddsRatio.toFixed(2));
  addSimpleRow(sixHourTable, '95% CI for odds ratio', `[${statData.chiSquare6Hour.ci95[0]}, ${statData.chiSquare6Hour.ci95[1]}]`);
  addSimpleRow(sixHourTable, 'Proportion meeting threshold 2024', `${sixHourData.within2024.percent}%`);
  addSimpleRow(sixHourTable, 'Proportion meeting threshold 2025', `${sixHourData.within2025.percent}%`);
  
  // Populate extended waits table
  const extendedWaitsTable = document.getElementById('extendedWaitsTable');
  const twentyFourHourData = thresholdData.find(t => t.threshold === "24 hours");
  
  addSimpleRow(extendedWaitsTable, 'Chi-square statistic', statData.chiSquare24Hour.statistic.toFixed(4));
  addSimpleRow(extendedWaitsTable, 'p-value', `< ${statData.chiSquare24Hour.pValue}`);
  addSimpleRow(extendedWaitsTable, 'Odds ratio', statData.chiSquare24Hour.oddsRatio.toFixed(2));
  addSimpleRow(extendedWaitsTable, '95% CI for odds ratio', `[${statData.chiSquare24Hour.ci95[0]}, ${statData.chiSquare24Hour.ci95[1]}]`);
  addSimpleRow(extendedWaitsTable, 'Proportion exceeding 24h 2024', `${twentyFourHourData.exceeding2024.percent}%`);
  addSimpleRow(extendedWaitsTable, 'Proportion exceeding 24h 2025', `${twentyFourHourData.exceeding2025.percent}%`);
}

function addSimpleRow(table, label, value) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="fw-bold">${label}</td>
    <td>${value}</td>
  `;
  table.appendChild(row);
}

function setGlobalObservations(observations) {
  const globalObservationsList = document.getElementById('globalObservationsList');
  
  observations.forEach(obs => {
    const li = document.createElement('li');
    li.textContent = obs;
    globalObservationsList.appendChild(li);
  });
}
