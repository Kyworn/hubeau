import { useState } from 'react'
import { filterAndCategorizeData, groupDataByParameter } from './utils'
import ThemeToggle from './components/ThemeToggle'
import CommuneCard from './components/CommuneCard'

function App() {
  const [postalCode1, setPostalCode1] = useState('')
  const [postalCode2, setPostalCode2] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCommuneData = async (code) => {
    if (!code) return null;
    const response = await fetch(`http://localhost:8001/api/quality/${code}`)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Erreur pour ${code}`)
    }
    const data = await response.json()

    // Process data
    return data.results.map(commune => {
      const categorized = filterAndCategorizeData(commune.data)
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
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!postalCode1 && !postalCode2) return

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const promises = []
      if (postalCode1) promises.push(fetchCommuneData(postalCode1))
      if (postalCode2) promises.push(fetchCommuneData(postalCode2))

      const resultsArray = await Promise.all(promises)
      const flatResults = resultsArray.flat().filter(r => r !== null)
      setResults(flatResults)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
            Vérifiez la qualité de l'eau potable. Comparez deux communes !
          </p>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={postalCode1}
              onChange={(e) => setPostalCode1(e.target.value)}
              placeholder="Code postal 1 (ex: 33000)"
              className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <div className="flex items-center justify-center text-gray-400 font-bold">VS</div>
            <input
              type="text"
              value={postalCode2}
              onChange={(e) => setPostalCode2(e.target.value)}
              placeholder="Code postal 2 (ex: 69000)"
              className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {loading ? '...' : 'Comparer'}
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

        {results.length > 0 && (
          <div className={`mt-12 grid gap-8 ${results.length > 1 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
            {results.map((commune) => (
              <CommuneCard key={commune.insee} commune={commune} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
