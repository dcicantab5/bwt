// Extract React hooks and components from global variables
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// Extract Recharts components from global variable
const {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} = Recharts;

// Main application component
const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('histogram');
  const [showStatisticalAnalysis, setShowStatisticalAnalysis] = useState(false);

  // Load data on component mount
  useEffect(() => {
    // Check if data is loaded every 100ms
    const checkDataInterval = setInterval(() => {
      if (window.visualizationData) {
        setData(window.visualizationData);
        setLoading(false);
        clearInterval(checkDataInterval);
      }
    }, 100);

    // Set a timeout to stop checking after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkDataInterval);
      if (!window.visualizationData) {
        setError("Timeout loading data. Please refresh the page.");
        setLoading(false);
      }
    }, 10000);

    // Clean up on unmount
    return () => {
      clearInterval(checkDataInterval);
      clearTimeout(timeout);
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Visualization...</h1>
        <div className="spinner"></div>
      </div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl text-red-600 font-bold mb-4">Error</h1>
        <p>{error || "Failed to load visualization data"}</p>
        <button 
          onClick={() => location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Render the Histogram tab
  const renderHistogram = () => {
    const { histogramData } = data;
    
    return (
      <div className="w-full p-4">
        <h3 className="text-lg font-medium mb-2">Waiting Time Distribution (% of Cases)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={histogramData}
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
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Waiting Time Distribution (Number of Cases)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={histogramData}
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
    );
  };

  // Render the Density Plot tab
  const renderDensityPlot = () => {
    const { densityData } = data;
    
    return (
      <div className="w-full p-4">
        <h3 className="text-lg font-medium mb-2">Density Distribution of Waiting Times</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={densityData}
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
    );
  };

  // Render the Box Plot tab
  const renderBoxPlot = () => {
    const { boxPlotData } = data;
    
    return (
      <div className="w-full p-4">
        <h3 className="text-lg font-medium mb-2">Box Plot Comparison</h3>
        <div className="flex flex-wrap">
          {boxPlotData.map((item, index) => (
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
                {boxPlotData.length === 2 && (
                  <>
                    <tr>
                      <td className="py-2 px-4 border font-medium">Median</td>
                      <td className="py-2 px-4 border">{boxPlotData[0].median}</td>
                      <td className="py-2 px-4 border">{boxPlotData[1].median}</td>
                      <td className="py-2 px-4 border">{boxPlotData[1].median - boxPlotData[0].median}</td>
                      <td className="py-2 px-4 border">{((boxPlotData[1].median - boxPlotData[0].median) / boxPlotData[0].median * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border font-medium">Mean</td>
                      <td className="py-2 px-4 border">{boxPlotData[0].mean.toFixed(1)}</td>
                      <td className="py-2 px-4 border">{boxPlotData[1].mean.toFixed(1)}</td>
                      <td className="py-2 px-4 border">{(boxPlotData[1].mean - boxPlotData[0].mean).toFixed(1)}</td>
                      <td className="py-2 px-4 border">{((boxPlotData[1].mean - boxPlotData[0].mean) / boxPlotData[0].mean * 100).toFixed(1)}%</td>
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

  // Render the Ward Comparison tab
  const renderWardComparison = () => {
    const { wardData } = data;
    
    return (
      <div className="w-full p-4">
        <h3 className="text-lg font-medium mb-2">Ward-Specific Comparison</h3>
        <div className="mb-8">
          <h4 className="text-md mb-2">Mean Waiting Time by Ward</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={wardData}
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
    );
  };

  // Function to render the Statistical Analysis tab
  const renderStatisticalAnalysis = () => {
    const { statisticalAnalysis } = data;
    
    return (
      <div className="w-full p-4 overflow-auto">
        <div className="prose max-w-none">
          <h1 className="text-2xl font-bold mb-4">Statistical Analysis of Waiting Time Differences</h1>
          <h2 className="text-xl font-semibold mb-3">February 2024 vs February 2025</h2>
          
          {/* Statistical content from data.json rendered as HTML */}
          <div dangerouslySetInnerHTML={{ __html: statisticalAnalysis.html }} />
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h1 className="text-2xl font-bold mb-2 text-center">Hospital Bed Waiting Time Analysis</h1>
        <h2 className="text-xl mb-6 text-center text-gray-600">February 2024 vs February 2025</h2>
        
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
            <li>The proportion of patients with waits under 240 minutes (4 hours) decreased dramatically from approximately 45.49% in 2024 to only 19.01% in 2025.</li>
            <li>The proportion of patients with waits under 360 minutes (6 hours) decreased from approximately 61.15% in 2024 to only 30.99% in 2025.</li>
            <li>Median waiting times more than doubled from 270 minutes in 2024 to 764 minutes in 2025.</li>
            <li>The percentage of very long waits (over 24 hours/1440 minutes) increased from approximately 4.39% in 2024 to over 24.62% in 2025.</li>
            <li>All wards showed substantial increases in mean waiting times, with waiting times in wards W6A and W6B more than tripling.</li>
          </ul>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm pb-8">
        <p>Data visualization of hospital bed waiting times.</p>
        <p className="mt-2">© 2025 Hospital Analytics Team</p>
      </footer>
    </div>
  );
};

// Render the App component once DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement);
  root.render(<App />);
});

