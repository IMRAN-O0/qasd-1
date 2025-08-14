import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const RawMaterialsInspectionForm = () => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [inspectionItems, setInspectionItems] = useState([
    {
      parameter: '',
      specification: '',
      result: '',
      status: 'pending',
      method: '',
      remarks: ''
    }
  ]);

  // Form template for Raw Materials Inspection
  const formTemplate = {
    id: 'raw-materials-inspection',
    nameAr: 'سجل فحص جودة المواد الخام',
    nameEn: 'Raw Materials Quality Inspection Record',
    category: 'quality',
    version: '1.0',
    fields: [
      {
        id: 'supplierName',
        type: 'text',
        labelAr: 'اسم المورد',
        labelEn: 'Supplier Name',
        required: true,
        placeholder: { ar: 'أدخل اسم المورد', en: 'Enter supplier name' }
      },
      {
        id: 'materialName',
        type: 'text',
        labelAr: 'اسم المادة الخام',
        labelEn: 'Raw Material Name',
        required: true,
        placeholder: { ar: 'أدخل اسم المادة', en: 'Enter material name' }
      },
      {
        id: 'lotNumber',
        type: 'text',
        labelAr: 'رقم اللوط',
        labelEn: 'Lot Number',
        required: true,
        placeholder: { ar: 'LOT-2024-001', en: 'LOT-2024-001' }
      },
      {
        id: 'receiptDate',
        type: 'date',
        labelAr: 'تاريخ الاستلام',
        labelEn: 'Receipt Date',
        required: true
      },
      {
        id: 'inspectionDate',
        type: 'date',
        labelAr: 'تاريخ الفحص',
        labelEn: 'Inspection Date',
        required: true
      },
      {
        id: 'quantity',
        type: 'number',
        labelAr: 'الكمية المستلمة',
        labelEn: 'Received Quantity',
        required: true,
        placeholder: { ar: '100', en: '100' }
      },
      {
        id: 'unit',
        type: 'select',
        labelAr: 'الوحدة',
        labelEn: 'Unit',
        required: true,
        options: [
          { value: 'kg', labelAr: 'كيلوجرام', labelEn: 'Kilogram' },
          { value: 'g', labelAr: 'جرام', labelEn: 'Gram' },
          { value: 'liter', labelAr: 'لتر', labelEn: 'Liter' },
          { value: 'ml', labelAr: 'مليلتر', labelEn: 'Milliliter' },
          { value: 'pieces', labelAr: 'قطعة', labelEn: 'Pieces' }
        ]
      },
      {
        id: 'inspector',
        type: 'text',
        labelAr: 'اسم الفاحص',
        labelEn: 'Inspector Name',
        required: true,
        placeholder: { ar: 'أدخل اسم الفاحص', en: 'Enter inspector name' }
      },
      {
        id: 'storageConditions',
        type: 'select',
        labelAr: 'ظروف التخزين',
        labelEn: 'Storage Conditions',
        required: true,
        options: [
          { value: 'room_temp', labelAr: 'درجة حرارة الغرفة', labelEn: 'Room Temperature' },
          { value: 'cold', labelAr: 'تبريد (2-8°م)', labelEn: 'Cold (2-8°C)' },
          { value: 'frozen', labelAr: 'مجمد (-18°م)', labelEn: 'Frozen (-18°C)' },
          { value: 'dry', labelAr: 'مكان جاف', labelEn: 'Dry Place' }
        ]
      },
      {
        id: 'overallDecision',
        type: 'select',
        labelAr: 'القرار النهائي',
        labelEn: 'Overall Decision',
        required: true,
        options: [
          { value: 'approved', labelAr: 'مقبول', labelEn: 'Approved' },
          { value: 'rejected', labelAr: 'مرفوض', labelEn: 'Rejected' },
          { value: 'conditional', labelAr: 'مقبول بشروط', labelEn: 'Conditional Approval' }
        ]
      },
      {
        id: 'remarks',
        type: 'textarea',
        labelAr: 'ملاحظات عامة',
        labelEn: 'General Remarks',
        required: false,
        placeholder: { ar: 'أدخل أي ملاحظات', en: 'Enter any remarks' }
      }
    ]
  };

  // Load tenant configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem('tenantConfig');
    if (savedConfig) {
      setTenantConfig(JSON.parse(savedConfig));
    } else {
      setTenantConfig({
        companyName: 'مصنع النموذج',
        companyNameEn: 'Sample Factory',
        language: 'ar',
        paperSize: 'A4'
      });
    }

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      receiptDate: today,
      inspectionDate: today
    }));
  }, []);

  const isRTL = tenantConfig?.language === 'ar';

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleInspectionItemChange = (index, field, value) => {
    const updatedItems = [...inspectionItems];
    updatedItems[index][field] = value;

    // Auto-determine status based on result
    if (field === 'result' && updatedItems[index].specification) {
      const result = parseFloat(value);
      const spec = updatedItems[index].specification;

      // Simple logic for numeric comparisons
      if (!isNaN(result) && spec.includes('-')) {
        const [min, max] = spec.split('-').map(s => parseFloat(s.trim()));
        if (!isNaN(min) && !isNaN(max)) {
          if (result >= min && result <= max) {
            updatedItems[index].status = 'passed';
          } else {
            updatedItems[index].status = 'failed';
          }
        }
      }
    }

    setInspectionItems(updatedItems);
  };

  const addInspectionItem = () => {
    setInspectionItems([
      ...inspectionItems,
      {
        parameter: '',
        specification: '',
        result: '',
        status: 'pending',
        method: '',
        remarks: ''
      }
    ]);
  };

  const removeInspectionItem = index => {
    if (inspectionItems.length > 1) {
      setInspectionItems(inspectionItems.filter((_, i) => i !== index));
    }
  };

  // Calculate overall inspection status
  const overallStatus = () => {
    const statuses = inspectionItems.map(item => item.status);
    if (statuses.every(status => status === 'passed')) {
      return 'passed';
    }
    if (statuses.some(status => status === 'failed')) {
      return 'failed';
    }
    return 'pending';
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'passed':
        return <CheckCircle className='text-green-600' size={16} />;
      case 'failed':
        return <XCircle className='text-red-600' size={16} />;
      default:
        return <AlertTriangle className='text-yellow-600' size={16} />;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const saveRecord = () => {
    try {
      // Validate required fields
      const requiredFields = formTemplate.fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => !formData[field.id]?.toString().trim());

      if (missingFields.length > 0) {
        alert(
          isRTL
            ? `يرجى ملء الحقول المطلوبة: ${missingFields.map(f => f.labelAr).join(', ')}`
            : `Please fill required fields: ${missingFields.map(f => f.labelEn).join(', ')}`
        );
        return;
      }

      // Validate inspection items
      const emptyItems = inspectionItems.filter(item => !item.parameter || !item.specification);
      if (emptyItems.length > 0) {
        alert(
          isRTL
            ? 'يرجى ملء جميع معايير الفحص أو حذف الصفوف الفارغة'
            : 'Please fill all inspection parameters or remove empty rows'
        );
        return;
      }

      const record = {
        id: Date.now(),
        formTemplateId: formTemplate.id,
        data: formData,
        inspectionItems: inspectionItems,
        overallStatus: overallStatus(),
        createdAt: new Date().toISOString(),
        createdBy: formData.inspector || 'Unknown'
      };

      // Save to localStorage
      const existingRecords = JSON.parse(localStorage.getItem('inspectionRecords') || '[]');
      existingRecords.push(record);
      localStorage.setItem('inspectionRecords', JSON.stringify(existingRecords));

      alert(isRTL ? 'تم حفظ سجل الفحص بنجاح!' : 'Inspection record saved successfully!');

      // Clear form after successful save
      const today = new Date().toISOString().split('T')[0];
      setFormData({ receiptDate: today, inspectionDate: today });
      setInspectionItems([
        { parameter: '', specification: '', result: '', status: 'pending', method: '', remarks: '' }
      ]);
    } catch (error) {
      console.error('Error saving record:', error);
      alert(isRTL ? 'حدث خطأ في حفظ السجل' : 'Error saving record');
    }
  };

  const generatePDF = () => {
    try {
      const printContent = createPrintableHTML();

      const blob = new Blob([printContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.lotNumber || 'inspection'}-${new Date().toISOString().split('T')[0]}.html`;
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
      alert(isRTL ? 'حدث خطأ في تصدير PDF' : 'Error generating PDF');
    }
  };

  const createPrintableHTML = () => {
    const status = overallStatus();
    return `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
      <head>
        <meta charset="UTF-8">
        <title>${isRTL ? formTemplate.nameAr : formTemplate.nameEn}</title>
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
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
          .company-logo { width: 60px; height: 60px; border: 1px solid #ccc; }
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
          th, td { border: 1px solid #333; padding: 8px; text-align: ${isRTL ? 'right' : 'left'}; font-size: 11px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .status-passed { background-color: #dcfce7; color: #166534; }
          .status-failed { background-color: #fecaca; color: #dc2626; }
          .status-pending { background-color: #fef3c7; color: #92400e; }
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
          .overall-status {
            text-align: center;
            padding: 10px;
            margin: 20px 0;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
          }
          @media print {
            body { margin: 0; font-size: 11px; }
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
        
        <div class="section-title">${isRTL ? 'معلومات المادة الخام' : 'Raw Material Information'}</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'اسم المورد' : 'Supplier Name'}:</div>
            <div>${formData.supplierName || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'اسم المادة' : 'Material Name'}:</div>
            <div>${formData.materialName || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'رقم اللوط' : 'Lot Number'}:</div>
            <div>${formData.lotNumber || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'الكمية' : 'Quantity'}:</div>
            <div>${formData.quantity || '_______________'} ${formData.unit || ''}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'تاريخ الاستلام' : 'Receipt Date'}:</div>
            <div>${formData.receiptDate || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'تاريخ الفحص' : 'Inspection Date'}:</div>
            <div>${formData.inspectionDate || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'اسم الفاحص' : 'Inspector Name'}:</div>
            <div>${formData.inspector || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'ظروف التخزين' : 'Storage Conditions'}:</div>
            <div>${formData.storageConditions || '_______________'}</div>
          </div>
        </div>
        
        <div class="section-title">${isRTL ? 'نتائج الفحص' : 'Inspection Results'}</div>
        <table>
          <tr>
            <th>${isRTL ? 'المعيار' : 'Parameter'}</th>
            <th>${isRTL ? 'المواصفة' : 'Specification'}</th>
            <th>${isRTL ? 'النتيجة' : 'Result'}</th>
            <th>${isRTL ? 'طريقة الفحص' : 'Test Method'}</th>
            <th>${isRTL ? 'الحالة' : 'Status'}</th>
            <th>${isRTL ? 'ملاحظات' : 'Remarks'}</th>
          </tr>
          ${inspectionItems
    .map(
      item => `
            <tr>
              <td>${item.parameter || '_______________'}</td>
              <td>${item.specification || '_______________'}</td>
              <td>${item.result || '_______________'}</td>
              <td>${item.method || '_______________'}</td>
              <td class="status-${item.status}">
                ${
  item.status === 'passed'
    ? isRTL
      ? 'مقبول'
      : 'Passed'
    : item.status === 'failed'
      ? isRTL
        ? 'مرفوض'
        : 'Failed'
      : isRTL
        ? 'قيد الانتظار'
        : 'Pending'
}
              </td>
              <td>${item.remarks || '_______________'}</td>
            </tr>
          `
    )
    .join('')}
        </table>
        
        <div class="overall-status status-${status}">
          ${isRTL ? 'القرار النهائي: ' : 'Overall Decision: '}
          ${
  status === 'passed'
    ? isRTL
      ? 'مقبول'
      : 'APPROVED'
    : status === 'failed'
      ? isRTL
        ? 'مرفوض'
        : 'REJECTED'
      : isRTL
        ? 'قيد الانتظار'
        : 'PENDING'
}
        </div>
        
        ${
  formData.remarks
    ? `
          <div class="section-title">${isRTL ? 'ملاحظات عامة' : 'General Remarks'}</div>
          <div style="border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
            ${formData.remarks}
          </div>
        `
    : ''
}
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">
              ${isRTL ? 'توقيع الفاحص' : 'Inspector Signature'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">${formData.inspector || '_______________'}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">
              ${isRTL ? 'توقيع مدير الجودة' : 'QA Manager Signature'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">_______________</div>
          </div>
        </div>
        
        <div class="footer">
          <div><strong>${isRTL ? tenantConfig.companyName : tenantConfig.companyNameEn}</strong></div>
          <div>${isRTL ? `تم الإنشاء في: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}` : `Created on: ${new Date().toLocaleDateString('en-US')} - ${new Date().toLocaleTimeString('en-US')}`}</div>
        </div>
      </body>
      </html>
    `;
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

  const status = overallStatus();

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
                <p className='text-sm text-gray-600'>{isRTL ? 'نظام ضمان الجودة' : 'Quality Assurance System'}</p>
              </div>
            </div>
            <div className='flex items-center space-x-2 rtl:space-x-reverse'>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className='mr-1'>
                  {status === 'passed'
                    ? isRTL
                      ? 'مقبول'
                      : 'Approved'
                    : status === 'failed'
                      ? isRTL
                        ? 'مرفوض'
                        : 'Rejected'
                      : isRTL
                        ? 'قيد المراجعة'
                        : 'Under Review'}
                </span>
              </div>
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

            {/* Inspection Parameters Table */}
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <Package className='ml-2 text-blue-600' size={20} />
                  {isRTL ? 'معايير الفحص' : 'Inspection Parameters'}
                </h3>
                <button
                  onClick={addInspectionItem}
                  className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                >
                  <Plus size={16} className='ml-1' />
                  {isRTL ? 'إضافة معيار' : 'Add Parameter'}
                </button>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full border border-gray-300 rounded-lg'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'المعيار' : 'Parameter'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'المواصفة المطلوبة' : 'Specification'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'النتيجة' : 'Result'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'طريقة الفحص' : 'Test Method'}
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'ملاحظات' : 'Remarks'}
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'إجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectionItems.map((item, index) => (
                      <tr key={index} className='border-b'>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={item.parameter}
                            onChange={e => handleInspectionItemChange(index, 'parameter', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'مثل: اللون' : 'e.g: Color'}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={item.specification}
                            onChange={e => handleInspectionItemChange(index, 'specification', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'مثل: أبيض' : 'e.g: White'}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={item.result}
                            onChange={e => handleInspectionItemChange(index, 'result', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'النتيجة' : 'Result'}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <select
                            value={item.method}
                            onChange={e => handleInspectionItemChange(index, 'method', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          >
                            <option value=''>{isRTL ? 'اختر...' : 'Select...'}</option>
                            <option value='visual'>{isRTL ? 'فحص بصري' : 'Visual Inspection'}</option>
                            <option value='chemical'>{isRTL ? 'تحليل كيميائي' : 'Chemical Analysis'}</option>
                            <option value='physical'>{isRTL ? 'فحص فيزيائي' : 'Physical Test'}</option>
                            <option value='microbiological'>
                              {isRTL ? 'فحص ميكروبيولوجي' : 'Microbiological Test'}
                            </option>
                          </select>
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <select
                            value={item.status}
                            onChange={e => handleInspectionItemChange(index, 'status', e.target.value)}
                            className={`p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(item.status)}`}
                          >
                            <option value='pending'>{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                            <option value='passed'>{isRTL ? 'مقبول' : 'Passed'}</option>
                            <option value='failed'>{isRTL ? 'مرفوض' : 'Failed'}</option>
                          </select>
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={item.remarks}
                            onChange={e => handleInspectionItemChange(index, 'remarks', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'ملاحظات' : 'Remarks'}
                          />
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <button
                            onClick={() => removeInspectionItem(index)}
                            disabled={inspectionItems.length === 1}
                            className={`p-2 rounded-lg transition-colors ${
                              inspectionItems.length === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Overall Status Summary */}
              <div className='mt-4 p-4 rounded-lg border'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{isRTL ? 'الحالة العامة:' : 'Overall Status:'}</span>
                  <div
                    className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}
                  >
                    {getStatusIcon(status)}
                    <span className='mr-2'>
                      {status === 'passed'
                        ? isRTL
                          ? 'جميع المعايير مقبولة'
                          : 'All Parameters Passed'
                        : status === 'failed'
                          ? isRTL
                            ? 'يوجد معايير مرفوضة'
                            : 'Some Parameters Failed'
                          : isRTL
                            ? 'قيد المراجعة'
                            : 'Under Review'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className='border-t pt-6'>
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>{isRTL ? 'توقيع الفاحص' : 'Inspector Signature'}</p>
                    <p className='font-medium'>{formData.inspector || '_______________'}</p>
                  </div>
                </div>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>{isRTL ? 'توقيع مدير الجودة' : 'QA Manager Signature'}</p>
                    <p className='font-medium'>_______________</p>
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

export default RawMaterialsInspectionForm;
