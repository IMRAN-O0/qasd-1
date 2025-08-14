import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Document Template Engine
class DocumentService {
  constructor() {
    this.templates = {
      business: {
        invoice: this.generateInvoice.bind(this),
        quotation: this.generateQuotation.bind(this),
        purchaseOrder: this.generatePurchaseOrder.bind(this)
      },
      production: {
        batchRecord: this.generateBatchRecord.bind(this),
        qualityCertificate: this.generateQualityCertificate.bind(this),
        maintenanceReport: this.generateMaintenanceReport.bind(this)
      },
      compliance: {
        safetyReport: this.generateSafetyReport.bind(this),
        auditReport: this.generateAuditReport.bind(this),
        trainingCertificate: this.generateTrainingCertificate.bind(this)
      }
    };

    this.companyBranding = {
      logo: null,
      primaryColor: '#1e40af',
      secondaryColor: '#64748b',
      fontFamily: 'Arial',
      address: '',
      phone: '',
      email: '',
      website: ''
    };
  }

  // Set company branding
  setBranding(branding) {
    this.companyBranding = { ...this.companyBranding, ...branding };
  }

  // Create PDF document with branding
  createPDF(orientation = 'portrait', format = 'a4') {
    const doc = new jsPDF(orientation, 'mm', format);

    // Add Arabic font support
    doc.addFont(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap',
      'NotoSansArabic',
      'normal'
    );

    return doc;
  }

  // Add header with company branding
  addHeader(doc, title, isArabic = false) {
    const pageWidth = doc.internal.pageSize.width;

    // Company logo (if available)
    if (this.companyBranding.logo) {
      doc.addImage(this.companyBranding.logo, 'PNG', 15, 15, 30, 20);
    }

    // Company name and title
    doc.setFontSize(20);
    doc.setTextColor(this.companyBranding.primaryColor);
    doc.text(title, isArabic ? pageWidth - 15 : 50, 25, { align: isArabic ? 'right' : 'left' });

    // Company details
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    const details = [
      this.companyBranding.address,
      this.companyBranding.phone,
      this.companyBranding.email,
      this.companyBranding.website
    ].filter(Boolean);

    details.forEach((detail, index) => {
      doc.text(detail, isArabic ? pageWidth - 15 : 50, 35 + index * 5, { align: isArabic ? 'right' : 'left' });
    });

    // Horizontal line
    doc.setDrawColor(this.companyBranding.primaryColor);
    doc.line(15, 55, pageWidth - 15, 55);

    return 65; // Return Y position after header
  }

  // Add footer
  addFooter(doc, pageNumber = 1, totalPages = 1) {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(8);
    doc.setTextColor('#666666');

    // Page number
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Generation date
    const now = new Date();
    doc.text(`Generated on: ${format(now, 'dd/MM/yyyy HH:mm')}`, 15, pageHeight - 10);

    // Company name
    doc.text('QASD Management System', pageWidth - 15, pageHeight - 10, { align: 'right' });
  }

