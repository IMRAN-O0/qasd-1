import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Download,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const EquipmentCalibrationForm = () => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [calibrationPoints, setCalibrationPoints] = useState([
    {
      parameter: '',
      referenceValue: '',
      actualValue: '',
      deviation: '',
      tolerance: '',
      status: 'pending',
      adjustmentMade: '',
      finalValue: '',
      notes: ''
    }
  ]);

  // Form template for Equipment Calibration
  const formTemplate = {
    id: 'equipment-calibration',
    nameAr: 'سجل معايرة الأجهزة',
    nameEn: 'Equipment Calibration Record',
    category: 'calibration',
    version: '1.0',
    fields: [
      {
        id: 'equipmentId',
        type: 'text',
        labelAr: 'رقم الجهاز',
        labelEn: 'Equipment ID',
        required: true,
        placeholder: { ar: 'CAL-001', en: 'CAL-001' }
      },
      {
        id: 'equipmentName',
        type: 'text',
        labelAr: 'اسم الجهاز',
        labelEn: 'Equipment Name',
        required: true,
        placeholder: { ar: 'ميزان إلكتروني', en: 'Electronic Balance' }
      },
      {
        id: 'manufacturer',
        type: 'text',
        labelAr: 'الشركة المصنعة',
        labelEn: 'Manufacturer',
        required: true,
        placeholder: { ar: 'ساتوريوس', en: 'Sartorius' }
      },
      {
        id: 'model',
        type: 'text',
        labelAr: 'الموديل',
        labelEn: 'Model',
        required: true,
        placeholder: { ar: 'MSA225S', en: 'MSA225S' }
      },
      {
        id: 'serialNumber',
        type: 'text',
        labelAr: 'الرقم التسلسلي',
        labelEn: 'Serial Number',
        required: true,
        placeholder: { ar: '12345678', en: '12345678' }
      },
      {
        id: 'location',
        type: 'text',
        labelAr: 'الموقع',
        labelEn: 'Location',
        required: true,
        placeholder: { ar: 'مختبر ضمان الجودة', en: 'QC Laboratory' }
      },
      {
        id: 'calibrationDate',
        type: 'date',
        labelAr: 'تاريخ المعايرة',
        labelEn: 'Calibration Date',
        required: true
      },
      {
        id: 'nextCalibrationDate',
        type: 'date',
        labelAr: 'تاريخ المعايرة التالية',
        labelEn: 'Next Calibration Date',
        required: true
      },
      {
        id: 'technician',
        type: 'text',
        labelAr: 'فني المعايرة',
        labelEn: 'Calibration Technician',
        required: true,
        placeholder: { ar: 'اسم الفني', en: 'Technician name' }
      },
      {
        id: 'supervisor',
        type: 'text',
        labelAr: 'المشرف المعتمد',
        labelEn: 'Supervisor',
        required: true,
        placeholder: { ar: 'اسم المشرف', en: 'Supervisor name' }
      },
      {
        id: 'overallStatus',
        type: 'select',
        labelAr: 'حالة المعايرة',
        labelEn: 'Calibration Status',
        required: true,
        options: [
          { value: 'passed', labelAr: 'نجحت - الجهاز دقيق', labelEn: 'Passed - Equipment Accurate' },
          { value: 'adjusted', labelAr: 'تم التعديل - أصبح دقيق', labelEn: 'Adjusted - Now Accurate' },
          { value: 'failed', labelAr: 'فشلت - الجهاز غير دقيق', labelEn: 'Failed - Equipment Inaccurate' },
          { value: 'limited_use', labelAr: 'استخدام محدود', labelEn: 'Limited Use' }
        ]
      },
      {
        id: 'generalNotes',
        type: 'textarea',
        labelAr: 'ملاحظات عامة',
        labelEn: 'General Notes',
        required: false,
        placeholder: { ar: 'أدخل أي ملاحظات إضافية', en: 'Enter any additional notes' }
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

    // Set default date
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextCalDate = nextYear.toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      calibrationDate: today,
      nextCalibrationDate: nextCalDate
    }));
  }, []);

  const isRTL = tenantConfig?.language === 'ar';

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handlePointChange = (index, field, value) => {
    const updatedPoints = [...calibrationPoints];
    updatedPoints[index][field] = value;

    // Auto-calculate deviation when reference and actual values are entered
    if (
      (field === 'referenceValue' || field === 'actualValue') &&
      updatedPoints[index].referenceValue &&
      updatedPoints[index].actualValue
    ) {
      const ref = parseFloat(updatedPoints[index].referenceValue);
      const actual = parseFloat(updatedPoints[index].actualValue);
      if (!isNaN(ref) && !isNaN(actual)) {
        const deviation = actual - ref;
        updatedPoints[index].deviation = deviation.toFixed(4);

        // Auto-determine status based on tolerance
        if (updatedPoints[index].tolerance) {
          const tolerance = parseFloat(updatedPoints[index].tolerance);
          if (!isNaN(tolerance)) {
            const absDeviation = Math.abs(deviation);
            if (absDeviation <= tolerance) {
              updatedPoints[index].status = 'passed';
            } else if (absDeviation <= tolerance * 2) {
              updatedPoints[index].status = 'warning';
            } else {
              updatedPoints[index].status = 'failed';
            }
          }
        }
      }
    }

    setCalibrationPoints(updatedPoints);
  };

  const addPoint = () => {
    setCalibrationPoints([
      ...calibrationPoints,
      {
        parameter: '',
        referenceValue: '',
        actualValue: '',
        deviation: '',
        tolerance: '',
        status: 'pending',
        adjustmentMade: '',
        finalValue: '',
        notes: ''
      }
    ]);
  };

  const removePoint = index => {
    if (calibrationPoints.length > 1) {
      setCalibrationPoints(calibrationPoints.filter((_, i) => i !== index));
    }
  };

  // Calculate calibration statistics
  const getCalibrationStats = () => {
    const totalPoints = calibrationPoints.length;
    const passedPoints = calibrationPoints.filter(p => p.status === 'passed').length;
    const warningPoints = calibrationPoints.filter(p => p.status === 'warning').length;
    const failedPoints = calibrationPoints.filter(p => p.status === 'failed').length;
    const passRate = totalPoints > 0 ? Math.round((passedPoints / totalPoints) * 100) : 0;

    return { totalPoints, passedPoints, warningPoints, failedPoints, passRate };
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'passed':
        return <CheckCircle className='text-green-600' size={16} />;
      case 'warning':
        return <AlertTriangle className='text-yellow-600' size={16} />;
      case 'failed':
        return <XCircle className='text-red-600' size={16} />;
      default:
        return <AlertTriangle className='text-gray-600' size={16} />;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

      // Validate calibration points
      const emptyPoints = calibrationPoints.filter(point => !point.parameter || !point.referenceValue);
      if (emptyPoints.length > 0) {
        alert(
          isRTL
            ? 'يرجى ملء جميع نقاط المعايرة أو حذف الصفوف الفارغة'
            : 'Please fill all calibration points or remove empty rows'
        );
        return;
      }

      const stats = getCalibrationStats();
      const record = {
        id: Date.now(),
        formTemplateId: formTemplate.id,
        data: formData,
        calibrationPoints: calibrationPoints,
        statistics: stats,
        createdAt: new Date().toISOString(),
        createdBy: formData.technician || 'Unknown'
      };

      // Save to localStorage
      const existingRecords = JSON.parse(localStorage.getItem('calibrationRecords') || '[]');
      existingRecords.push(record);
      localStorage.setItem('calibrationRecords', JSON.stringify(existingRecords));

      alert(isRTL ? 'تم حفظ سجل المعايرة بنجاح!' : 'Calibration record saved successfully!');

      // Clear form after successful save
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextCalDate = nextYear.toISOString().split('T')[0];

      setFormData({ calibrationDate: today, nextCalibrationDate: nextCalDate });
      setCalibrationPoints([
        {
          parameter: '',
          referenceValue: '',
          actualValue: '',
          deviation: '',
          tolerance: '',
          status: 'pending',
          adjustmentMade: '',
          finalValue: '',
          notes: ''
        }
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
      a.download = `${formData.equipmentId || 'calibration'}-${new Date().toISOString().split('T')[0]}.html`;
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
    const stats = getCalibrationStats();

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
          th, td { border: 1px solid #333; padding: 6px; text-align: ${isRTL ? 'right' : 'left'}; font-size: 10px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .status-passed { background-color: #dcfce7; color: #166534; }
          .status-warning { background-color: #fef3c7; color: #92400e; }
          .status-failed { background-color: #fecaca; color: #dc2626; }
          .status-pending { background-color: #f3f4f6; color: #6b7280; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-around; }
          .signature-box { text-align: center; width: 180px; }
          .signature-line { border-top: 1px solid #333; margin-top: 30px; padding-top: 5px; }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 10px; 
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          .stats-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .cert-box {
            border: 2px solid #2563eb;
            background: #eff6ff;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            border-radius: 10px;
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
        
        <div class="section-title">${isRTL ? 'معلومات الجهاز' : 'Equipment Information'}</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'رقم الجهاز' : 'Equipment ID'}:</div>
            <div><strong>${formData.equipmentId || '_______________'}</strong></div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'اسم الجهاز' : 'Equipment Name'}:</div>
            <div>${formData.equipmentName || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'تاريخ المعايرة' : 'Calibration Date'}:</div>
            <div><strong>${formData.calibrationDate || '_______________'}</strong></div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'تاريخ المعايرة التالية' : 'Next Calibration'}:</div>
            <div style="color: #dc2626; font-weight: bold;">${formData.nextCalibrationDate || '_______________'}</div>
          </div>
        </div>
        
        <div class="stats-box">
          <div><strong>${isRTL ? 'إجمالي النقاط:' : 'Total Points:'}</strong> ${stats.totalPoints}</div>
          <div><strong>${isRTL ? 'نجح:' : 'Passed:'}</strong> <span style="color: #16a34a;">${stats.passedPoints}</span></div>
          <div><strong>${isRTL ? 'تحذير:' : 'Warning:'}</strong> <span style="color: #ca8a04;">${stats.warningPoints}</span></div>
          <div><strong>${isRTL ? 'فشل:' : 'Failed:'}</strong> <span style="color: #dc2626;">${stats.failedPoints}</span></div>
          <div><strong>${isRTL ? 'معدل النجاح:' : 'Pass Rate:'}</strong> 
            <span style="color: ${stats.passRate >= 90 ? '#16a34a' : stats.passRate >= 70 ? '#ca8a04' : '#dc2626'}; font-weight: bold;">
              ${stats.passRate}%
            </span>
          </div>
        </div>
        
        <div class="section-title">${isRTL ? 'نقاط المعايرة التفصيلية' : 'Detailed Calibration Points'}</div>
        <table>
          <tr>
            <th>${isRTL ? 'المعيار' : 'Parameter'}</th>
            <th>${isRTL ? 'القيمة المرجعية' : 'Reference Value'}</th>
            <th>${isRTL ? 'القيمة الفعلية' : 'Actual Value'}</th>
            <th>${isRTL ? 'الانحراف' : 'Deviation'}</th>
            <th>${isRTL ? 'حد التحمل' : 'Tolerance'}</th>
            <th>${isRTL ? 'الحالة' : 'Status'}</th>
          </tr>
          ${calibrationPoints
    .map(
      (point, index) => `
            <tr>
              <td>${point.parameter || '_______________'}</td>
              <td>${point.referenceValue || '_______________'}</td>
              <td>${point.actualValue || '_______________'}</td>
              <td style="${point.deviation && Math.abs(parseFloat(point.deviation)) > 0 ? 'font-weight: bold;' : ''}">${point.deviation || '_______________'}</td>
              <td>${point.tolerance || '_______________'}</td>
              <td class="status-${point.status}">
                ${
  point.status === 'passed'
    ? isRTL
      ? 'نجح'
      : 'Passed'
    : point.status === 'warning'
      ? isRTL
        ? 'تحذير'
        : 'Warning'
      : point.status === 'failed'
        ? isRTL
          ? 'فشل'
          : 'Failed'
        : isRTL
          ? 'انتظار'
          : 'Pending'
}
              </td>
            </tr>
          `
    )
    .join('')}
        </table>
        
        ${
  formData.overallStatus
    ? `
          <div class="cert-box">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
              ${isRTL ? 'شهادة المعايرة' : 'CALIBRATION CERTIFICATE'}
            </div>
            <div style="font-size: 14px; margin-bottom: 10px;">
              <strong>${isRTL ? 'الحالة النهائية:' : 'Final Status:'}</strong>
              <span style="padding: 5px 10px; border-radius: 15px; margin-left: 10px; background: ${formData.overallStatus === 'passed' ? '#dcfce7' : formData.overallStatus === 'adjusted' ? '#fef3c7' : '#fecaca'};">
                ${
  formData.overallStatus === 'passed'
    ? isRTL
      ? 'نجحت - الجهاز دقيق'
      : 'PASSED - Equipment Accurate'
    : formData.overallStatus === 'adjusted'
      ? isRTL
        ? 'تم التعديل - أصبح دقيق'
        : 'ADJUSTED - Now Accurate'
      : formData.overallStatus === 'failed'
        ? isRTL
          ? 'فشلت - الجهاز غير دقيق'
          : 'FAILED - Equipment Inaccurate'
        : isRTL
          ? 'استخدام محدود'
          : 'LIMITED USE'
}
              </span>
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              ${isRTL ? 'هذه الشهادة صالحة حتى:' : 'This certificate is valid until:'} <strong>${formData.nextCalibrationDate || '_______________'}</strong>
            </div>
          </div>
        `
    : ''
}
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">
              ${isRTL ? 'توقيع فني المعايرة' : 'Calibration Technician'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">${formData.technician || '_______________'}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">
              ${isRTL ? 'توقيع المشرف المعتمد' : 'Authorized Supervisor'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">${formData.supervisor || '_______________'}</div>
          </div>
        </div>
        
        <div class="footer">
          <div><strong>${isRTL ? tenantConfig.companyName : tenantConfig.companyNameEn}</strong></div>
          <div>${isRTL ? `تم الإنشاء في: ${new Date().toLocaleDateString('ar-SA')}` : `Created on: ${new Date().toLocaleDateString('en-US')}`}</div>
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

  const stats = getCalibrationStats();

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
                <p className='text-sm text-gray-600'>
                  {isRTL ? 'نظام إدارة المعايرة' : 'Calibration Management System'}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2 rtl:space-x-reverse'>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  formData.overallStatus === 'passed'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : formData.overallStatus === 'adjusted'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : formData.overallStatus === 'failed'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {formData.overallStatus === 'passed'
                  ? '✓'
                  : formData.overallStatus === 'adjusted'
                    ? '⚙️'
                    : formData.overallStatus === 'failed'
                      ? '✗'
                      : '⚠️'}
                <span className='mr-1'>
                  {formData.overallStatus === 'passed'
                    ? isRTL
                      ? 'دقيق'
                      : 'Accurate'
                    : formData.overallStatus === 'adjusted'
                      ? isRTL
                        ? 'معدل'
                        : 'Adjusted'
                      : formData.overallStatus === 'failed'
                        ? isRTL
                          ? 'فاشل'
                          : 'Failed'
                        : isRTL
                          ? 'محدود'
                          : 'Limited'}
                </span>
              </div>
              {stats.totalPoints > 0 && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    stats.passRate >= 90
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : stats.passRate >= 70
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {stats.passRate}% {isRTL ? 'نجح' : 'Pass'}
                </div>
              )}
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
      <div className='max-w-5xl mx-auto px-4 py-8'>
        <div className='bg-white rounded-lg shadow-lg'>
          {/* Form Header */}
          <div className='border-b border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4 rtl:space-x-reverse'>
                <div className='bg-blue-100 p-3 rounded-lg'>
                  <Gauge className='text-blue-600' size={24} />
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

          {/* Statistics Summary */}
          {stats.totalPoints > 0 && (
            <div className='bg-blue-50 border-l-4 border-blue-400 p-4 m-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <TrendingUp className='text-blue-600 ml-2' size={20} />
                  <span className='font-medium text-blue-800'>
                    {isRTL ? 'إحصائيات المعايرة:' : 'Calibration Statistics:'}
                  </span>
                </div>
                <div className='flex items-center space-x-6 rtl:space-x-reverse text-sm'>
                  <span className='text-green-700'>
                    {isRTL ? `نجح: ${stats.passedPoints}` : `Passed: ${stats.passedPoints}`}
                  </span>
                  <span className='text-yellow-700'>
                    {isRTL ? `تحذير: ${stats.warningPoints}` : `Warning: ${stats.warningPoints}`}
                  </span>
                  <span className='text-red-700'>
                    {isRTL ? `فشل: ${stats.failedPoints}` : `Failed: ${stats.failedPoints}`}
                  </span>
                  <span className='text-blue-700 font-bold'>
                    {isRTL ? `معدل النجاح: ${stats.passRate}%` : `Pass Rate: ${stats.passRate}%`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className='p-6'>
            <div className='grid md:grid-cols-2 gap-6 mb-8'>{formTemplate.fields.map(field => renderField(field))}</div>

            {/* Calibration Points Table */}
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <Target className='ml-2 text-blue-600' size={20} />
                  {isRTL ? 'نقاط المعايرة التفصيلية' : 'Detailed Calibration Points'}
                </h3>
                <button
                  onClick={addPoint}
                  className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                >
                  <Plus size={16} className='ml-1' />
                  {isRTL ? 'إضافة نقطة' : 'Add Point'}
                </button>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full border border-gray-300 rounded-lg'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'المعيار' : 'Parameter'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'القيمة المرجعية' : 'Reference Value'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'القيمة الفعلية' : 'Actual Value'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'الانحراف' : 'Deviation'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'حد التحمل' : 'Tolerance'}
                      </th>
                      <th className='px-3 py-3 text-center text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className='px-3 py-3 text-center text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'إجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calibrationPoints.map((point, index) => (
                      <tr key={index} className='border-b'>
                        <td className='px-3 py-3'>
                          <select
                            value={point.parameter}
                            onChange={e => handlePointChange(index, 'parameter', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          >
                            <option value=''>{isRTL ? 'اختر المعيار...' : 'Select parameter...'}</option>
                            <option value='weight_100g'>{isRTL ? 'وزن 100 جرام' : 'Weight 100g'}</option>
                            <option value='weight_200g'>{isRTL ? 'وزن 200 جرام' : 'Weight 200g'}</option>
                            <option value='weight_500g'>{isRTL ? 'وزن 500 جرام' : 'Weight 500g'}</option>
                            <option value='temperature_25c'>{isRTL ? 'درجة حرارة 25°م' : 'Temperature 25°C'}</option>
                            <option value='ph_7'>{isRTL ? 'pH 7.0' : 'pH 7.0'}</option>
                            <option value='volume_100ml'>{isRTL ? 'حجم 100 مل' : 'Volume 100ml'}</option>
                          </select>
                        </td>
                        <td className='px-3 py-3'>
                          <input
                            type='number'
                            step='any'
                            value={point.referenceValue}
                            onChange={e => handlePointChange(index, 'referenceValue', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='100.00'
                          />
                        </td>
                        <td className='px-3 py-3'>
                          <input
                            type='number'
                            step='any'
                            value={point.actualValue}
                            onChange={e => handlePointChange(index, 'actualValue', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='100.05'
                          />
                        </td>
                        <td className='px-3 py-3'>
                          <input
                            type='text'
                            value={point.deviation}
                            readOnly
                            className={`w-full p-2 text-sm border border-gray-300 rounded bg-gray-50 ${
                              point.deviation && Math.abs(parseFloat(point.deviation)) > 0 ? 'font-bold' : ''
                            }`}
                            placeholder={isRTL ? 'تلقائي' : 'Auto'}
                          />
                        </td>
                        <td className='px-3 py-3'>
                          <input
                            type='number'
                            step='any'
                            value={point.tolerance}
                            onChange={e => handlePointChange(index, 'tolerance', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='±0.01'
                          />
                        </td>
                        <td className='px-3 py-3 text-center'>
                          <select
                            value={point.status}
                            onChange={e => handlePointChange(index, 'status', e.target.value)}
                            className={`p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(point.status)}`}
                          >
                            <option value='pending'>{isRTL ? 'انتظار' : 'Pending'}</option>
                            <option value='passed'>{isRTL ? 'نجح' : 'Passed'}</option>
                            <option value='warning'>{isRTL ? 'تحذير' : 'Warning'}</option>
                            <option value='failed'>{isRTL ? 'فشل' : 'Failed'}</option>
                          </select>
                        </td>
                        <td className='px-3 py-3 text-center'>
                          <button
                            onClick={() => removePoint(index)}
                            disabled={calibrationPoints.length === 1}
                            className={`p-2 rounded-lg transition-colors ${
                              calibrationPoints.length === 1
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
            </div>

            {/* Signature Section */}
            <div className='border-t pt-6'>
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>{isRTL ? 'توقيع فني المعايرة' : 'Calibration Technician'}</p>
                    <p className='font-medium'>{formData.technician || '_______________'}</p>
                  </div>
                </div>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>{isRTL ? 'توقيع المشرف المعتمد' : 'Authorized Supervisor'}</p>
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

export default EquipmentCalibrationForm;
