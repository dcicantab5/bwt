// Bed Waiting Time Visualization App using React.createElement
// No build step required - written in vanilla JavaScript

// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  
  console.log('DOM loaded, initializing app');
  
  // Check if required libraries and data are available
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined' || typeof Recharts === 'undefined') {
    console.error('Required libraries not loaded');
    document.getElementById('app').innerHTML = '<div class="p-4 text-red-600">Error: Required libraries not loaded.</div>';
    return;
  }
  
  if (typeof waitingTimeData === 'undefined') {
    console.error('Data not loaded');
    document.getElementById('app').innerHTML = '<div class="p-4 text-red-600">Error: Data not loaded.</div>';
    return;
  }
  
  // Get React hooks
  const useState = React.useState;
  const useEffect = React.useEffect;
  
  // Get Recharts components
  const {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
  } = Recharts;
  
  // Main app component
  function App() {
    // State variables
    const [selectedTab, setSelectedTab] = useState('histogram');
    const [showStatisticalAnalysis, setShowStatisticalAnalysis] = useState(false);
    
    // Tab selection handler
    function handleTabClick(tab) {
      setSelectedTab(tab);
      setShowStatisticalAnalysis(false);
    }
    
    // Helper function to create the page header
    function createHeader() {
      return React.createElement('h2', { 
        className: 'text-xl font-bold mb-6 text-center' 
      }, 'Bed Waiting Time Distribution: February 2024 vs 2025');
    }
    
    // Helper function to create the tab navigation
    function createTabNav() {
      return React.createElement('div', { 
        className: 'flex flex-wrap border-b mb-4' 
      }, [
        // Histogram tab
        React.createElement('button', {
          key: 'histogram-tab',
          className: `px-4 py-2 ${selectedTab === 'histogram' ? 'border-b-2 border-blue-500 font-medium' : ''}`,
          onClick: () => handleTabClick('histogram')
        }, 'Histogram'),
        
        // Density plot tab
        React.createElement('button', {
          key: 'density-tab',
          className: `px-4 py-2 ${selectedTab === 'density' ? 'border-b-2 border-blue-500 font-medium' : ''}`,
          onClick: () => handleTabClick('density')
        }, 'Density Plot'),
        
        // Box plot tab
        React.createElement('button', {
          key: 'boxplot-tab',
          className: `px-4 py-2 ${selectedTab === 'boxplot' ? 'border-b-2 border-blue-500 font-medium' : ''}`,
          onClick: () => handleTabClick('boxplot')
        }, 'Box Plot'),
        
        // Ward comparison tab
        React.createElement('button', {
          key: 'wards-tab',
          className: `px-4 py-2 ${selectedTab === 'wards' ? 'border-b-2 border-blue-500 font-medium' : ''}`,
          onClick: () => handleTabClick('wards')
        }, 'By Ward'),
        
        // Statistical analysis tab
        React.createElement('button', {
          key: 'stats-tab',
          className: `px-4 py-2 ${showStatisticalAnalysis ? 'border-b-2 border-blue-500 font-medium' : ''}`,
          onClick: () => setShowStatisticalAnalysis(true)
        }, 'Statistical Analysis')
      ]);
    }
    
    // Helper function to create the key observations section
    function createKeyObservations() {
      return React.createElement('div', {
        className: 'mt-6 bg-gray-50 p-4 rounded border'
      }, [
        React.createElement('h3', {
          key: 'observations-title',
          className: 'font-medium mb-2'
        }, 'Key Observations:'),
        
        React.createElement('ul', {
          key: 'observations-list',
          className: 'list-disc pl-5 space-y-1'
        }, waitingTimeData.insights.slice(0, 5).map((insight, index) => 
          React.createElement('li', { key: `insight-${index}` }, insight)
        ))
      ]);
    }
    
    // Helper function to create the footer
    function createFooter() {
      return React.createElement('footer', {
        className: 'mt-8 text-center text-gray-500 text-sm'
      }, [
        React.createElement('p', { key: 'footer-updated' }, 
          `Data updated: ${waitingTimeData.metadata.dataUpdated}`
        ),
        React.createElement('p', { key: 'footer-count', className: 'mt-1' }, 
          `Total cases analyzed: 2024 (${waitingTimeData.metadata.totalCases2024}) | 2025 (${waitingTimeData.metadata.totalCases2025})`
        )
      ]);
    }
    
    // Helper function to render the histogram tab
    function renderHistogram() {
      // Percentage histogram
      const percentHistogram = React.createElement('div', { className: 'w-full p-4' }, [
        React.createElement('h3', { 
          key: 'percent-title', 
          className: 'text-lg font-medium mb-2' 
        }, 'Waiting Time Distribution (% of Cases)'),
        
        React.createElement('div', { key: 'percent-chart', className: 'h-96' },
          React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
            React.createElement(BarChart, { 
              data: waitingTimeData.histogramData,
              margin: { top: 20, right: 30, left: 20, bottom: 5 }
            }, [
              React.createElement(CartesianGrid, { key: 'grid', strokeDasharray: '3 3' }),
              React.createElement(XAxis, { key: 'x-axis', dataKey: 'bin' }),
              React.createElement(YAxis, { 
                key: 'y-axis',
                label: { value: 'Percentage of Cases (%)', angle: -90, position: 'insideLeft' }
              }),
              React.createElement(Tooltip, { 
                key: 'tooltip',
                formatter: (value, name) => {
                  if (name === "percent2024") return [`${value}%`, "Feb 2024"];
                  if (name === "percent2025") return [`${value}%`, "Feb 2025"];
                  return [value, name];
                }
              }),
              React.createElement(Legend, { key: 'legend' }),
              React.createElement(Bar, { 
                key: 'bar-2024',
                dataKey: 'percent2024', 
                name: 'Feb 2024', 
                fill: '#8884d8' 
              }),
              React.createElement(Bar, { 
                key: 'bar-2025',
                dataKey: 'percent2025', 
                name: 'Feb 2025', 
                fill: '#82ca9d' 
              })
            ])
          )
        ),
        
        // Count histogram
        React.createElement('div', { key: 'count-section', className: 'mt-8' }, [
          React.createElement('h3', { 
            key: 'count-title', 
            className: 'text-lg font-medium mb-2' 
          }, 'Waiting Time Distribution (Number of Cases)'),
          
          React.createElement('div', { key: 'count-chart', className: 'h-96' },
            React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
              React.createElement(BarChart, { 
                data: waitingTimeData.histogramData,
                margin: { top: 20, right: 30, left: 20, bottom: 5 }
              }, [
                React.createElement(CartesianGrid, { key: 'grid', strokeDasharray: '3 3' }),
                React.createElement(XAxis, { key: 'x-axis', dataKey: 'bin' }),
                React.createElement(YAxis, { 
                  key: 'y-axis',
                  label: { value: 'Number of Cases', angle: -90, position: 'insideLeft' }
                }),
                React.createElement(Tooltip, { key: 'tooltip' }),
                React.createElement(Legend, { key: 'legend' }),
                React.createElement(Bar, { 
                  key: 'bar-2024',
                  dataKey: 'count2024', 
                  name: 'Feb 2024', 
                  fill: '#8884d8' 
                }),
                React.createElement(Bar, { 
                  key: 'bar-2025',
                  dataKey: 'count2025', 
                  name: 'Feb 2025', 
                  fill: '#82ca9d' 
                })
              ])
            )
          )
        ])
      ]);
      
      return percentHistogram;
    }
    
    // Helper function to render the density plot tab
    function renderDensityPlot() {
      return React.createElement('div', { className: 'w-full p-4' }, [
        React.createElement('h3', { 
          key: 'density-title', 
          className: 'text-lg font-medium mb-2' 
        }, 'Density Distribution of Waiting Times'),
        
        React.createElement('div', { key: 'density-chart', className: 'h-96' },
          React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
            React.createElement(LineChart, { 
              data: waitingTimeData.densityData,
              margin: { top: 20, right: 30, left: 20, bottom: 5 }
            }, [
              React.createElement(CartesianGrid, { key: 'grid', strokeDasharray: '3 3' }),
              React.createElement(XAxis, { 
                key: 'x-axis', 
                dataKey: 'duration',
                domain: [0, 5000],
                tickFormatter: (value) => `${Math.round(value/60)}h`,
                label: { value: 'Duration (minutes)', position: 'insideBottom', offset: -5 }
              }),
              React.createElement(YAxis, { 
                key: 'y-axis',
                label: { value: 'Density', angle: -90, position: 'insideLeft' }
              }),
              React.createElement(Tooltip, { 
                key: 'tooltip',
                formatter: (value, name) => [value.toFixed(2), name],
                labelFormatter: (value) => `${Math.floor(value/60)}h ${value%60}m`
              }),
              React.createElement(Legend, { key: 'legend' }),
              React.createElement(Line, { 
                key: 'line-2024',
                type: 'monotone',
                dataKey: 'density2024', 
                name: 'Feb 2024', 
                stroke: '#8884d8',
                dot: false
              }),
              React.createElement(Line, { 
                key: 'line-2025',
                type: 'monotone',
                dataKey: 'density2025', 
                name: 'Feb 2025', 
                stroke: '#82ca9d',
                dot: false
              })
            ])
          )
        )
      ]);
    }
    
    // Helper function to render the box plot tab
    function renderBoxPlot() {
      // Create box plot visualizations for each year
      const boxPlots = waitingTimeData.boxPlotData.map((item, index) => {
        return React.createElement('div', { 
          key: `boxplot-${index}`,
          className: 'w-full md:w-1/2 p-4'
        }, [
          React.createElement('h4', { 
            key: 'year-title',
            className: 'text-center mb-2 font-medium'
          }, `February ${item.year}`),
          
          React.createElement('div', { 
            key: 'box-container',
            className: 'bg-gray-100 p-4 rounded-lg'
          }, [
            // Stats display
            React.createElement('div', { 
              key: 'stats-display',
              className: 'flex justify-between text-sm text-gray-600 mb-1'
            }, [
              React.createElement('span', { key: 'min' }, `Min: ${item.min}`),
              React.createElement('span', { key: 'q1' }, `Q1: ${item.q1}`),
              React.createElement('span', { key: 'median' }, `Median: ${item.median}`),
              React.createElement('span', { key: 'q3' }, `Q3: ${item.q3}`),
              React.createElement('span', { key: 'max' }, `Max: ${Math.min(item.max, 5000)}`)
            ]),
            
            // Box plot visualization
            React.createElement('div', { 
              key: 'boxplot-viz',
              className: 'h-20 relative'
            }, [
              // Base line
              React.createElement('div', { 
                key: 'base-line',
                className: 'absolute top-8 left-0 right-0 h-4 bg-gray-300'
              }),
              
              // Min line
              React.createElement('div', { 
                key: 'min-line',
                className: 'absolute top-4 bg-gray-700 w-1 h-12',
                style: { left: `${(item.min / 5000) * 100}%` }
              }),
              
              // Box for Q1 to Q3
              React.createElement('div', { 
                key: 'box',
                className: 'absolute top-6 h-8 bg-blue-500',
                style: { 
                  left: `${(item.q1 / 5000) * 100}%`,
                  width: `${((item.q3 - item.q1) / 5000) * 100}%`
                }
              }),
              
              // Median line
              React.createElement('div', { 
                key: 'median-line',
                className: 'absolute top-4 bg-white w-1 h-12 z-10',
                style: { left: `${(item.median / 5000) * 100}%` }
              }),
              
              // Mean marker (circle)
              React.createElement('div', { 
                key: 'mean-marker',
                className: 'absolute top-8 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full z-20',
                style: { left: `${(item.mean / 5000) * 100}%` }
              }),
              
              // Max line
              React.createElement('div', { 
                key: 'max-line',
                className: 'absolute top-4 bg-gray-700 w-1 h-12',
                style: { left: `${(Math.min(item.max, 5000) / 5000) * 100}%` }
              }),
              
              // Line from min to Q1
              React.createElement('div', { 
                key: 'min-q1-line',
                className: 'absolute top-10 h-0.5 bg-gray-700',
                style: { 
                  left: `${(item.min / 5000) * 100}%`,
                  width: `${((item.q1 - item.min) / 5000) * 100}%`
                }
              }),
              
              // Line from Q3 to max
              React.createElement('div', { 
                key: 'q3-max-line',
                className: 'absolute top-10 h-0.5 bg-gray-700',
                style: { 
                  left: `${(item.q3 / 5000) * 100}%`,
                  width: `${((Math.min(item.max, 5000) - item.q3) / 5000) * 100}%`
                }
              })
            ]),
            
            // Mean indicator
            React.createElement('div', { 
              key: 'mean-indicator',
              className: 'mt-2 text-center text-sm'
            }, 
              React.createElement('span', { 
                className: 'inline-flex items-center'
              }, [
                React.createElement('span', { 
                  key: 'mean-dot',
                  className: 'w-3 h-3 bg-red-500 rounded-full inline-block mr-1'
                }),
                `Mean: ${item.mean.toFixed(0)}`
              ])
            )
          ])
        ]);
      });
      
      // Key statistics table
      const statsTable = React.createElement('div', { 
        key: 'stats-table',
        className: 'mt-8'
      }, [
        React.createElement('h3', { 
          key: 'table-title',
          className: 'text-lg font-medium mb-4'
        }, 'Key Statistics Comparison'),
        
        React.createElement('div', { 
          key: 'table-container',
          className: 'overflow-x-auto'
        }, 
          React.createElement('table', { 
            className: 'min-w-full bg-white border border-gray-300'
          }, [
            // Table header
            React.createElement('thead', { key: 'thead' },
              React.createElement('tr', { className: 'bg-gray-100' }, [
                React.createElement('th', { key: 'th-stat', className: 'py-2 px-4 border' }, 'Statistic'),
                React.createElement('th', { key: 'th-2024', className: 'py-2 px-4 border' }, 'Feb 2024'),
                React.createElement('th', { key: 'th-2025', className: 'py-2 px-4 border' }, 'Feb 2025'),
                React.createElement('th', { key: 'th-change', className: 'py-2 px-4 border' }, 'Change'),
                React.createElement('th', { key: 'th-pct', className: 'py-2 px-4 border' }, '% Change')
              ])
            ),
            
            // Table body
            React.createElement('tbody', { key: 'tbody' }, [
              // Median row
              React.createElement('tr', { key: 'tr-median' }, [
                React.createElement('td', { className: 'py-2 px-4 border font-medium' }, 'Median'),
                React.createElement('td', { className: 'py-2 px-4 border' }, waitingTimeData.boxPlotData[0].median),
                React.createElement('td', { className: 'py-2 px-4 border' }, waitingTimeData.boxPlotData[1].median),
                React.createElement('td', { className: 'py-2 px-4 border' }, 
                  waitingTimeData.boxPlotData[1].median - waitingTimeData.boxPlotData[0].median
                ),
                React.createElement('td', { className: 'py-2 px-4 border' }, 
                  ((waitingTimeData.boxPlotData[1].median - waitingTimeData.boxPlotData[0].median) / 
                   waitingTimeData.boxPlotData[0].median * 100).toFixed(1) + '%'
                )
              ]),
              
              // Mean row
              React.createElement('tr', { key: 'tr-mean' }, [
                React.createElement('td', { className: 'py-2 px-4 border font-medium' }, 'Mean'),
                React.createElement('td', { className: 'py-2 px-4 border' }, waitingTimeData.boxPlotData[0].mean.toFixed(1)),
                React.createElement('td', { className: 'py-2 px-4 border' }, waitingTimeData.boxPlotData[1].mean.toFixed(1)),
                React.createElement('td', { className: 'py-2 px-4 border' }, 
                  (waitingTimeData.boxPlotData[1].mean - waitingTimeData.boxPlotData[0].mean).toFixed(1)
                ),
                React.createElement('td', { className: 'py-2 px-4 border' }, 
                  ((waitingTimeData.boxPlotData[1].mean - waitingTimeData.boxPlotData[0].mean) / 
                   waitingTimeData.boxPlotData[0].mean * 100).toFixed(1) + '%'
                )
              ])
            ])
          ])
        )
      ]);
      
      return React.createElement('div', { className: 'w-full p-4' }, [
        React.createElement('h3', { 
          key: 'boxplot-title', 
          className: 'text-lg font-medium mb-2' 
        }, 'Box Plot Comparison'),
        
        React.createElement('div', { 
          key: 'boxplots-container',
          className: 'flex flex-wrap'
        }, boxPlots),
        
        statsTable
      ]);
    }
    
    // Helper function to render the ward comparison tab
    function renderWardComparison() {
      // Prepare ward data for charts
      function prepareWardData() {
        return Object.keys(waitingTimeData.wardData).map(ward => {
          const wardInfo = waitingTimeData.wardData[ward];
          return {
            ward,
            mean2024: wardInfo.stats2024 ? wardInfo.stats2024.mean : 0,
            mean2025: wardInfo.stats2025 ? wardInfo.stats2025.mean : 0,
            median2024: wardInfo.stats2024 ? wardInfo.stats2024.median : 0,
            median2025: wardInfo.stats2025 ? wardInfo.stats2025.median : 0,
            count2024: wardInfo.stats2024 ? wardInfo.stats2024.count : 0,
            count2025: wardInfo.stats2025 ? wardInfo.stats2025.count : 0
          };
        });
      }
      
      const wardChartData = prepareWardData();
      
      // Mean waiting times chart
      const meanChart = React.createElement('div', { className: 'mb-8' }, [
        React.createElement('h4', { 
          key: 'mean-title',
          className: 'text-md mb-2'
        }, 'Mean Waiting Time by Ward'),
        
        React.createElement('div', { key: 'mean-chart', className: 'h-96' },
          React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
            React.createElement(BarChart, { 
              data: wardChartData,
              margin: { top: 20, right: 30, left: 20, bottom: 5 }
            }, [
              React.createElement(CartesianGrid, { key: 'grid', strokeDasharray: '3 3' }),
              React.createElement(XAxis, { key: 'x-axis', dataKey: 'ward' }),
              React.createElement(YAxis, { 
                key: 'y-axis',
                label: { value: 'Mean Duration (minutes)', angle: -90, position: 'insideLeft' }
              }),
              React.createElement(Tooltip, { key: 'tooltip' }),
              React.createElement(Legend, { key: 'legend' }),
              React.createElement(Bar, { 
                key: 'bar-2024',
                dataKey: 'mean2024', 
                name: 'Feb 2024', 
                fill: '#8884d8' 
              }),
              React.createElement(Bar, { 
                key: 'bar-2025',
                dataKey: 'mean2025', 
                name: 'Feb 2025', 
                fill: '#82ca9d' 
              })
            ])
          )
        )
      ]);
      
      // Median waiting times chart
      const medianChart = React.createElement('div', { className: 'mb-8' }, [
        React.createElement('h4', { 
          key: 'median-title',
          className: 'text-md mb-2'
        }, 'Median Waiting Time by Ward'),
        
        React.createElement('div', { key: 'median-chart', className: 'h-96' },
          React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
            React.createElement(BarChart, { 
              data: wardChartData,
              margin: { top: 20, right: 30, left: 20, bottom: 5 }
            }, [
              React.createElement(CartesianGrid, { key: 'grid', strokeDasharray: '3 3' }),
              React.createElement(XAxis, { key: 'x-axis', dataKey: 'ward' }),
              React.createElement(YAxis, { 
                key: 'y-axis',
                label: { value: 'Median Duration (minutes)', angle: -90, position: 'insideLeft' }
              }),
              React.createElement(Tooltip, { key: 'tooltip' }),
              React.createElement(Legend, { key: 'legend' }),
              React.createElement(Bar, { 
                key: 'bar-2024',
                dataKey: 'median2024', 
                name: 'Feb 2024', 
                fill: '#8884d8' 
              }),
              React.createElement(Bar, { 
                key: 'bar-2025',
                dataKey: 'median2025', 
                name: 'Feb 2025', 
                fill: '#82ca9d' 
              })
            ])
          )
        )
      ]);
      
      return React.createElement('div', { className: 'w-full p-4' }, [
        React.createElement('h3', { 
          key: 'ward-title', 
          className: 'text-lg font-medium mb-2' 
        }, 'Ward-Specific Comparison'),
        
        meanChart,
        medianChart
      ]);
    }
    
    // Helper function to render the statistical analysis tab
    function renderStatisticalAnalysis() {
      return React.createElement('div', { className: 'w-full p-4' }, [
        React.createElement('h3', { 
          key: 'analysis-title', 
          className: 'text-xl font-bold mb-4' 
        }, 'Statistical Analysis Summary'),
        
        React.createElement('div', { 
          key: 'analysis-content',
          className: 'prose max-w-none'
        }, [
          React.createElement('p', { key: 'intro', className: 'mb-4' }, 
            'Analysis of the waiting time data reveals statistically significant differences between February 2024 and February 2025:'
          ),
          
          React.createElement('ul', { 
            key: 'insights-list',
            className: 'list-disc pl-5 space-y-2 mb-4'
          }, waitingTimeData.insights.map((insight, index) => 
            React.createElement('li', { key: `insight-${index}` }, insight)
          )),
          
          React.createElement('p', { key: 'conclusion', className: 'mb-4' }, 
            'These findings demonstrate a clear and statistically significant deterioration in bed waiting times between February 2024 and February 2025.'
          )
        ])
      ]);
    }
    
    // Render the appropriate content based on selected tab
    function renderContent() {
      if (showStatisticalAnalysis) {
        return renderStatisticalAnalysis();
      }
      
      switch(selectedTab) {
        case 'histogram':
          return renderHistogram();
        case 'density':
          return renderDensityPlot();
        case 'boxplot':
          return renderBoxPlot();
        case 'wards':
          return renderWardComparison();
        default:
          return renderHistogram();
      }
    }
    
    // Build the complete application UI
    return React.createElement('div', { 
      className: 'bg-white rounded-lg shadow p-4 max-w-6xl mx-auto'
    }, [
      createHeader(),
      createTabNav(),
      renderContent(),
      createKeyObservations(),
      createFooter()
    ]);
  }
  
  // Render the application to the DOM
  ReactDOM.render(
    React.createElement(App, null),
    document.getElementById('app')
  );
});
