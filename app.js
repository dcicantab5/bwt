// Bed Waiting Time Visualization App using React, JSX and Recharts
// This file is processed by Babel for JSX transformation

// Wait for document to fully load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing application');
  
  // Check if libraries are available
  const reactAvailable = typeof React !== 'undefined';
  const reactDomAvailable = typeof ReactDOM !== 'undefined';
  const rechartsAvailable = typeof Recharts !== 'undefined';
  
  console.log('Library status:', {
    reactAvailable,
    reactDomAvailable,
    rechartsAvailable
  });
  
  // Only proceed if libraries are available
  if (reactAvailable && reactDomAvailable && rechartsAvailable) {
    try {
      // Attempt to render the app
      renderApp();
    } catch (error) {
      console.error('Error rendering app:', error);
      document.getElementById('app').innerHTML = `
        <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 class="font-bold">Error loading visualization</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  } else {
    // Display error if libraries are missing
    document.getElementById('app').innerHTML = `
      <div class="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <h3 class="font-bold">Could not load required libraries</h3>
        <p>Some required libraries are missing. Please check your internet connection or try a different browser.</p>
      </div>
    `;
  }
});

// Function to render the React application
function renderApp() {
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
    
    // Load the data
    useEffect(() => {
      // Fetch data from data.json
      fetch('./data.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(jsonData => {
          console.log("Data loaded successfully");
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
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "percent2024") return [`${value}%`, "Feb 2024"];
                    if (name === "percent2025") return [`${value}%`, "Feb 2025"];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="percent2024" name="Feb 2024" fill="#8884d8" />
                <Bar dataKey="percent2025" name="Feb 2025" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">Waiting Time Distribution (Number of Cases)</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.histogramData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bin" />
                  <YAxis label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count2024" name="Feb 2024" fill="#8884d8" />
                  <Bar dataKey="count2025" name="Feb 2025" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    };
    
    // Density Plot Tab
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
                  domain={[0, 5000]}
                  tickFormatter={(value) => `${Math.round(value/60)}h`}
                />
                <YAxis label={{ value: 'Density', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [value.toFixed(2), name]}
                  labelFormatter={(value) => `${Math.floor(value/60)}h ${value%60}m`}
                />
                <Legend />
                <Line type="monotone" dataKey="density2024" name="Feb 2024" stroke="#8884d8" dot={false} />
                <Line type="monotone" dataKey="density2025" name="Feb 2025" stroke="#82ca9d" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    };
    
    // Box Plot Tab
    const renderBoxPlot = () => {
      if (!data || !data.boxPlotData) return null;
      
      return (
        <div className="w-full p-4">
          <h3 className="text-lg font-medium mb-2">Box Plot Comparison</h3>
          <div className="flex flex-wrap">
            {data.boxPlotData.map((item, index) => (
              <div key={index} className="w-full md:w-1/2 p-4">
                <h4 className="text-center mb-2 font-medium">February {item.year}</h4>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Min: {item.min}</span>
                    <span>Q1: {item.q1}</span>
                    <span>Median: {item.median}</span>
                    <span>Q3: {item.q3}</span>
                    <span>Max: {Math.min(item.max, 5000)}</span>
                  </div>
                  <div className="h-20 relative">
                    <div className="absolute top-8 left-0 right-0 h-4 bg-gray-300" />
                    
                    {/* Min line */}
                    <div className="absolute top-4 bg-gray-700 w-1 h-12" style={{ 
                      left: `${(item.min / 5000) * 100}%` 
                    }} />
                    
                    {/* Box for Q1 to Q3 */}
                    <div className="absolute top-6 h-8 bg-blue-500" style={{ 
                      left: `${(item.q1 / 5000) * 100}%`,
                      width: `${((item.q3 - item.q1) / 5000) * 100}%`
                    }} />
                    
                    {/* Median line */}
                    <div className="absolute top-4 bg-white w-1 h-12 z-10" style={{ 
                      left: `${(item.median / 5000) * 100}%` 
                    }} />
                    
                    {/* Mean marker (circle) */}
                    <div className="absolute top-8 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full z-20" style={{ 
                      left: `${(item.mean / 5000) * 100}%` 
                    }} />
                    
                    {/* Max line (capped at 5000 for display) */}
                    <div className="absolute top-4 bg-gray-700 w-1 h-12" style={{ 
                      left: `${(Math.min(item.max, 5000) / 5000) * 100}%` 
                    }} />
                    
                    {/* Line from min to Q1 */}
                    <div className="absolute top-10 h-0.5 bg-gray-700" style={{ 
                      left: `${(item.min / 5000) * 100}%`,
                      width: `${((item.q1 - item.min) / 5000) * 100}%`
                    }} />
                    
                    {/* Line from Q3 to max */}
                    <div className="absolute top-10 h-0.5 bg-gray-700" style={{ 
                      left: `${(item.q3 / 5000) * 100}%`,
                      width: `${((Math.min(item.max, 5000) - item.q3) / 5000) * 100}%`
                    }} />
                  </div>
                  <div className="mt-2 text-center text-sm">
                    <span className="inline-flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span>
                      Mean: {item.mean.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Key Statistics Comparison</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border">Statistic</th>
                    <th className="py-2 px-4 border">Feb 2024</th>
                    <th className="py-2 px-4 border">Feb 2025</th>
                    <th className="py-2 px-4 border">Change</th>
                    <th className="py-2 px-4 border">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {data.boxPlotData.length === 2 && (
                    <>
                      <tr>
                        <td className="py-2 px-4 border font-medium">Median</td>
                        <td className="py-2 px-4 border">{data.boxPlotData[0].median}</td>
                        <td className="py-2 px-4 border">{data.boxPlotData[1].median}</td>
                        <td className="py-2 px-4 border">{data.boxPlotData[1].median - data.boxPlotData[0].median}</td>
                        <td className="py-2 px-4 border">{((data.boxPlotData[1].median - data.boxPlotData[0].median) / data.boxPlotData[0].median * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border font-medium">Mean</td>
                        <td className="py-2 px-4 border">{data.boxPlotData[0].mean.toFixed(1)}</td>
                        <td className="py-2 px-4 border">{data.boxPlotData[1].mean.toFixed(1)}</td>
                        <td className="py-2 px-4 border">{(data.boxPlotData[1].mean - data.boxPlotData[0].mean).toFixed(1)}</td>
                        <td className="py-2 px-4 border">{((data.boxPlotData[1].mean - data.boxPlotData[0].mean) / data.boxPlotData[0].mean * 100).toFixed(1)}%</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };
    
    // Ward Comparison Tab
    const renderWardComparison = () => {
      if (!data || !data.wardData) return null;
      
      // Create data for bar chart comparison
      const prepareWardData = () => {
        return Object.keys(data.wardData).map(ward => {
          const wardInfo = data.wardData[ward];
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
      };
      
      const wardChartData = prepareWardData();
      
      return (
        <div className="w-full p-4">
          <h3 className="text-lg font-medium mb-2">Ward-Specific Comparison</h3>
          <div className="mb-8">
            <h4 className="text-md mb-2">Mean Waiting Time by Ward</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={wardChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ward" />
                  <YAxis label={{ value: 'Mean Duration (minutes)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mean2024" name="Feb 2024" fill="#8884d8" />
                  <Bar dataKey="mean2025" name="Feb 2025" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mb-8">
            <h4 className="text-md mb-2">Median Waiting Time by Ward</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={wardChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ward" />
                  <YAxis label={{ value: 'Median Duration (minutes)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="median2024" name="Feb 2024" fill="#8884d8" />
                  <Bar dataKey="median2025" name="Feb 2025" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    };
    
    // Statistical Analysis Tab
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
            
            <p className="mb-4">These findings demonstrate a clear and statistically significant deterioration in bed waiting times between February 2024 and February 2025.</p>
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
            className={`px-4 py-2 ${selectedTab === 'boxplot' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => {setSelectedTab('boxplot'); setShowStatisticalAnalysis(false);}}
          >
            Box Plot
          </button>
          <button 
            className={`px-4 py-2 ${selectedTab === 'wards' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => {setSelectedTab('wards'); setShowStatisticalAnalysis(false);}}
          >
            By Ward
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
        {!showStatisticalAnalysis && selectedTab === 'boxplot' && renderBoxPlot()}
        {!showStatisticalAnalysis && selectedTab === 'wards' && renderWardComparison()}
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
  
  // Render the React app
  ReactDOM.render(
    <App />,
    document.getElementById('app')
  );
}
