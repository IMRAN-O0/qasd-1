import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Save, Plus, Trash2, Calendar, User, Package } from 'lucide-react';

const FormRenderer = () => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [materials, setMaterials] = useState([{ material: '', quantity: '', unit: '', batchNumber: '' }]);

  // Sample form template - Batch Production Record
  const formTemplate = {
    id: 'batch-production-record',
    nameAr: 'سجل الإنتاج الدفعي',
    nameEn: 'Batch Production Record',
    category: 'production',
    version: '1.0',
    fields: [
      {
        id: 'productName',
        type: 'text',
        labelAr: 'اسم المنتج',
        labelEn: 'Product Name',
        required: true,
        placeholder: { ar: 'أدخل اسم المنتج', en: 'Enter product name' }
      },
      {
        id: 'batchNumber',
        type: 'text',
        labelAr: 'رقم الدفعة',
        labelEn: 'Batch Number',
        required: true,
        placeholder: { ar: 'BP-2024-001', en: 'BP-2024-001' }
      },
      {
        id: 'productionDate',
        type: 'date',
        labelAr: 'تاريخ الإنتاج',
        labelEn: 'Production Date',
        required: true
      },
      {
        id: 'expiryDate',
        type: 'date',
        labelAr: 'تاريخ انتهاء الصلاحية',
        labelEn: 'Expiry Date',
        required: true
      },
      {
        id: 'operator',
        type: 'text',
        labelAr: 'اسم المشغل',
        labelEn: 'Operator Name',
        required: true,
        placeholder: { ar: 'أدخل اسم المشغل', en: 'Enter operator name' }
      },
      {
        id: 'supervisor',
        type: 'text',
        labelAr: 'اسم المشرف',
        labelEn: 'Supervisor Name',
        required: true,
        placeholder: { ar: 'أدخل اسم المشرف', en: 'Enter supervisor name' }
      },
      {
        id: 'quantity',
        type: 'number',
        labelAr: 'الكمية المنتجة',
        labelEn: 'Quantity Produced',
        required: true,
        placeholder: { ar: '1000', en: '1000' }
      },
      {
        id: 'unit',
        type: 'select',
        labelAr: 'الوحدة',
        labelEn: 'Unit',
        required: true,
        options: [
          { value: 'pieces', labelAr: 'قطعة', labelEn: 'Pieces' },
          { value: 'kg', labelAr: 'كيلوجرام', labelEn: 'Kilogram' },
          { value: 'liter', labelAr: 'لتر', labelEn: 'Liter' },
          { value: 'box', labelAr: 'صندوق', labelEn: 'Box' }
        ]
      },
      {
        id: 'notes',
        type: 'textarea',
        labelAr: 'ملاحظات',
        labelEn: 'Notes',
        required: false,
        placeholder: { ar: 'أدخل أي ملاحظات إضافية', en: 'Enter any additional notes' }
      }
    ]
  };

  // Load tenant configuration and set default date
  useEffect(() => {
    const savedConfig = localStorage.getItem('tenantConfig');
    if (savedConfig) {
      setTenantConfig(JSON.parse(savedConfig));
    } else {
      // Default config if none exists
      setTenantConfig({
        companyName: 'مصنع النموذج',
        companyNameEn: 'Sample Factory',
        language: 'ar',
        paperSize: 'A4'
      });
    }

    // Set default production date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, productionDate: today }));
  }, []);

  const isRTL = tenantConfig?.language === 'ar';

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index][field] = value;
    setMaterials(updatedMaterials);
  };

  const addMaterial = () => {
    setMaterials([...materials, { material: '', quantity: '', unit: '', batchNumber: '' }]);
  };

  const removeMaterial = index => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  // Calculate total materials quantity
  const totalMaterialsQuantity = materials.reduce((total, material) => {
    return total + (parseFloat(material.quantity) || 0);
  }, 0);

  // Check if quantities match
  const quantitiesMatch = totalMaterialsQuantity === (parseFloat(formData.quantity) || 0);

  const generatePDF = () => {
    try {
      // Check if html2pdf is available (would need to be loaded externally)
      if (typeof html2pdf !== 'undefined') {
        const element = document.createElement('div');
        element.innerHTML = createPrintableHTML();

        const opt = {
          margin: 10,
          filename: `${formData.batchNumber || 'batch-record'}-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: tenantConfig.paperSize.toLowerCase(), orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save();
        return;
      }

      // Fallback: Create a clean HTML version for manual printing
      const printContent = createPrintableHTML();

      // Create blob and download as HTML
      const blob = new Blob([printContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.batchNumber || 'batch-record'}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(
        isRTL
          ? 'تم تحميل ملف HTML. افتحه في المتصفح واضغط Ctrl+P للطباعة'
          : 'HTML file downloaded. Open it in browser and press Ctrl+P to print'
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(
        isRTL ? 'حدث خطأ في تصدير PDF. جرب النسخ والطباعة يدوياً' : 'Error generating PDF. Try manual copy and print'
      );
    }
  };

  const createPrintableHTML = () => {
    return `
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
        <head>
          <meta charset="UTF-8">
          <title>${isRTL ? formTemplate.nameAr : formTemplate.nameEn}</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: ${isRTL ? 'Arial, sans-serif' : 'Arial, sans-serif'}; 
              margin: 20px; 
              direction: ${isRTL ? 'rtl' : 'ltr'};
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 15px; 
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .company-logo { width: 60px; height: 60px; }
            .company-info { flex: 1; text-align: center; margin: 0 20px; }
            .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .form-title { font-size: 16px; font-weight: bold; margin: 10px 0; color: #2563eb; }
            .field-row { display: flex; margin-bottom: 10px; gap: 10px; }
            .field { flex: 1; padding: 8px; border: 1px solid #ccc; }
            .field-label { font-weight: bold; margin-bottom: 5px; }
            .section-title { 
              font-size: 14px; 
              font-weight: bold; 
              margin: 20px 0 10px 0; 
              padding: 5px 0;
              border-bottom: 1px solid #ccc;
            }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #333; padding: 8px; text-align: ${isRTL ? 'right' : 'left'}; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { background-color: #e3f2fd; font-weight: bold; }
            .signature-section { margin-top: 40px; display: flex; justify-content: space-around; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 30px; padding-top: 5px; }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 10px; 
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            .status-badge { 
              padding: 2px 6px; 
              border-radius: 10px; 
              font-size: 9px; 
              background: #dcfce7; 
              color: #166534; 
            }
            @media print {
              body { margin: 0; font-size: 11px; }
              .header { page-break-inside: avoid; }
              table { page-break-inside: avoid; }
              .signature-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${tenantConfig.logo ? `<img src="${tenantConfig.logo}" alt="Logo" class="company-logo">` : '<div class="company-logo" style="border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px;">شعار</div>'}
            <div class="company-info">
              <div class="company-name">${isRTL ? tenantConfig.companyName : tenantConfig.companyNameEn}</div>
              <div class="form-title">${isRTL ? formTemplate.nameAr : formTemplate.nameEn}</div>
            </div>
            <div style="font-size: 10px; text-align: ${isRTL ? 'left' : 'right'};">
              <div>${isRTL ? `التاريخ: ${new Date().toLocaleDateString('ar-SA')}` : `Date: ${new Date().toLocaleDateString('en-US')}`}</div>
              <div>${isRTL ? `الوقت: ${new Date().toLocaleTimeString('ar-SA')}` : `Time: ${new Date().toLocaleTimeString('en-US')}`}</div>
            </div>
          </div>
          
          <div class="section-title">${isRTL ? 'معلومات المنتج' : 'Product Information'}</div>
          <div class="field-row">
            <div class="field">
              <div class="field-label">${isRTL ? 'اسم المنتج' : 'Product Name'}:</div>
              <div>${formData.productName || '_______________'}</div>
            </div>
            <div class="field">
              <div class="field-label">${isRTL ? 'رقم الدفعة' : 'Batch Number'}:</div>
              <div>${formData.batchNumber || '_______________'}</div>
            </div>
          </div>
          
          <div class="field-row">
            <div class="field">
              <div class="field-label">${isRTL ? 'تاريخ الإنتاج' : 'Production Date'}:</div>
              <div>${formData.productionDate || '_______________'}</div>
            </div>
            <div class="field">
              <div class="field-label">${isRTL ? 'تاريخ انتهاء الصلاحية' : 'Expiry Date'}:</div>
              <div>${formData.expiryDate || '_______________'}</div>
            </div>
          </div>
          
          <div class="field-row">
            <div class="field">
              <div class="field-label">${isRTL ? 'اسم المشغل' : 'Operator Name'}:</div>
              <div>${formData.operator || '_______________'}</div>
            </div>
            <div class="field">
              <div class="field-label">${isRTL ? 'اسم المشرف' : 'Supervisor Name'}:</div>
              <div>${formData.supervisor || '_______________'}</div>
            </div>
          </div>
          
          <div class="field-row">
            <div class="field">
              <div class="field-label">${isRTL ? 'الكمية المنتجة' : 'Quantity Produced'}:</div>
              <div>${formData.quantity || '_______________'} ${formData.unit || ''}</div>
            </div>
            <div class="field">
              <div class="field-label">${isRTL ? 'حالة التطابق' : 'Balance Status'}:</div>
              <div><span class="status-badge">${quantitiesMatch ? '✓ متطابقة' : '⚠️ غير متطابقة'}</span></div>
            </div>
          </div>
          
          <div class="section-title">${isRTL ? 'جدول المواد الخام' : 'Raw Materials'}</div>
          <table>
            <tr>
              <th>${isRTL ? 'اسم المادة' : 'Material Name'}</th>
              <th>${isRTL ? 'الكمية' : 'Quantity'}</th>
              <th>${isRTL ? 'الوحدة' : 'Unit'}</th>
              <th>${isRTL ? 'رقم الدفعة' : 'Batch Number'}</th>
            </tr>
            ${materials
    .map(
      material => `
              <tr>
                <td>${material.material || '_______________'}</td>
                <td>${material.quantity || '_______________'}</td>
                <td>${material.unit || '_______________'}</td>
                <td>${material.batchNumber || '_______________'}</td>
              </tr>
            `
    )
    .join('')}
            <tr class="total-row">
              <td><strong>${isRTL ? 'إجمالي الكمية' : 'Total Quantity'}</strong></td>
              <td><strong>${totalMaterialsQuantity}</strong></td>
              <td colspan="2">
                ${
  quantitiesMatch
    ? `<span class="status-badge">✓ ${isRTL ? 'متطابقة مع المنتج' : 'Matches Production'}</span>`
    : `<span style="color: #dc2626;">⚠️ ${isRTL ? 'غير متطابقة' : 'Mismatch'}</span>`
}
              </td>
            </tr>
          </table>
          
          ${
  formData.notes
    ? `
            <div class="section-title">${isRTL ? 'ملاحظات' : 'Notes'}</div>
            <div style="border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
              ${formData.notes}
            </div>
          `
    : ''
}
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">
                ${isRTL ? 'توقيع المشغل' : 'Operator Signature'}
              </div>
              <div style="margin-top: 5px; font-weight: bold;">${formData.operator || '_______________'}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                ${isRTL ? 'توقيع المشرف' : 'Supervisor Signature'}
              </div>
              <div style="margin-top: 5px; font-weight: bold;">${formData.supervisor || '_______________'}</div>
            </div>
          </div>
          
          <div class="footer">
            <div><strong>${isRTL ? tenantConfig.companyName : tenantConfig.companyNameEn}</strong></div>
            <div>${isRTL ? `تم الإنشاء في: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}` : `Created on: ${new Date().toLocaleDateString('en-US')} - ${new Date().toLocaleTimeString('en-US')}`}</div>
            <div>${tenantConfig.crNumber ? `CR: ${tenantConfig.crNumber}` : ''} ${tenantConfig.vatNumber ? `| VAT: ${tenantConfig.vatNumber}` : ''}</div>
          </div>
        </body>
        </html>
      `;
  };

  const saveRecord = () => {
    try {
      // Validate required fields
      const requiredFields = formTemplate.fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => !formData[field.id]?.trim());

      if (missingFields.length > 0) {
        alert(
          isRTL
            ? `يرجى ملء الحقول المطلوبة: ${missingFields.map(f => f.labelAr).join(', ')}`
            : `Please fill required fields: ${missingFields.map(f => f.labelEn).join(', ')}`
        );
        return;
      }

      // Validate materials
      const emptyMaterials = materials.filter(m => !m.material || !m.quantity);
      if (emptyMaterials.length > 0) {
        alert(
          isRTL
            ? 'يرجى ملء جميع بيانات المواد أو حذف الصفوف الفارغة'
            : 'Please fill all material data or remove empty rows'
        );
        return;
      }

      // Check quantity balance
      if (!quantitiesMatch) {
        const confirmSave = confirm(
          isRTL
            ? `تحذير: إجمالي كمية المواد (${totalMaterialsQuantity}) لا يساوي الكمية المنتجة (${formData.quantity}). هل تريد الحفظ رغم ذلك؟`
            : `Warning: Total materials quantity (${totalMaterialsQuantity}) doesn't match produced quantity (${formData.quantity}). Save anyway?`
        );
        if (!confirmSave) {
          return;
        }
      }

      const record = {
        id: Date.now(),
        formTemplateId: formTemplate.id,
        data: formData,
        materials: materials,
        createdAt: new Date().toISOString(),
        createdBy: formData.operator || 'Unknown'
      };

      // Save to localStorage
      const existingRecords = JSON.parse(localStorage.getItem('productionRecords') || '[]');
      existingRecords.push(record);
      localStorage.setItem('productionRecords', JSON.stringify(existingRecords));

      alert(isRTL ? 'تم حفظ السجل بنجاح!' : 'Record saved successfully!');

      // Clear form after successful save
      setFormData({ productionDate: new Date().toISOString().split('T')[0] });
      setMaterials([{ material: '', quantity: '', unit: '', batchNumber: '' }]);
    } catch (error) {
      console.error('Error saving record:', error);
      alert(isRTL ? 'حدث خطأ في حفظ السجل' : 'Error saving record');
    }
  };

  const renderField = field => {
    const label = isRTL ? field.labelAr : field.labelEn;
    const placeholder = field.placeholder ? (isRTL ? field.placeholder.ar : field.placeholder.en) : '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className='mb-4'>
            <label className='block text-sm font-medium mb-2 text-gray-700'>
              {label} {field.required && <span className='text-red-500'>*</span>}
            </label>
            <input
              type={field.type}
              value={formData[field.id] || ''}
              onChange={e => handleInputChange(field.id, e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder={placeholder}
              required={field.required}
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className='mb-4'>
            <label className='block text-sm font-medium mb-2 text-gray-700'>
              {label} {field.required && <span className='text-red-500'>*</span>}
            </label>
            <div className='relative'>
              <input
                type='date'
                value={formData[field.id] || ''}
                onChange={e => handleInputChange(field.id, e.target.value)}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required={field.required}
              />
              <Calendar className='absolute left-3 top-3 text-gray-400' size={20} />
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className='mb-4'>
            <label className='block text-sm font-medium mb-2 text-gray-700'>
              {label} {field.required && <span className='text-red-500'>*</span>}
            </label>
            <select
              value={formData[field.id] || ''}
              onChange={e => handleInputChange(field.id, e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required={field.required}
            >
              <option value=''>{isRTL ? 'اختر...' : 'Select...'}</option>
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {isRTL ? option.labelAr : option.labelEn}
                </option>
              ))}
            </select>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className='mb-4'>
            <label className='block text-sm font-medium mb-2 text-gray-700'>
              {label} {field.required && <span className='text-red-500'>*</span>}
            </label>
            <textarea
              value={formData[field.id] || ''}
              onChange={e => handleInputChange(field.id, e.target.value)}
              rows={4}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder={placeholder}
              required={field.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!tenantConfig) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4 rtl:space-x-reverse'>
              {tenantConfig.logo && <img src={tenantConfig.logo} alt='Logo' className='h-12 w-auto' />}
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  {isRTL ? tenantConfig.companyName : tenantConfig.companyNameEn}
                </h1>
                <p className='text-sm text-gray-600'>{isRTL ? 'نظام إدارة الإنتاج' : 'Production Management System'}</p>
              </div>
            </div>
            <div className='flex items-center space-x-2 rtl:space-x-reverse'>
              <button
                onClick={saveRecord}
                className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <Save size={16} className='ml-2' />
                {isRTL ? 'حفظ' : 'Save'}
              </button>
              <button
                onClick={generatePDF}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Download size={16} className='ml-2' />
                {isRTL ? 'تصدير PDF' : 'Export PDF'}
              </button>
              <button
                onClick={() => window.open('./BatchProductionPrint.html', '_blank')}
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <Printer size={16} className='ml-2' />
                {isRTL ? 'طباعة' : 'Print'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='bg-white rounded-lg shadow-lg'>
          {/* Form Header */}
          <div className='border-b border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4 rtl:space-x-reverse'>
                <div className='bg-blue-100 p-3 rounded-lg'>
                  <FileText className='text-blue-600' size={24} />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    {isRTL ? formTemplate.nameAr : formTemplate.nameEn}
                  </h2>
                  <p className='text-gray-600'>
                    {isRTL ? `الإصدار ${formTemplate.version}` : `Version ${formTemplate.version}`}
                  </p>
                </div>
              </div>
              <div className='text-sm text-gray-500'>
                {isRTL
                  ? `تاريخ اليوم: ${new Date().toLocaleDateString('ar-SA')}`
                  : `Today: ${new Date().toLocaleDateString('en-US')}`}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className='p-6'>
            <div className='grid md:grid-cols-2 gap-6 mb-8'>{formTemplate.fields.map(field => renderField(field))}</div>

            {/* Materials Table */}
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <Package className='ml-2 text-blue-600' size={20} />
                  {isRTL ? 'جدول المواد الخام' : 'Raw Materials Table'}
                </h3>
                <div className='flex items-center space-x-4 rtl:space-x-reverse'>
                  <div
                    className={`text-sm px-3 py-1 rounded-lg ${
                      quantitiesMatch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isRTL ? `الإجمالي: ${totalMaterialsQuantity}` : `Total: ${totalMaterialsQuantity}`}
                    {quantitiesMatch ? ' ✓' : ' ⚠️'}
                  </div>
                  <button
                    onClick={addMaterial}
                    className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                  >
                    <Plus size={16} className='ml-1' />
                    {isRTL ? 'إضافة مادة' : 'Add Material'}
                  </button>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full border border-gray-300 rounded-lg'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'اسم المادة' : 'Material Name'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'الكمية' : 'Quantity'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'الوحدة' : 'Unit'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'رقم الدفعة' : 'Batch Number'}
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'إجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, index) => (
                      <tr key={index} className='border-b'>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={material.material}
                            onChange={e => handleMaterialChange(index, 'material', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'اسم المادة' : 'Material name'}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='number'
                            step='any'
                            value={material.quantity}
                            onChange={e => handleMaterialChange(index, 'quantity', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='0'
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <select
                            value={material.unit}
                            onChange={e => handleMaterialChange(index, 'unit', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          >
                            <option value=''>{isRTL ? 'اختر...' : 'Select...'}</option>
                            <option value='kg'>{isRTL ? 'كيلوجرام' : 'Kilogram'}</option>
                            <option value='g'>{isRTL ? 'جرام' : 'Gram'}</option>
                            <option value='l'>{isRTL ? 'لتر' : 'Liter'}</option>
                            <option value='ml'>{isRTL ? 'مليلتر' : 'Milliliter'}</option>
                            <option value='pieces'>{isRTL ? 'قطعة' : 'Pieces'}</option>
                          </select>
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={material.batchNumber}
                            onChange={e => handleMaterialChange(index, 'batchNumber', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'رقم الدفعة' : 'Batch number'}
                          />
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <button
                            onClick={() => removeMaterial(index)}
                            disabled={materials.length === 1}
                            className={`p-2 rounded-lg transition-colors ${
                              materials.length === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className='bg-gray-50 font-semibold'>
                      <td className='px-4 py-3 text-right'>{isRTL ? 'إجمالي الكمية:' : 'Total Quantity:'}</td>
                      <td className='px-4 py-3'>
                        <span className={`font-bold ${quantitiesMatch ? 'text-green-600' : 'text-red-600'}`}>
                          {totalMaterialsQuantity}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        {formData.quantity && (
                          <span className='text-sm text-gray-600'>
                            {isRTL ? `المطلوب: ${formData.quantity}` : `Required: ${formData.quantity}`}
                          </span>
                        )}
                      </td>
                      <td className='px-4 py-3'></td>
                      <td className='px-4 py-3'></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {!quantitiesMatch && formData.quantity && (
                <div className='mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                  <p className='text-amber-800 text-sm'>
                    {isRTL
                      ? `⚠️ تحذير: إجمالي كمية المواد (${totalMaterialsQuantity}) لا يساوي الكمية المنتجة (${formData.quantity})`
                      : `⚠️ Warning: Total materials (${totalMaterialsQuantity}) doesn't match produced quantity (${formData.quantity})`}
                  </p>
                </div>
              )}
            </div>

            {/* Signature Section */}
            <div className='border-t pt-6'>
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>{isRTL ? 'توقيع المشغل' : 'Operator Signature'}</p>
                    <p className='font-medium'>{formData.operator || '_______________'}</p>
                  </div>
                </div>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>{isRTL ? 'توقيع المشرف' : 'Supervisor Signature'}</p>
                    <p className='font-medium'>{formData.supervisor || '_______________'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='bg-white border-t mt-8'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex justify-between items-center text-sm text-gray-600'>
            <div>{isRTL ? tenantConfig.companyName : tenantConfig.companyNameEn}</div>
            <div>
              {isRTL
                ? `تم الإنشاء في: ${new Date().toLocaleDateString('ar-SA')}`
                : `Created on: ${new Date().toLocaleDateString('en-US')}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormRenderer;
