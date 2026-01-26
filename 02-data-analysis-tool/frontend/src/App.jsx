import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const API_URL = 'http://localhost:8000';

function App() {
  // State for filters
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [yearRange, setYearRange] = useState([1900, 2025]);
  const [minYear, setMinYear] = useState(1900);
  const [maxYear, setMaxYear] = useState(2025);
  const [ratingRange, setRatingRange] = useState([0, 10]);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(10);

  // State for data
  const [filteredData, setFilteredData] = useState([]);
  const [dataCount, setDataCount] = useState(0);

  // State for analysis
  const [question, setQuestion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchColumns();
    fetchGenres();
    fetchYearRange();
    fetchRatingRange();
  }, []);

  // Auto-filter when filters change
  useEffect(() => {
    if (selectedColumns.length > 0) {
      applyFilters();
    }
  }, [selectedColumns, selectedGenres, yearRange, ratingRange]);

  const fetchColumns = async () => {
    const res = await fetch(`${API_URL}/columns`);
    const data = await res.json();
    setColumns(data.columns);
    setSelectedColumns(data.columns);
  };

  const fetchGenres = async () => {
    const res = await fetch(`${API_URL}/filters/genres`);
    const data = await res.json();
    setGenres(data.genres);
    setSelectedGenres(data.genres);
  };

  const fetchYearRange = async () => {
    const res = await fetch(`${API_URL}/filters/years`);
    const data = await res.json();
    setMinYear(data.min_year);
    setMaxYear(data.max_year);
    setYearRange([data.min_year, data.max_year]);
  };

  const fetchRatingRange = async () => {
    const res = await fetch(`${API_URL}/filters/ratings`);
    const data = await res.json();
    setMinRating(data.min_rating);
    setMaxRating(data.max_rating);
    setRatingRange([data.min_rating, data.max_rating]);
  };

  const applyFilters = async () => {
    const res = await fetch(`${API_URL}/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selected_columns: selectedColumns,
        selected_genres: selectedGenres,
        year_range: yearRange,
        rating_range: ratingRange,
      }),
    });
    const data = await res.json();
    setFilteredData(data.data);
    setDataCount(data.count);
  };

  const analyzeData = async () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          filtered_data: filteredData,
        }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (error) {
      alert('Error analyzing data: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleColumn = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          Interactive Data Analysis Tool
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Data Filters</h2>

              {/* Column Selection */}
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-gray-600">Select Columns</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                  {columns.map((col) => (
                    <label key={col} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                        className="rounded"
                      />
                      <span className="text-sm">{col}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-gray-600">Filter by Genre</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                  {genres.map((genre) => (
                    <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre)}
                        onChange={() => toggleGenre(genre)}
                        className="rounded"
                      />
                      <span className="text-sm">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-gray-600">Release Year</h3>
                <div className="px-2 py-4">
                  <Slider
                    range
                    min={minYear}
                    max={maxYear}
                    value={yearRange}
                    onChange={(value) => setYearRange(value)}
                    trackStyle={[{ backgroundColor: '#3b82f6' }]}
                    handleStyle={[
                      { borderColor: '#3b82f6', backgroundColor: '#fff' },
                      { borderColor: '#3b82f6', backgroundColor: '#fff' }
                    ]}
                  />
                  <div className="text-sm text-gray-600 mt-2 text-center">
                    {yearRange[0]} - {yearRange[1]}
                  </div>
                </div>
              </div>

              {/* Rating Range */}
              <div>
                <h3 className="font-medium mb-2 text-gray-600">IMDB Rating</h3>
                <div className="px-2 py-4">
                  <Slider
                    range
                    min={minRating}
                    max={maxRating}
                    step={0.1}
                    value={ratingRange}
                    onChange={(value) => setRatingRange(value)}
                    trackStyle={[{ backgroundColor: '#3b82f6' }]}
                    handleStyle={[
                      { borderColor: '#3b82f6', backgroundColor: '#fff' },
                      { borderColor: '#3b82f6', backgroundColor: '#fff' }
                    ]}
                  />
                  <div className="text-sm text-gray-600 mt-2 text-center">
                    {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dataset and Question Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtered Dataset */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Filtered Dataset ({dataCount} rows)
              </h2>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {selectedColumns.map((col) => (
                        <th key={col} className="px-4 py-2 text-left font-medium text-gray-600">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 100).map((row, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        {selectedColumns.map((col) => (
                          <td key={col} className="px-4 py-2">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Question Input */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Ask a Question</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is the average IMDB rating?"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && analyzeData()}
                />
                <button
                  onClick={analyzeData}
                  disabled={analyzing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results Column */}
          <div className="lg:col-span-2">
            {analysisResult ? (
              <div className="bg-white p-6 rounded-lg shadow space-y-4 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-700">Analysis Results</h2>

                <div>
                  <h3 className="font-semibold mb-2 text-gray-600">Generated Code:</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{analysisResult.generated_code}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-gray-600">Execution Output:</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                    {analysisResult.execution_output}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-gray-600">Interpretation:</h3>
                  <p className="text-gray-700">{analysisResult.interpretation}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow sticky top-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Analysis Results</h2>
                <p className="text-gray-500 text-center py-12">
                  No analysis yet. Ask a question to see results here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
