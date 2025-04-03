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
  // Set metadata and update footer
  displayMetadata(data.metadata);
  
  // Initialize Overview Tab
  initializeOverviewTab(data);
  
  // Initialize Histogram Tab
  initializeHistogramTab(data.statistics.histogram);
  
  // Initialize Wards Tab
  initializeWardsTab(data.statistics.byWard, data.summary);
  
  // Initialize Threshold Tab
  initializeThresholdTab(data.statistics.thresholds);
  
  // Initialize Findings Tab
  initializeFindingsTab(data.qualityImprovement);
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

function initializeOverviewTab(data) {
  // Set key metrics in overview tab
  document.getElementById('median2024').textContent = data.statistics.overall.stats2024.median;
  document.getElementById('median2025').textContent = data.statistics.overall.stats2025.median;
  document.getElementById('count2024').textContent = data.summary.totalPatients2024;
  document.getElementById('count2025').textContent = data.summary.totalPatients2025;
  
  document.getElementById('medianChange').textContent = '+' + data.statistics.overall.comparison.medianChange;
  document.getElementById('meanChange').textContent = '+' + data.statistics.overall.comparison.meanChange.toFixed(1);
  
  // Get the 4-hour and 24-hour threshold data
  const fourHourThreshold = data.statistics.thresholds.find(t => t.threshold === '4 hours');
  document.getElementById('fourHourChange').textContent = fourHourThreshold.percentagePointChange + '%';
  
  const twentyFourHourThreshold = data.statistics.thresholds.find(t => t.threshold === '24 hours');
  document.getElementById('twentyFourHourChange').textContent = '+' + Math.abs(twentyFourHourThreshold.percentagePointChange) + '%';
  
  // Create summary statistics table
  const statsTable = document.getElementById('statsTable');
  const stats2024 = data.statistics.overall.stats2024;
  const stats2025 = data.statistics.overall.stats2025;
  
  // Add rows to the table
  addStatRow(statsTable, 'Median (minutes)', stats2024.median, stats2025.median);
  addStatRow(statsTable, 'Mean (minutes)', stats2024.mean.toFixed(1), stats2025.mean.toFixed(1));
  addStatRow(statsTable, 'Q1 - 25th percentile', stats2024.q1, stats2025.q1);
  addStatRow(statsTable, 'Q3 - 75th percentile', stats2024.q3, stats2025.q3);
  addStatRow(statsTable, 'IQR', stats2024.iqr, stats2025.iqr);
  addStatRow(statsTable, 'Standard Deviation', stats2024.stdDev.toFixed(1), stats2025.stdDev.toFixed(1));
  addStatRow(statsTable, 'Minimum', stats2024.min, stats2025.min);
  addStatRow(statsTable, 'Maximum', stats2024.max, stats2025.max);
  
  // Create summary charts
  createSummaryDoughnutChart('summary2024Chart', data.summary.wardCounts2024, '2024');
  createSummaryDoughnutChart('summary2025Chart', data.summary.wardCounts2025, '2025');
  
  // Create patient distribution charts
  createPatientDistributionChart('patientDistribution2024Chart', data.summary.wardCounts2024, '2024');
  createPatientDistributionChart('patientDistribution2025Chart', data.summary.wardCounts2025, '2025');
}

function addStatRow(table, label, value2024, value2025) {
  const row = document.createElement('tr');
  const change = value2025 - value2024;
  const percentChange = (value2024 != 0) ? ((change / value2024) * 100).toFixed(1) : 'N/A';
  
  row.innerHTML = `
    <td>${label}</td>
    <td>${value2024}</td>
    <td>${value2025}</td>
    <td>${change > 0 ? '+' : ''}${change}</td>
    <td>${percentChange != 'N/A' ? (percentChange > 0 ? '+' : '') + percentChange + '%' : 'N/A'}</td>
  `;
  
  table.appendChild(row);
}

