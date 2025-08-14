export const exporters = {
  // Download JSON data
  downloadJSON: (data, filename) => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading JSON:', error);
      return false;
    }
  },

  // Download CSV data
  downloadCSV: (data, filename, headers = null) => {
    try {
      if (!data.length) {
        alert('لا توجد بيانات للتصدير');
        return false;
      }

      const csvHeaders = headers || Object.keys(data[0]);
      const csvContent = [
        csvHeaders.join(','),
        ...data.map(row =>
          csvHeaders
            .map(header => {
              const value = row[header] || '';
              // Escape values that contain commas, quotes, or newlines
              if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(',')
        )
      ].join('\n');

      // Add BOM for proper Arabic encoding
      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading CSV:', error);
      return false;
    }
  },

  // Download Excel file (basic XLSX)
  downloadExcel: (data, filename, sheetName = 'البيانات') => {
    try {
      if (!data.length) {
        alert('لا توجد بيانات للتصدير');
        return false;
      }

      // Convert data to worksheet format
      const headers = Object.keys(data[0]);
      const worksheetData = [
        headers, // Header row
        ...data.map(row => headers.map(header => row[header] || ''))
      ];

      // Create basic CSV that can be opened as Excel
      const csvContent = worksheetData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'application/vnd.ms-excel;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading Excel:', error);
      return false;
    }
  },

  // Generate printable HTML
  generatePrintableHTML: (content, title, companyInfo = {}) => {
    const currentDate = new Date();

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          * { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            direction: rtl;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
          }
          
          .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .company-logo { 
            width: 80px; 
            height: 80px; 
            object-fit: contain;
          }
          
          .company-info { 
            flex: 1; 
            text-align: center; 
            margin: 0 20px; 
          }
          
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 8px;
            color: #1f2937;
          }
          
          .document-title { 
            font-size: 20px; 
            font-weight: bold; 
            margin: 10px 0; 
            color: #2563eb; 
          }
          
          .header-info {
            font-size: 11px;
            text-align: left;
            color: #6b7280;
          }
          
          .content { 
            margin: 30px 0; 
          }
          
          .section {
            margin-bottom: 25px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background-color: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          
          .info-label {
            font-weight: 600;
            color: #4b5563;
          }
          
          .info-value {
            color: #1f2937;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          th, td { 
            border: 1px solid #d1d5db; 
            padding: 12px 8px; 
            text-align: right;
            vertical-align: top;
          }
          
          th { 
            background-color: #f3f4f6; 
            font-weight: bold;
            color: #374151;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          tr:hover {
            background-color: #f3f4f6;
          }
          
          .total-row {
            background-color: #dbeafe !important;
            font-weight: bold;
            color: #1e40af;
          }
          
          .signature-section { 
            margin-top: 50px; 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 40px;
          }
          
          .signature-box { 
            text-align: center; 
            padding: 20px;
          }
          
          .signature-line { 
            border-top: 2px solid #374151; 
            margin-top: 40px; 
            padding-top: 8px;
            font-weight: 600;
            color: #4b5563;
          }
          
          .signature-name {
            margin-top: 8px;
            font-weight: bold;
            color: #1f2937;
          }
          
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 10px; 
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-success {
            background-color: #dcfce7;
            color: #166534;
          }
          
          .status-warning {
            background-color: #fef3c7;
            color: #92400e;
          }
          
          .status-danger {
            background-color: #fee2e2;
            color: #dc2626;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            color: rgba(0, 0, 0, 0.05);
            z-index: -1;
            pointer-events: none;
          }
          
          @media print {
            body { 
              margin: 0; 
              font-size: 11px; 
            }
            
            .header { 
              page-break-inside: avoid; 
            }
            
            table { 
              page-break-inside: avoid; 
            }
            
            .signature-section { 
              page-break-inside: avoid; 
            }
            
            .section {
              page-break-inside: avoid;
            }
            
            @page {
              margin: 2cm;
              size: A4;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">${companyInfo.name || 'مسودة'}</div>
        
        <div class="header">
          ${
  companyInfo.logo
    ? `<img src="${companyInfo.logo}" alt="شعار الشركة" class="company-logo">`
    : '<div class="company-logo" style="border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #9ca3af;">شعار</div>'
}
          
          <div class="company-info">
            <div class="company-name">${companyInfo.name || 'اسم الشركة'}</div>
            <div class="document-title">${title}</div>
            ${companyInfo.address ? `<div style="font-size: 12px; color: #6b7280; margin-top: 5px;">${companyInfo.address}</div>` : ''}
          </div>
          
          <div class="header-info">
            <div><strong>التاريخ:</strong> ${currentDate.toLocaleDateString('ar-SA')}</div>
            <div><strong>الوقت:</strong> ${currentDate.toLocaleTimeString('ar-SA')}</div>
            <div><strong>رقم المستند:</strong> ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
          </div>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <div><strong>${companyInfo.name || 'اسم الشركة'}</strong></div>
          <div>تم الإنشاء في: ${currentDate.toLocaleDateString('ar-SA')} - ${currentDate.toLocaleTimeString('ar-SA')}</div>
          ${companyInfo.crNumber ? `<div>س.ت: ${companyInfo.crNumber}</div>` : ''}
          ${companyInfo.vatNumber ? `<div>الرقم الضريبي: ${companyInfo.vatNumber}</div>` : ''}
          ${companyInfo.phone ? `<div>هاتف: ${companyInfo.phone}</div>` : ''}
          ${companyInfo.email ? `<div>بريد إلكتروني: ${companyInfo.email}</div>` : ''}
        </div>
      </body>
      </html>
    `;
  },

  // Print or save HTML content
  printHTML: (htmlContent, filename = null) => {
    try {
      if (filename) {
        // Save as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Open print dialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
      return true;
    } catch (error) {
      console.error('Error printing HTML:', error);
      return false;
    }
  },

  // Generate PDF (requires external library)
  generatePDF: async (htmlContent, filename, options = {}) => {
    try {
      // Check if html2pdf is available
      if (typeof html2pdf === 'undefined') {
        console.warn('html2pdf library not found. Falling back to HTML download.');
        return exporters.printHTML(htmlContent, filename);
      }

      const defaultOptions = {
        margin: 1,
        filename: `${filename}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
      };

      const pdfOptions = { ...defaultOptions, ...options };

      // Create temporary element
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      element.style.width = '210mm'; // A4 width
      document.body.appendChild(element);

      await html2pdf().set(pdfOptions).from(element).save();

      document.body.removeChild(element);
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  },

  // Export data in multiple formats
  exportData: (data, filename, format = 'json') => {
    switch (format.toLowerCase()) {
      case 'json':
        return exporters.downloadJSON(data, filename);
      case 'csv':
        return exporters.downloadCSV(data, filename);
      case 'excel':
      case 'xlsx':
        return exporters.downloadExcel(data, filename);
      default:
        console.error('Unsupported export format:', format);
        return false;
    }
  },

  // Batch export multiple datasets
  batchExport: async (datasets, format = 'json') => {
    try {
      let successCount = 0;

      for (const dataset of datasets) {
        const success = exporters.exportData(dataset.data, dataset.filename, format);

        if (success) {
          successCount++;
        }

        // Small delay between exports
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return successCount;
    } catch (error) {
      console.error('Error in batch export:', error);
      return 0;
    }
  }
};

export default exporters;
