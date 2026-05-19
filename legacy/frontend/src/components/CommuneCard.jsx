import { useState } from 'react'
import { isParameterCompliant, formatResultValue } from '../utils'
import TrendsChart from './TrendsChart'
import Tooltip from './Tooltip'
import { glossary } from '../glossary'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const CommuneCard = ({ commune }) => {
    const [activeCategory, setActiveCategory] = useState(commune.categories[0] || null)
    const [expandedHistory, setExpandedHistory] = useState({}) // { "paramName": boolean }
    const [expandedChart, setExpandedChart] = useState({}) // { "paramName": boolean }

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

    const generatePDF = () => {
        const doc = new jsPDF();
        const data = commune.data;
        const date = new Date().toLocaleDateString();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("Rapport Qualité de l'Eau Potable", 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Commune : ${commune.commune_name} (${commune.insee})`, 14, 32);
        doc.text(`Date du rapport : ${date}`, 14, 38);

        // Compliance Summary
        const totalParams = data.length;
        const nonCompliant = data.filter(d => !isParameterCompliant(d));
        const isGlobalCompliant = nonCompliant.length === 0;

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 45, 196, 45);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Synthèse de conformité", 14, 55);

        doc.setFontSize(12);
        if (isGlobalCompliant) {
            doc.setTextColor(0, 150, 0);
            doc.text("✅ L'eau est conforme aux limites de qualité pour tous les paramètres analysés.", 14, 65);
        } else {
            doc.setTextColor(200, 0, 0);
            doc.text(`⚠️ ${nonCompliant.length} paramètre(s) non conforme(s) détecté(s).`, 14, 65);
        }

        // Table Data Preparation
        const tableRows = data.map(item => {
            const compliant = isParameterCompliant(item);
            const ref = item.reference_qualite_parametre || item.limite_qualite_parametre || '-';
            return [
                item.libelle_parametre,
                `${formatResultValue(item.resultat_alphanumerique || item.resultat_numerique)}`,
                item.libelle_unite,
                ref,
                compliant ? 'Conforme' : 'Non conforme'
            ];
        });

        // Table
        autoTable(doc, {
            startY: 75,
            head: [['Paramètre', 'Résultat', 'Unité', 'Référence', 'Conformité']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 60 },
                4: { fontStyle: 'bold' }
            },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 4) {
                    if (data.cell.raw === 'Non conforme') {
                        data.cell.styles.textColor = [200, 0, 0];
                    } else {
                        data.cell.styles.textColor = [0, 150, 0];
                    }
                }
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Données issues de l\'API Hub\'Eau - Généré par Hubeau App', 14, doc.internal.pageSize.height - 10);
            doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
        }

        doc.save(`rapport_hubeau_${commune.insee}.pdf`);
    }

    const exportData = (format) => {
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
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    {commune.commune_name} ({commune.insee})
                </h3>
                <div className="flex gap-2">
                    <button onClick={generatePDF} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        PDF
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
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
    )
}

export default CommuneCard