  // Calculate VAT and totals
  calculateTotals(items, vatRate = 0.15) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    return {
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2),
      vatRate: (vatRate * 100).toFixed(0)
    };
  }

  // Generate Invoice
  generateInvoice(data) {
    const doc = this.createPDF();
    let yPos = this.addHeader(doc, data.isArabic ? 'فاتورة' : 'INVOICE', data.isArabic);

    // Invoice details
    const details = [
      [`${data.isArabic ? 'رقم الفاتورة:' : 'Invoice No:'} ${data.invoiceNumber}`],
      [`${data.isArabic ? 'التاريخ:' : 'Date:'} ${format(new Date(data.date), 'dd/MM/yyyy')}`],
      [`${data.isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'} ${format(new Date(data.dueDate), 'dd/MM/yyyy')}`]
    ];

    doc.autoTable({
      startY: yPos,
      body: details,
      theme: 'plain',
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Customer details
    doc.setFontSize(12);
    doc.setTextColor(this.companyBranding.primaryColor);
    doc.text(data.isArabic ? 'بيانات العميل:' : 'Bill To:', 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor('#000000');
    doc.text(data.customer.name, 15, yPos);
    doc.text(data.customer.address, 15, yPos + 5);
    doc.text(data.customer.phone, 15, yPos + 10);

    yPos += 25;

    // Items table
    const columns = data.isArabic
      ? ['المجموع', 'سعر الوحدة', 'الكمية', 'الوصف', 'الرقم']
      : ['#', 'Description', 'Qty', 'Unit Price', 'Total'];

    const rows = data.items.map((item, index) => {
      const total = (item.quantity * item.unitPrice).toFixed(2);
      return data.isArabic
        ? [total, item.unitPrice.toFixed(2), item.quantity, item.description, index + 1]
        : [index + 1, item.description, item.quantity, item.unitPrice.toFixed(2), total];
    });

    doc.autoTable({
      startY: yPos,
      head: [columns],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: this.companyBranding.primaryColor },
      margin: { left: 15, right: 15 }
    });

    // Totals
    const totals = this.calculateTotals(data.items, data.vatRate);
    const totalsData = [
      [data.isArabic ? 'المجموع الفرعي:' : 'Subtotal:', totals.subtotal],
      [data.isArabic ? `ضريبة القيمة المضافة (${totals.vatRate}%):` : `VAT (${totals.vatRate}%):`, totals.vatAmount],
      [data.isArabic ? 'المجموع الكلي:' : 'Total:', totals.total]
    ];

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      body: totalsData,
      theme: 'plain',
      styles: { fontSize: 10, halign: 'right' },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { fontStyle: 'bold' } },
      margin: { left: doc.internal.pageSize.width / 2, right: 15 }
    });

    // Payment terms
    if (data.paymentTerms) {
      yPos = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.setTextColor('#666666');
      doc.text(data.isArabic ? 'شروط الدفع:' : 'Payment Terms:', 15, yPos);
      doc.text(data.paymentTerms, 15, yPos + 5);
    }

    this.addFooter(doc);
    return doc;
  }

  // Generate Quotation
  generateQuotation(data) {
    const doc = this.createPDF();
    const yPos = this.addHeader(doc, data.isArabic ? 'عرض سعر' : 'QUOTATION', data.isArabic);

    // Quotation details
    const details = [
      [`${data.isArabic ? 'رقم العرض:' : 'Quote No:'} ${data.quoteNumber}`],
      [`${data.isArabic ? 'التاريخ:' : 'Date:'} ${format(new Date(data.date), 'dd/MM/yyyy')}`],
      [`${data.isArabic ? 'صالح حتى:' : 'Valid Until:'} ${format(new Date(data.validUntil), 'dd/MM/yyyy')}`]
    ];

    doc.autoTable({
      startY: yPos,
      body: details,
      theme: 'plain',
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });

    // Similar structure to invoice but with quotation-specific fields
    // ... (implementation continues)

    this.addFooter(doc);
    return doc;
  }

  // Generate Batch Production Record
  generateBatchRecord(data) {
    const doc = this.createPDF();
    let yPos = this.addHeader(doc, data.isArabic ? 'سجل دفعة الإنتاج' : 'BATCH PRODUCTION RECORD', data.isArabic);

    // Batch information
    const batchInfo = [
      [`${data.isArabic ? 'رقم الدفعة:' : 'Batch Number:'} ${data.batchNumber}`],
      [`${data.isArabic ? 'المنتج:' : 'Product:'} ${data.productName}`],
      [
        `${data.isArabic ? 'تاريخ الإنتاج:' : 'Production Date:'} ${format(new Date(data.productionDate), 'dd/MM/yyyy')}`
      ],
      [`${data.isArabic ? 'الكمية المنتجة:' : 'Quantity Produced:'} ${data.quantityProduced} ${data.unit}`]
    ];

    doc.autoTable({
      startY: yPos,
      body: batchInfo,
      theme: 'plain',
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Raw materials used
    doc.setFontSize(12);
    doc.setTextColor(this.companyBranding.primaryColor);
    doc.text(data.isArabic ? 'المواد الخام المستخدمة:' : 'Raw Materials Used:', 15, yPos);

    const materialColumns = data.isArabic
      ? ['الوحدة', 'الكمية المستخدمة', 'رقم الدفعة', 'اسم المادة']
      : ['Material Name', 'Batch No', 'Quantity Used', 'Unit'];

    const materialRows = data.rawMaterials.map(material =>
      data.isArabic
        ? [material.unit, material.quantityUsed, material.batchNumber, material.name]
        : [material.name, material.batchNumber, material.quantityUsed, material.unit]
    );

    doc.autoTable({
      startY: yPos + 5,
      head: [materialColumns],
      body: materialRows,
      theme: 'striped',
      headStyles: { fillColor: this.companyBranding.primaryColor },
      margin: { left: 15, right: 15 }
    });

    // Quality control data
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(this.companyBranding.primaryColor);
    doc.text(data.isArabic ? 'بيانات مراقبة الجودة:' : 'Quality Control Data:', 15, yPos);

    const qcColumns = data.isArabic
      ? ['النتيجة', 'القيمة المقاسة', 'المعيار', 'الاختبار']
      : ['Test', 'Specification', 'Measured Value', 'Result'];

    const qcRows = data.qualityTests.map(test =>
      data.isArabic
        ? [test.result, test.measuredValue, test.specification, test.testName]
        : [test.testName, test.specification, test.measuredValue, test.result]
    );

    doc.autoTable({
      startY: yPos + 5,
      head: [qcColumns],
      body: qcRows,
      theme: 'striped',
      headStyles: { fillColor: this.companyBranding.primaryColor },
      margin: { left: 15, right: 15 }
    });

    // Signatures
    yPos = doc.lastAutoTable.finalY + 20;
    const signatures = [
      [
        data.isArabic ? 'مشغل الإنتاج:' : 'Production Operator:',
        '________________________',
        data.isArabic ? 'التاريخ:' : 'Date:',
        '____________'
      ],
      [
        data.isArabic ? 'مراقب الجودة:' : 'Quality Controller:',
        '________________________',
        data.isArabic ? 'التاريخ:' : 'Date:',
        '____________'
      ],
      [
        data.isArabic ? 'المشرف:' : 'Supervisor:',
        '________________________',
        data.isArabic ? 'التاريخ:' : 'Date:',
        '____________'
      ]
    ];

    doc.autoTable({
      startY: yPos,
      body: signatures,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'center' }, 3: { halign: 'center' } },
      margin: { left: 15, right: 15 }
    });

    this.addFooter(doc);
    return doc;
  }

  // Generate Quality Certificate
  generateQualityCertificate(data) {
    const doc = this.createPDF();
    let yPos = this.addHeader(doc, data.isArabic ? 'شهادة الجودة' : 'CERTIFICATE OF ANALYSIS', data.isArabic);

    // Certificate details
    const certDetails = [
      [`${data.isArabic ? 'رقم الشهادة:' : 'Certificate No:'} ${data.certificateNumber}`],
      [`${data.isArabic ? 'المنتج:' : 'Product:'} ${data.productName}`],
      [`${data.isArabic ? 'رقم الدفعة:' : 'Batch Number:'} ${data.batchNumber}`],
      [
        `${data.isArabic ? 'تاريخ الإنتاج:' : 'Manufacturing Date:'} ${format(new Date(data.manufacturingDate), 'dd/MM/yyyy')}`
      ],
      [
        `${data.isArabic ? 'تاريخ انتهاء الصلاحية:' : 'Expiry Date:'} ${format(new Date(data.expiryDate), 'dd/MM/yyyy')}`
      ]
    ];

    doc.autoTable({
      startY: yPos,
      body: certDetails,
      theme: 'plain',
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });

    // Test results
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(this.companyBranding.primaryColor);
    doc.text(data.isArabic ? 'نتائج الاختبارات:' : 'Test Results:', 15, yPos);

    const testColumns = data.isArabic
      ? ['الحالة', 'النتيجة', 'المعيار', 'الاختبار']
      : ['Test Parameter', 'Specification', 'Result', 'Status'];

    const testRows = data.testResults.map(test => {
      const status = test.status === 'Pass' ? (data.isArabic ? 'مطابق' : 'Pass') : data.isArabic ? 'غير مطابق' : 'Fail';
      return data.isArabic
        ? [status, test.result, test.specification, test.parameter]
        : [test.parameter, test.specification, test.result, status];
    });

    doc.autoTable({
      startY: yPos + 5,
      head: [testColumns],
      body: testRows,
      theme: 'striped',
      headStyles: { fillColor: this.companyBranding.primaryColor },
      didParseCell: data => {
        if (data.column.index === (data.isArabic ? 0 : 3)) {
          const cellValue = data.cell.text[0];
          if (cellValue === 'Pass' || cellValue === 'مطابق') {
            data.cell.styles.textColor = [0, 128, 0]; // Green
          } else if (cellValue === 'Fail' || cellValue === 'غير مطابق') {
            data.cell.styles.textColor = [255, 0, 0]; // Red
          }
        }
      },
      margin: { left: 15, right: 15 }
    });

    // Conclusion
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(this.companyBranding.primaryColor);
    doc.text(data.isArabic ? 'الخلاصة:' : 'Conclusion:', 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor('#000000');
    const conclusion = data.isArabic
      ? 'هذا المنتج يتوافق مع جميع المعايير المطلوبة وصالح للاستخدام.'
      : 'This product complies with all required specifications and is approved for use.';
    doc.text(conclusion, 15, yPos);

    // Authorized signature
    yPos += 20;
    doc.text(data.isArabic ? 'مدير مراقبة الجودة:' : 'Quality Manager:', 15, yPos);
    doc.text('________________________', 15, yPos + 10);
    doc.text(data.qualityManager || '', 15, yPos + 15);
    doc.text(format(new Date(), 'dd/MM/yyyy'), 15, yPos + 20);

    this.addFooter(doc);
    return doc;
  }

  // Generate other document types (maintenance reports, safety reports, etc.)
  generateMaintenanceReport(data) {
    // Implementation for maintenance reports
    const doc = this.createPDF();
    // ... detailed implementation
    return doc;
  }

  generateSafetyReport(data) {
    // Implementation for safety reports
    const doc = this.createPDF();
    // ... detailed implementation
    return doc;
  }

  generateAuditReport(data) {
    // Implementation for audit reports
    const doc = this.createPDF();
    // ... detailed implementation
    return doc;
  }

  generateTrainingCertificate(data) {
    // Implementation for training certificates
    const doc = this.createPDF();
    // ... detailed implementation
    return doc;
  }

  generatePurchaseOrder(data) {
    // Implementation for purchase orders
    const doc = this.createPDF();
    const yPos = this.addHeader(doc, data.isArabic ? 'أمر شراء' : 'PURCHASE ORDER', data.isArabic);

    // Purchase order details
    const details = [
      [`${data.isArabic ? 'رقم أمر الشراء:' : 'PO Number:'} ${data.poNumber || 'PO-001'}`],
      [`${data.isArabic ? 'التاريخ:' : 'Date:'} ${format(new Date(), 'dd/MM/yyyy')}`],
      [`${data.isArabic ? 'المورد:' : 'Supplier:'} ${data.supplier || 'Supplier Name'}`]
    ];

    doc.autoTable({
      startY: yPos,
      body: details,
      theme: 'plain',
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });

    this.addFooter(doc);
    return doc;
  }

  // Save document
  saveDocument(doc, filename) {
    doc.save(filename);
  }

  // Preview document (returns blob URL)
  previewDocument(doc) {
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  }

  // Email document
  async emailDocument(doc, emailData) {
    const pdfBlob = doc.output('blob');
    const formData = new FormData();
    formData.append('pdf', pdfBlob, emailData.filename);
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('body', emailData.body);

    try {
      const response = await fetch('/api/email/send-document', {
        method: 'POST',
        body: formData
      });
      return response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // API Methods for document management
  async getDocuments() {
    try {
      const response = await fetch('/api/documents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async createDocument(documentData) {
    if (!documentData.title || documentData.title.trim() === '') {
      throw new Error('Title is required');
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(id, documentData) {
    if (!id) {
      throw new Error('Document ID is required');
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(id) {
    if (!id) {
      throw new Error('Document ID is required');
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async generateDocument(templateId, data) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ templateId, data })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  async searchDocuments(query, filters = {}) {
    try {
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('q', query);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });

      const response = await fetch(`/api/documents/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }
}

export default new DocumentService();
