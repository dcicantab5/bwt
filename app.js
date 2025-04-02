// Extract needed components from Recharts
const {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, ComposedChart, Area,
  ScatterChart, Scatter
} = Recharts;

// Main component
const WaitingTimeDistributions = () => {
  const [data, setData] = React.useState({ feb2024: [], feb2025: [], isLoading: true });
  const [histogramData, setHistogramData] = React.useState([]);
  const [densityData, setDensityData] = React.useState([]);
  const [boxPlotData, setBoxPlotData] = React.useState([]);
  const [wardData, setWardData] = React.useState({});
  const [selectedTab, setSelectedTab] = React.useState('histogram');
  const [showStatisticalAnalysis, setShowStatisticalAnalysis] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await window.fs.readFile('data.csv', { encoding: 'utf8' });
        
        Papa.parse(response, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Filter for February 2024 and 2025
            const feb2024 = results.data.filter(row => {
              if (!row.Tarikh) return false;
              const dateParts = String(row.Tarikh).split('/');
              const month = parseInt(dateParts[0]);
              const year = parseInt(dateParts[2]);
              return month === 2 && year === 24;
            });
            
            const feb2025 = results.data.filter(row => {
              if (!row.Tarikh) return false;
              const dateParts = String(row.Tarikh).split('/');
              const month = parseInt(dateParts[0]);
              const year = parseInt(dateParts[2]);
              return month === 2 && year === 25;
            });
            
            setData({ feb2024, feb2025, isLoading: false });
            
            // Create histogram data
            createHistogramData(feb2024, feb2025);
            
            // Create density plot data
            createDensityData(feb2024, feb2025);
            
            // Create box plot data
            createBoxPlotData(feb2024, feb2025);
            
            // Create ward-specific data
            createWardData(feb2024, feb2025);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };

    fetchData();
  }, []);

  const createHistogramData = (feb2024, feb2025) => {
    // Define bins for histogram in 4-hour (240-minute) intervals
    const bins = [
      { min: 0, max: 240, label: '0-4h' },
      { min: 241, max: 480, label: '4-8h' },
      { min: 481, max: 720, label: '8-12h' },
      { min: 721, max: 960, label: '12-16h' },
      { min: 961, max: 1200, label: '16-20h' },
      { min: 1201, max: 1440, label: '20-24h' },
      { min: 1441, max: 1680, label: '24-28h' },
      { min: 1681, max: 1920, label: '28-32h' },
      { min: 1921, max: 2160, label: '32-36h' },
      { min: 2161, max: 2400, label: '36-40h' },
      { min: 2401, max: 2640, label: '40-44h' },
      { min: 2641, max: 2880, label: '44-48h' },
      { min: 2881, max: Infinity, label: '48h+' }
    ];

    const histogramData = bins.map(bin => {
      const count2024 = feb2024.filter(d => d.Duration >= bin.min && d.Duration <= bin.max).length;
      const percent2024 = (count2024 / feb2024.length) * 100;
      
      const count2025 = feb2025.filter(d => d.Duration >= bin.min && d.Duration <= bin.max).length;
      const percent2025 = (count2025 / feb2025.length) * 100;
      
      return {
        bin: bin.label,
        count2024,
        count2025,
        percent2024: parseFloat(percent2024.toFixed(1)),
        percent2025: parseFloat(percent2025.toFixed(1))
      };
    });
    
    setHistogramData(histogramData);
  };

  const createDensityData = (feb2024, feb2025) => {
    // Create a smoothed density plot approximation
    // Using KDE-like approach with simplified implementation
    
    // Get all durations
    const durations2024 = feb2024.map(d => d.Duration).sort((a, b) => a - b);
    const durations2025 = feb2025.map(d => d.Duration).sort((a, b) => a - b);
    
    // Find the range
    const max = Math.max(
      ...durations2024,
      ...durations2025
    );
    
    // Create points along the range for smoothed density at 2-hour (120-minute) intervals
    const stepSize = 120; // 2-hour intervals
    const maxHours = Math.ceil(max / 60); // Max in hours
    const points = Math.ceil(maxHours / 2); // Number of 2-hour points
    
    const densityData = [];
    for (let i = 0; i <= points; i++) {
      const x = i * stepSize;
      
      // Using a bandwidth that gives smoother results
      const bandwidth = 240; // 4-hour bandwidth
      const density2024 = durations2024.filter(d => Math.abs(d - x) < bandwidth).length / feb2024.length;
      const density2025 = durations2025.filter(d => Math.abs(d - x) < bandwidth).length / feb2025.length;
      
      densityData.push({
        duration: x,
        density2024: density2024 * 100, // Scale for visibility
        density2025: density2025 * 100  // Scale for visibility
      });
    }
    
    setDensityData(densityData);
  };

  const createBoxPlotData = (feb2024, feb2025) => {
    const calculateStats = (data) => {
      const durations = data.map(d => d.Duration).sort((a, b) => a - b);
      const min = durations[0];
      const max = durations[durations.length - 1];
      const q1 = durations[Math.floor(durations.length * 0.25)];
      const median = durations[Math.floor(durations.length * 0.5)];
      const q3 = durations[Math.floor(durations.length * 0.75)];
      const mean = durations.reduce((sum, val) => sum + val, 0) / durations.length;
      
      return { min, max, q1, median, q3, mean };
    };
    
    const stats2024 = calculateStats(feb2024);
    const stats2025 = calculateStats(feb2025);
    
    setBoxPlotData([
      {
        year: '2024',
        min: stats2024.min,
        max: stats2024.max,
        median: stats2024.median,
        q1: stats2024.q1,
        q3: stats2024.q3,
        mean: stats2024.mean
      },
      {
        year: '2025',
        min: stats2025.min,
        max: stats2025.max,
        median: stats2025.median,
        q1: stats2025.q1,
        q3: stats2025.q3,
        mean: stats2025.mean
      }
    ]);
  };

  const createWardData = (feb2024, feb2025) => {
    const wards = ['W6A', 'W6B', 'W6C', 'W6D'];
    
    const wardSpecificData = {};
    
    wards.forEach(ward => {
      const calculateWardStats = (data, ward) => {
        const wardData = data.filter(d => d.Wad === ward);
        const durations = wardData.map(d => d.Duration);
        
        if (durations.length === 0) return null;
        
        return {
          count: wardData.length,
          mean: durations.reduce((sum, val) => sum + val, 0) / durations.length,
          median: durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]
        };
      };
      
      const stats2024 = calculateWardStats(feb2024, ward);
      const stats2025 = calculateWardStats(feb2025, ward);
      
      wardSpecificData[ward] = {
        stats2024,
        stats2025,
        comparison: stats2024 && stats2025 ? {
          meanChange: stats2025.mean - stats2024.mean,
          medianChange: stats2025.median - stats2024.median,
          meanChangePercent: ((stats2025.mean - stats2024.mean) / stats2024.mean * 100).toFixed(1),
          medianChangePercent: ((stats2025.median - stats2024.median) / stats2024.median * 100).toFixed(1)
        } : null
      };
    });
    
    setWardData(wardSpecificData);
  };

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
    const CustomizedAxisTick = (props) => {
      const { x, y, payload } = props;
      
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">{payload.value}</text>
        </g>
      );
    };
    
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
    const prepareWardData = () => {
      if (Object.keys(wardData).length === 0) return [];
      
      return Object.keys(wardData).map(ward => {
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
    };
    
    const wardChartData = prepareWardData();
    
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
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Key Clinical Thresholds</h2>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">2.1. 4-Hour Standard (240 minutes)</h3>
          
          <p className="mb-2 font-semibold">Chi-Square Test Results:</p>
          
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
                  <td className="py-2 px-4 border">Chi-square statistic</td>
                  <td className="py-2 px-4 border">126.7145</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border font-bold">p-value</td>
                  <td className="py-2 px-4 border font-bold">&lt;0.0001</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border">Odds ratio</td>
                  <td className="py-2 px-4 border">3.56</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border">Proportion meeting threshold 2024</td>
                  <td className="py-2 px-4 border">45.49%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border">Proportion meeting threshold 2025</td>
                  <td className="py-2 px-4 border">19.01%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mb-6 font-semibold">Interpretation: The proportion of patients seen within 4 hours decreased significantly from 45.49% in 2024 to 19.01% in 2025 (p &lt; 0.0001). Patients in 2024 were 3.56 times more likely to be seen within 4 hours than patients in 2025.</p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">2.2. Extended Waits (&gt;24 hours/1440 minutes)</h3>
          
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
                  <td className="py-2 px-4 border">Odds ratio</td>
                  <td className="py-2 px-4 border">7.12</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border font-bold">p-value</td>
                  <td className="py-2 px-4 border font-bold">&lt;0.0001</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border">Proportion exceeding 24h 2024</td>
                  <td className="py-2 px-4 border">4.39%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border">Proportion exceeding 24h 2025</td>
                  <td className="py-2 px-4 border">24.62%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mb-6 font-semibold">Interpretation: The proportion of patients waiting more than 24 hours increased significantly from 4.39% in 2024 to 24.62% in 2025 (p &lt; 0.0001). Patients in 2025 were 7.12 times more likely to experience extended waits over 24 hours compared to 2024.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">Summary of Findings</h2>
          
          <p className="mb-4">All statistical methods yield consistent results, providing strong evidence that:</p>
          
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>The overall distribution of waiting times in February 2025 was significantly higher than in February 2024.</li>
            <li>There was a statistically significant decrease in the proportion of patients meeting the 4-hour standard (26.48 percentage point decrease).</li>
            <li>There was a statistically significant increase in the proportion of patients experiencing extended waits of over 24 hours (20.23 percentage point increase).</li>
            <li>The magnitude of these changes is substantial, with the median waiting time increasing by approximately 8 hours (494 minutes).</li>
          </ol>
          
          <p className="mb-4">These findings demonstrate a clear and statistically significant deterioration in bed waiting times between February 2024 and February 2025.</p>
        </div>
      </div>
