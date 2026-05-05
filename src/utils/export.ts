import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to a CSV file.
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const val = row[header] ?? "";
        // Escape quotes and wrap in quotes if contains comma
        const stringVal = String(val).replace(/"/g, '""');
        return stringVal.includes(",") ? `"${stringVal}"` : stringVal;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to a PDF file using jsPDF and autoTable.
 */
export const exportToPDF = (title: string, headers: string[], rows: any[][], filename: string) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(title, 14, 22);
  
  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`TrimLink Platform - Business Report`, 14, 35);
  
  // Table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 40,
    theme: 'grid',
    headStyles: { 
      fillColor: [249, 115, 22], // orange-500
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });
  
  doc.save(`${filename}.pdf`);
};
