import { ProcessedCommune, WaterQualityResult } from './types';
import { isParameterCompliant, formatResultValue } from './hubeau';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToCSV(commune: ProcessedCommune) {
  const headers = ['Paramètre', 'Résultat', 'Unité', 'Date', 'Conformité'];
  const rows = commune.data.map(item => [
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

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hubeau_data_${commune.insee}.csv`;
  a.click();
}

export function exportToJSON(commune: ProcessedCommune) {
  const blob = new Blob([JSON.stringify(commune.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hubeau_data_${commune.insee}.json`;
  a.click();
}

export function exportToPDF(commune: ProcessedCommune) {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241); // Indigo-500
  doc.text("Rapport Qualité de l'Eau Potable", 14, 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Commune : ${commune.commune_name} (${commune.insee})`, 14, 35);
  doc.text(`Généré le : ${date}`, 14, 40);

  // Summary
  const nonCompliant = commune.data.filter(d => !isParameterCompliant(d));
  const isGlobalCompliant = nonCompliant.length === 0;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 45, 196, 45);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Synthèse de conformité", 14, 55);

  doc.setFontSize(11);
  if (isGlobalCompliant) {
    doc.setTextColor(5, 150, 105); // Emerald-600
    doc.text("L'eau est conforme aux limites de qualité pour tous les paramètres analysés.", 14, 65);
  } else {
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text(`${nonCompliant.length} paramètre(s) non conforme(s) détecté(s).`, 14, 65);
  }

  // Table
  const tableRows = commune.data.map(item => [
    item.libelle_parametre,
    formatResultValue(item.resultat_alphanumerique || item.resultat_numerique),
    item.libelle_unite,
    item.date_prelevement,
    isParameterCompliant(item) ? 'Conforme' : 'Non conforme'
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Paramètre', 'Résultat', 'Unité', 'Date', 'Conformité']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 8, cellPadding: 2 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'Non conforme') {
          data.cell.styles.textColor = [220, 38, 38];
        } else {
          data.cell.styles.textColor = [5, 150, 105];
        }
      }
    }
  });

  doc.save(`rapport_hubeau_${commune.insee}.pdf`);
}
