import React, { useState, useEffect } from 'react';
// Use window.Recharts components for GitHub Pages
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Area, ScatterChart, Scatter } = window.Recharts;

const WaitingTimeDistributions = () => {
  const [data, setData] = useState({});
  const [histogramData, setHistogramData] = useState([]);
  const [densityData, setDensityData] = useState([]);
  const [boxPlotData, setBoxPlotData] = useState([]);
  const [wardData, setWardData] = useState({});
  const [selectedTab, setSelectedTab] = useState('histogram');
  const [showStatisticalAnalysis, setShowStatisticalAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load pre-processed data from data.json
        const response = await fetch('./data.json');
        const jsonData = await response.json();
        
        // Set the data for each visualization
        setHistogramData(jsonData.histogramData);
        setDensityData(jsonData.densityData);
        setBoxPlotData(jsonData.boxPlotData);
        setWardData(jsonData.wardData);
        setData(jsonData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderHistogram = () => {
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

  const renderDensityPlot = () => {
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

  const renderBoxPlot = () => {
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
                    <tr>
                      <td className="py-2 px-4 border font-medium">Q1 (25th percentile)</td>
                      <td className="py-2 px-4 border">{boxPlotData[0].q1}</td>
                      <td className="py-2 px-4 border">{boxPlotData[1].q1}</td>
                      <td className="py-2 px-4 border">{boxPlotData[1].q1 - boxPlotData[0].q1}</td>
                      <td className="py-2 px-4 border">{((boxPlotData[1].q1 - boxPlotData[0].q1) / boxPlotData[0].q1 * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border font-medium">Q3 (75th percentile)</td>
                      <td className="py-2 px-4 border">{boxPlotData[0].q3}</td>
                      <td className="py-2 px-4 border">{boxPlotData[1].q3}</td>
                      <td className="py-2 px-4 border">{boxPlotData[1].q3 - boxPlotData[0].q3}</td>
                      <td className="py-2 px-4 border">{((boxPlotData[1].q3 - boxPlotData[0].q3) / boxPlotData[0].q3 * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border font-medium">IQR (Q3-Q1)</td>
                      <td className="py-2 px-4 border">{boxPlotData[0].q3 - boxPlotData[0].q1}</td>
                      <td className="py-2 px-4 border">{boxPlotData[1].q3 - boxPlotData[1].q1}</td>
                      <td className="py-2 px-4 border">{(boxPlotData[1].q3 - boxPlotData[1].q1) - (boxPlotData[0].q3 - boxPlotData[0].q1)}</td>
                      <td className="py-2 px-4 border">{(((boxPlotData[1].q3 - boxPlotData[1].q1) - (boxPlotData[0].q3 - boxPlotData[0].q1)) / (boxPlotData[0].q3 - boxPlotData[0].q1) * 100).toFixed(1)}%</td>
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

  const renderWardComparison = () => {
    // Create data for bar chart comparison
    const wardChartData = Object.keys(wardData).map(ward => {
      const data = wardData[ward];
      return {
        ward,
        mean2024: data.stats2024 ? data.stats2024.mean : 0,
        mean2025: data.stats2025 ? data.stats2025.mean : 0,
        median2024: data.stats2024 ? data.stats2024.median : 0,
        median2025: data.stats2025 ? data.stats2025.median : 0,
        count2024: data.stats2024 ? data.stats2024.count : 0,
        count2025: data.stats2025 ? data.stats2025.count : 0
      };
    });
    
    return (
      <div className="w-full p-4">
        <h3 className="text-lg font-medium mb-2">Ward-Specific Comparison</h3>
        <div className="mb-8">
          <h4 className="text-md mb-2">Mean Waiting Time by Ward</h4>
          <ResponsiveContainer width="100%" height={400}>
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
        
        <div className="mb-8">
          <h4 className="text-md mb-2">Median Waiting Time by Ward</h4>
          <ResponsiveContainer width="100%" height={400}>
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
        
        <div>
          <h4 className="text-md mb-2">Number of Cases by Ward</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={wardChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ward" />
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

  const renderStatisticalAnalysis = () => {
    return (
      <div className="w-full p-4 overflow-auto">
        <div className="prose max-w-none">
          <h1 className="text-2xl font-bold mb-4">Statistical Analysis of Waiting Time Differences</h1>
          <h2 className="text-xl font-semibold mb-3">February 2024 vs February 2025</h2>
          
          <p className="mb-4">This report presents the results of statistical tests comparing bed waiting times between February 2024 and February 2025, organized by key analytical topics.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Overall Distribution of Waiting Times</h2>
          
          <p className="mb-4">The Mann-Whitney U test was used to compare the overall distribution of waiting times between the two years, without assuming normal distribution.</p>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Statistic</th>
                  <th className="py-2 px-4 border">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border">U statistic</td>
                  <td className="py-2 px-4 border">173,006</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border">Z score</td>
                  <td className="py-2 px-4 border">-15.3897</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border font-bold">p-value</td>
                  <td className="py-2 px-4 border font-bold">&lt;0.0001</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border">Median 2024</td>
                  <td className="py-2 px-4 border">270 minutes</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border">Median 2025</td>
                  <td className="py-2 px-4 border">764 minutes</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mb-4 font-semibold">Interpretation: There is a highly statistically significant difference in the distribution of waiting times between February 2024 and February 2025 (p &lt; 0.0001). The median waiting time in February 2025 was nearly three times that of February 2024.</p>
          
          <p className="mt-4 mb-2 font-semibold">Bootstrap Analysis of Median Difference:</p>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Statistic</th>
                  <th className="py-2 px-4 border">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border">Observed difference (2025 - 2024)</td>
                  <td className="py-2 px-4 border">494 minutes</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border font-bold">95% Confidence Interval</td>
                  <td className="py-2 px-4 border font-bold">[389.0, 631.0]</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mb-6 font-semibold">Interpretation: With 95% confidence, the true increase in median waiting time from 2024 to 2025 is between 389 and 631 minutes. This confirms a statistically significant increase in median waiting time.</p>
          
          {/* Additional statistical analysis sections omitted for brevity */}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-6 text-center">Bed Waiting Time Distribution: February 2024 vs 2025 (4-Hour Intervals)</h2>
      
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
          <li>The proportion of patients with waits under 240 minutes (4 hours) decreased dramatically from approximately 46% in 2024 to only 19% in 2025.</li>
          <li>The proportion of patients with waits under 360 minutes (6 hours) decreased from approximately 58% in 2024 to only 29% in 2025.</li>
          <li>Median waiting times more than doubled from 271 minutes in 2024 to 765 minutes in 2025.</li>
          <li>The percentage of very long waits (over 24 hours/1440 minutes) increased from approximately 3% in 2024 to over 25% in 2025.</li>
          <li>There is significantly more variation in waiting times in 2025, shown by the wider spread in the distribution and increased interquartile range.</li>
          <li>All wards except W6D show substantial increases in mean waiting times, with waiting times in wards W6A and W6B more than tripling.</li>
        </ul>
      </div>
    </div>
  );
};

// Render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<WaitingTimeDistributions />);