function createSummaryDoughnutChart(canvasId, wardCounts, year) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Define colors for each ward
  const colors = {
    W6A: 'rgba(54, 162, 235, 0.8)',
    W6B: 'rgba(75, 192, 192, 0.8)',
    W6C: 'rgba(255, 206, 86, 0.8)',
    W6D: 'rgba(255, 99, 132, 0.8)'
  };
  
  // Calculate total for percentages
  const total = Object.values(wardCounts).reduce((sum, count) => sum + count, 0);
  
  // Prepare data
  const labels = Object.keys(wardCounts);
  const data = Object.values(wardCounts);
  const percentages = data.map(count => ((count / total) * 100).toFixed(1));
  
  // Create chart
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.map((ward, i) => `${ward}: ${percentages[i]}%`),
      datasets: [{
        data: data,
        backgroundColor: labels.map(ward => colors[ward]),
        borderColor: 'white',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: `Patient Distribution ${year}`,
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label.split(':')[0]}: ${value} patients (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function createPatientDistributionChart(canvasId, wardCounts, year) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Define colors for each ward
  const colors = {
    W6A: 'rgba(54, 162, 235, 0.8)',
    W6B: 'rgba(75, 192, 192, 0.8)',
    W6C: 'rgba(255, 206, 86, 0.8)',
    W6D: 'rgba(255, 99, 132, 0.8)'
  };
  
  // Prepare data
  const labels = Object.keys(wardCounts);
  const data = Object.values(wardCounts);
  
  // Create chart
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Patients ${year}`,
        data: data,
        backgroundColor: labels.map(ward => colors[ward]),
        borderColor: labels.map(ward => colors[ward].replace('0.8', '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: `Patient Count by Ward ${year}`,
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Patients'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Ward'
          }
        }
      }
    }
  });
}

function initializeHistogramTab(histogramData) {
  // Create histogram chart for percentages
  createHistogramChart('histogramPercentChart', histogramData, 'percent');
  
  // Create histogram chart for counts
  createHistogramChart('histogramCountChart', histogramData, 'count');
  
  // Create histogram data table
  const histogramTable = document.getElementById('histogramTable');
  
  histogramData.forEach(bin => {
    const row = document.createElement('tr');
    const percentChange = bin.percent2025 - bin.percent2024;
    
    row.innerHTML = `
      <td>${bin.bin}</td>
      <td>${bin.count2024}</td>
      <td>${bin.percent2024}%</td>
      <td>${bin.count2025}</td>
      <td>${bin.percent2025}%</td>
      <td class="${percentChange > 0 ? 'text-success' : 'text-danger'}">${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%</td>
    `;
    
    histogramTable.appendChild(row);
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
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Feb 2025',
          data: data2025,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.raw;
              return `${label}: ${value}${type === 'percent' ? '%' : ''}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: type === 'percent' ? 'Percentage of Cases (%)' : 'Number of Cases'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Waiting Time Range'
          }
        }
      }
    }
  });
}

