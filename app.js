// Bed Waiting Time Visualization App
// Supports both React/Recharts approach and a fallback direct DOM approach

'use strict';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing visualization');
  
  // Check if libraries are available
  const reactAvailable = typeof React !== 'undefined';
  const reactDomAvailable = typeof ReactDOM !== 'undefined';
  const rechartsAvailable = typeof Recharts !== 'undefined';
  
  // Log library status
  console.log('Library status:', {
    reactAvailable,
    reactDomAvailable,
    rechartsAvailable
  });
  
  // Update debug info
  const debugInfo = document.getElementById('debug-info');
  if (debugInfo) {
    let debugHTML = '<div>Library Status:</div>';
    debugHTML += `<div>React: ${reactAvailable ? '✅' : '❌'}</div>`;
    debugHTML += `<div>ReactDOM: ${reactDomAvailable ? '✅' : '❌'}</div>`;
    debugHTML += `<div>Recharts: ${rechartsAvailable ? '✅' : '❌'}</div>`;
    debugInfo.innerHTML = debugHTML;
  }
  
  // Only proceed with React if all required libraries are available
  if (reactAvailable && reactDomAvailable && rechartsAvailable) {
    console.log('All libraries available, initializing React app');
    initializeReactApp();
  } else {
    console.warn('Required libraries not available, falling back to direct DOM');
    // The fallback visualization is handled by the script in index.html
  }
});

// Initialize the React app if libraries are available
function initializeReactApp() {
  // Destructure React hooks
  const { useState, useEffect } = React;
  
  // Get Recharts components
  const { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, LineChart, Line
  } = Recharts;

  // Main App Component
  const App = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('histogram');
    const [showStatisticalAnalysis, setShowStatisticalAnalysis] = useState(false);

    // Fetch data from data.json
    useEffect(() => {
      console.log("Fetching data...");
      
      fetch('./data.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(jsonData => {
          console.log("Data loaded successfully:", jsonData);
          setData(jsonData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setError('Failed to load data. Please try again later.');
          setLoading(false);
        });
    }, []);

    // Histogram Tab
    const renderHistogram = () => {
      if (!data || !data.histogramData) return null;

      return (
        <div className="w-full p-4">
          <h3 className="text-lg font-medium mb-2">Waiting Time Distribution (% of Cases)</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.histogramData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" />
                <YAxis label={{ value: 'Percentage of Cases (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value, name) => {
                  if (name === "percent2024") return [`${value}%`, "Feb 2024"];
                  if (name === "percent2025") return [`${value}%`, "Feb 2025"];
                  return [value, name];
                }} />
                <Legend />
                <Bar dataKey="percent2024" name="Feb 2024" fill="#8884d8" />
                <Bar dataKey="percent2025" name="Feb 2025" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    };

    // Density Plot Tab (simplified)
    const renderDensityPlot = () => {
      if (!data || !data.densityData) return null;

      return (
        <div className="w-full p-4">
          <h3 className="text-lg font-medium mb-2">Density Distribution of Waiting Times</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.densityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="duration" 
                  label={{ value: 'Duration (minutes)', position: 'insideBottom', offset: -5 }} 
                  tickFormatter={(value) => `${Math.round(value/60)}h`}
                />
                <YAxis label={{ value: 'Density', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="density2024" name="Feb 2024" stroke="#8884d8" dot={false} />
                <Line type="monotone" dataKey="density2025" name="Feb 2025" stroke="#82ca9d" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    };

    // Statistical Analysis Tab (simplified)
    const renderStatisticalAnalysis = () => {
      if (!data) return null;

      return (
        <div className="w-full p-4">
          <h3 className="text-xl font-bold mb-4">Statistical Analysis Summary</h3>
          <div className="prose max-w-none">
            <p className="mb-4">Analysis of the waiting time data reveals statistically significant differences between February 2024 and February 2025:</p>
            
            <ul className="list-disc pl-5 space-y-2 mb-4">
              {data.insights && data.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    };

    if (loading) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-4 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-center">Bed Waiting Time Distribution: February 2024 vs 2025</h2>
        
        <div className="flex flex-wrap border-b mb-4">
          <button 
            className={`px-4 py-2 ${selectedTab === 'histogram' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => {setSelectedTab('histogram'); setShowStatisticalAnalysis(false);}}
          >
            Histogram
          </button>
          <button 
            className={`px-4 py-2 ${selectedTab === 'density' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => {setSelectedTab('density'); setShowStatisticalAnalysis(false);}}
          >
            Density Plot
          </button>
          <button 
            className={`px-4 py-2 ${showStatisticalAnalysis ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setShowStatisticalAnalysis(true)}
          >
            Statistical Analysis
          </button>
        </div>
        
        {!showStatisticalAnalysis && selectedTab === 'histogram' && renderHistogram()}
        {!showStatisticalAnalysis && selectedTab === 'density' && renderDensityPlot()}
        {showStatisticalAnalysis && renderStatisticalAnalysis()}
        
        <div className="mt-6 bg-gray-50 p-4 rounded border">
          <h3 className="font-medium mb-2">Key Observations:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {data && data.insights && data.insights.slice(0, 5).map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Data updated: {data && data.metadata ? data.metadata.dataUpdated : ''}</p>
          <p className="mt-1">Total cases analyzed: 2024 ({data && data.metadata ? data.metadata.totalCases2024 : ''}) | 2025 ({data && data.metadata ? data.metadata.totalCases2025 : ''})</p>
        </footer>
      </div>
    );
  };

  // Try to render the React app
  try {
    ReactDOM.render(
      <App />,
      document.getElementById('app')
    );
    console.log('React app rendered successfully');
  } catch (error) {
    console.error('Error rendering React app:', error);
    // The fallback visualization will be handled by the script in index.html
  }
}
