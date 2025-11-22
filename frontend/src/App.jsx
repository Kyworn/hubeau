import { useState } from 'react'
import { filterAndCategorizeData, isParameterCompliant, groupDataByParameter, formatResultValue } from './utils'
import TrendsChart from './components/TrendsChart'
import ThemeToggle from './components/ThemeToggle'
import Tooltip from './components/Tooltip'
import { glossary } from './glossary'

function App() {
  const [postalCode, setPostalCode] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [expandedHistory, setExpandedHistory] = useState({}) // { "paramName": boolean }
  const [expandedChart, setExpandedChart] = useState({}) // { "paramName": boolean }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!postalCode) return

    setLoading(true)
    setError(null)
    setResults(null)
    setActiveCategory(null)
    setExpandedHistory({})
    setExpandedChart({})

    try {
      const response = await fetch(`http://localhost:8001/api/quality/${postalCode}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la récupération des données')
      }
      const data = await response.json()

      // Process data for each commune
      const processedResults = data.results.map(commune => {
        const categorized = filterAndCategorizeData(commune.data)

        // Group data within categories
        const categorizedAndGrouped = {};
        Object.keys(categorized).forEach(cat => {
          categorizedAndGrouped[cat] = groupDataByParameter(categorized[cat]);
        });

        return {
          ...commune,
          categorizedData: categorizedAndGrouped,
          categories: Object.keys(categorized).sort()
        }
      })

      setResults(processedResults)

      if (processedResults.length > 0 && processedResults[0].categories.length > 0) {
        setActiveCategory(processedResults[0].categories[0])
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleHistory = (paramName) => {
    setExpandedHistory(prev => ({
      ...prev,
      [paramName]: !prev[paramName]
    }))
  }

  const toggleChart = (paramName) => {
    setExpandedChart(prev => ({
      ...prev,
      [paramName]: !prev[paramName]
    }))
  }

  const exportData = (format) => {
    if (!results) return;

    const commune = results[0]; // Assuming single commune for now or taking the first
    const data = commune.data;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hubeau_data_${commune.insee}.json`;
      a.click();
    } else if (format === 'csv') {
      const headers = ['Paramètre', 'Résultat', 'Unité', 'Date', 'Conformité'];
      const rows = data.map(item => [
        item.libelle_parametre,
        item.resultat_alphanumerique || item.resultat_numerique,
        item.libelle_unite,
        item.date_prelevement,
        isParameterCompliant(item) ? 'Conforme' : 'Non conforme'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          const cellStr = String(cell || '');
          return `"${cellStr.replace(/"/g, '""')}"`;
        }).join(','))
      ].join('\n');

      // Add BOM for Excel compatibility
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hubeau_data_${commune.insee}.csv`;
      a.click();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Qualité de l'Eau
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Vérifiez la qualité de l'eau potable dans votre commune.
          </p>
        </div>

        <div className="mt-12 max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Code postal (ex: 33000)"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {loading ? '...' : 'Rechercher'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-8 max-w-lg mx-auto bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erreur</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-12 space-y-12">
            {results.map((commune) => (
              <div key={commune.insee} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    {commune.commune_name} ({commune.insee})
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => exportData('csv')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer">Export CSV</button>
                    <button onClick={() => exportData('json')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer">Export JSON</button>
                  </div>
                </div>

                {/* Category Tabs - Improved Navigation (Wrapped) */}
                <div className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2">
                  <nav className="flex flex-wrap gap-2" aria-label="Tabs">
                    {commune.categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`
                          px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors
                          ${activeCategory === category
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                            : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600'}
                        `}
                      >
                        {category}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="px-4 py-5 sm:p-6">
                  {activeCategory && commune.categorizedData[activeCategory] ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(commune.categorizedData[activeCategory]).map(([paramName, measurements]) => {
                        const latest = measurements[0];
                        const isCompliant = isParameterCompliant(latest);
                        const hasHistory = measurements.length > 1;
                        const isExpanded = expandedHistory[paramName];
                        const isChartExpanded = expandedChart[paramName];
                        const glossaryTerm = glossary[paramName];

                        // Determine border color based on compliance
                        // If no reference, default border. If compliant, green. If not, red.
                        const hasReference = latest.reference_qualite_parametre || latest.limite_qualite_parametre;
                        let borderColor = 'border-gray-200 dark:border-gray-700';
                        if (hasReference) {
                          borderColor = isCompliant
                            ? 'border-green-200 dark:border-green-800 ring-1 ring-green-100 dark:ring-green-900'
                            : 'border-red-200 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900';
                        }

                        return (
                          <div key={paramName} className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border ${borderColor} transition-all duration-200`}>
                            <div className="px-4 py-5 sm:p-6">
                              <div className="flex items-center gap-2 mb-1">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate" title={latest.libelle_parametre}>
                                  {latest.libelle_parametre}
                                </dt>
                                {glossaryTerm && (
                                  <Tooltip text={glossaryTerm}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-indigo-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </Tooltip>
                                )}
                              </div>
                              <dd className={`mt-1 text-3xl font-semibold ${hasReference ? (isCompliant ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400') : 'text-gray-900 dark:text-white'}`}>
                                {formatResultValue(latest.resultat_alphanumerique || latest.resultat_numerique)}
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-1">{latest.libelle_unite}</span>
                              </dd>

                              <div className="mt-2 flex justify-between items-end">
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {new Date(latest.date_prelevement).toLocaleDateString()}
                                </p>
                                {hasReference && (
                                  <p className={`text-xs px-2 py-1 rounded ${isCompliant ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                    Ref: {latest.reference_qualite_parametre || latest.limite_qualite_parametre}
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-2 flex gap-4">
                                {hasHistory && (
                                  <button
                                    onClick={() => toggleHistory(paramName)}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer flex items-center"
                                  >
                                    {isExpanded ? 'Masquer historique' : `Voir historique (${measurements.length - 1})`}
                                  </button>
                                )}
                                {hasHistory && (
                                  <button
                                    onClick={() => toggleChart(paramName)}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer flex items-center"
                                  >
                                    {isChartExpanded ? 'Masquer graphique' : 'Voir graphique'}
                                  </button>
                                )}
                              </div>

                              {isExpanded && (
                                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                  {measurements.slice(1).map((m, i) => (
                                    <div key={i} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                      <span>{new Date(m.date_prelevement).toLocaleDateString()}</span>
                                      <span className="font-medium">{formatResultValue(m.resultat_alphanumerique || m.resultat_numerique)} {m.libelle_unite}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {isChartExpanded && (
                                <TrendsChart
                                  data={measurements}
                                  limit={latest.limite_qualite_parametre}
                                  reference={latest.reference_qualite_parametre}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Sélectionnez une catégorie pour voir les résultats.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