function initializeWardsTab(wardData, summaryData) {
  // Create ward comparison charts
  createWardComparisonChart('wardMedianChart', wardData, 'median', 'Median Waiting Time by Ward');
  createWardComparisonChart('wardMeanChart', wardData, 'mean', 'Mean Waiting Time by Ward');
  
  // Create ward statistics table
  const wardStatsTable = document.getElementById('wardStatsTable');
  const wards = Object.keys(wardData);
  
  wards.forEach(ward => {
    const medianChange = wardData[ward].stats2025.median - wardData[ward].stats2024.median;
    const percentChange = ((medianChange / wardData[ward].stats2024.median) * 100).toFixed(1);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${ward}</td>
      <td>${wardData[ward].count2024}</td>
      <td>${wardData[ward].count2025}</td>
      <td>${wardData[ward].stats2024.median}</td>
      <td>${wardData[ward].stats2025.median}</td>
      <td class="${medianChange > 0 ? 'text-danger' : 'text-success'}">${medianChange > 0 ? '+' : ''}${percentChange}%</td>
    `;
    
    wardStatsTable.appendChild(row);
  });
  
  // Create ward observations
  const wardObservations = document.getElementById('wardObservations');
  
  // Find ward with largest increase
  let maxIncreaseWard = wards[0];
  let maxIncreasePercent = 0;
  
  wards.forEach(ward => {
    const medianChange = wardData[ward].stats2025.median - wardData[ward].stats2024.median;
    const percentChange = (medianChange / wardData[ward].stats2024.median) * 100;
    
    if (percentChange > maxIncreasePercent) {
      maxIncreasePercent = percentChange;
      maxIncreaseWard = ward;
    }
  });
  
  // Find ward with smallest increase or decrease
  let minChangeWard = wards[0];
  let minChangePercent = (wardData[wards[0]].stats2025.median - wardData[wards[0]].stats2024.median) / wardData[wards[0]].stats2024.median * 100;
  
  wards.forEach(ward => {
    const medianChange = wardData[ward].stats2025.median - wardData[ward].stats2024.median;
    const percentChange = (medianChange / wardData[ward].stats2024.median) * 100;
    
    if (Math.abs(percentChange) < Math.abs(minChangePercent)) {
      minChangePercent = percentChange;
      minChangeWard = ward;
    }
  });
  
  // Add observations
  addObservation(wardObservations, `Ward ${maxIncreaseWard} shows the largest increase in median waiting time (${maxIncreasePercent.toFixed(1)}%).`);
  
  if (minChangePercent < 0) {
    addObservation(wardObservations, `Ward ${minChangeWard} is the only ward showing a decrease in median waiting time (${minChangePercent.toFixed(1)}%).`);
  } else {
    addObservation(wardObservations, `Ward ${minChangeWard} shows the smallest increase in median waiting time (${minChangePercent.toFixed(1)}%).`);
  }
  
  // Add additional observations
  addObservation(wardObservations, `In 2024, the highest median wait was in Ward W6D (${wardData.W6D.stats2024.median} minutes).`);
  addObservation(wardObservations, `In 2025, the highest median wait is in Ward W6A (${wardData.W6A.stats2025.median} minutes).`);
  
  // Add note about patient distribution changes
  const w6dChangePercent = ((wardData.W6D.count2025 - wardData.W6D.count2024) / wardData.W6D.count2024 * 100).toFixed(0);
  addObservation(wardObservations, `Ward W6D saw a significant increase in patient volume (${w6dChangePercent}% more patients in 2025).`);
}

function addObservation(element, text) {
  const observation = document.createElement('li');
  observation.textContent = text;
  element.appendChild(observation);
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
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Feb 2025',
          data: data2025,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutes'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Ward'
          }
        }
      }
    }
  });
}

function initializeThresholdTab(thresholdData) {
  // Create threshold compliance chart
  createThresholdChart('thresholdComplianceChart', thresholdData);
  
  // Create threshold table
  const thresholdTable = document.getElementById('thresholdTable');
  
  thresholdData.forEach(threshold => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${threshold.threshold} (${threshold.minutes} min)</td>
      <td>${threshold.within2024.percent}%</td>
      <td>${threshold.within2025.percent}%</td>
      <td class="text-danger">${threshold.percentagePointChange}%</td>
      <td>${threshold.exceeding2024.percent}%</td>
      <td>${threshold.exceeding2025.percent}%</td>
    `;
    
    thresholdTable.appendChild(row);
  });
}

function createThresholdChart(canvasId, thresholdData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Prepare data
  const labels = thresholdData.map(t => t.threshold);
  const within2024 = thresholdData.map(t => t.within2024.percent);
  const within2025 = thresholdData.map(t => t.within2025.percent);
  
  // Create chart
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '% Within Standard (2024)',
          data: within2024,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: '% Within Standard (2025)',
          data: within2025,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Percentage within Standard (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time Standard'
          }
        }
      }
    }
  });
}

function initializeFindingsTab(qualityImprovement) {
  // Populate key findings
  const keyFindings = document.getElementById('keyFindings');
  qualityImprovement.keyFindings.forEach(finding => {
    const li = document.createElement('li');
    li.textContent = finding;
    keyFindings.appendChild(li);
  });
  
  // Populate recommendations
  const recommendations = document.getElementById('recommendations');
  qualityImprovement.recommendations.forEach(recommendation => {
    const li = document.createElement('li');
    li.textContent = recommendation;
    recommendations.appendChild(li);
  });
}
