import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Download,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  Beaker,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const ProductionLineCleaningForm = () => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [cleaningSteps, setCleaningSteps] = useState([
    {
      step: '',
      area: '',
      method: '',
      cleaningAgent: '',
      concentration: '',
      contactTime: '',
      temperature: '',
      responsible: '',
      status: 'pending',
      verification: '',
      notes: ''
    }
  ]);

  // Form template for Production Line Cleaning
  const formTemplate = {
    id: 'production-line-cleaning',
    nameAr: 'سجل تنظيف خط الإنتاج',
    nameEn: 'Production Line Cleaning Record',
    category: 'hygiene',
    version: '1.0',
    fields: [
      {
        id: 'lineId',
        type: 'text',
        labelAr: 'رقم خط الإنتاج',
        labelEn: 'Production Line ID',
        required: true,
        placeholder: { ar: 'LINE-001', en: 'LINE-001' }
      },
      {
        id: 'lineName',
        type: 'text',
        labelAr: 'اسم خط الإنتاج',
        labelEn: 'Production Line Name',
        required: true,
        placeholder: { ar: 'خط إنتاج الكريمات', en: 'Cream Production Line' }
      },
      {
        id: 'previousProduct',
        type: 'text',
        labelAr: 'المنتج السابق',
        labelEn: 'Previous Product',
        required: true,
        placeholder: { ar: 'كريم مرطب', en: 'Moisturizing Cream' }
      },
      {
        id: 'nextProduct',
        type: 'text',
        labelAr: 'المنتج التالي',
        labelEn: 'Next Product',
        required: true,
        placeholder: { ar: 'كريم واقي الشمس', en: 'Sunscreen Cream' }
      },
      {
        id: 'cleaningDate',
        type: 'date',
        labelAr: 'تاريخ التنظيف',
        labelEn: 'Cleaning Date',
        required: true
      },
      {
        id: 'startTime',
        type: 'time',
        labelAr: 'وقت البداية',
        labelEn: 'Start Time',
        required: true
      },
      {
        id: 'endTime',
        type: 'time',
        labelEn: 'End Time',
        labelAr: 'وقت الانتهاء',
        required: true
      },
      {
        id: 'cleaningType',
        type: 'select',
        labelAr: 'نوع التنظيف',
        labelEn: 'Cleaning Type',
        required: true,
        options: [
          { value: 'routine', labelAr: 'تنظيف روتيني', labelEn: 'Routine Cleaning' },
          { value: 'changeover', labelAr: 'تنظيف تغيير المنتج', labelEn: 'Product Changeover' },
          { value: 'deep', labelAr: 'تنظيف عميق', labelEn: 'Deep Cleaning' },
          { value: 'sanitization', labelAr: 'تعقيم', labelEn: 'Sanitization' }
        ]
      },
      {
        id: 'teamLeader',
        type: 'text',
        labelAr: 'رئيس فريق التنظيف',
        labelEn: 'Cleaning Team Leader',
        required: true,
        placeholder: { ar: 'اسم رئيس الفريق', en: 'Team leader name' }
      },
      {
        id: 'numberOfWorkers',
        type: 'number',
        labelAr: 'عدد العمال',
        labelEn: 'Number of Workers',
        required: true,
        placeholder: { ar: '3', en: '3' }
      },
      {
        id: 'ambientTemperature',
        type: 'number',
        labelAr: 'درجة حرارة البيئة (°م)',
        labelEn: 'Ambient Temperature (°C)',
        required: false,
        placeholder: { ar: '22', en: '22' }
      },
      {
        id: 'humidity',
        type: 'number',
        labelAr: 'الرطوبة النسبية (%)',
        labelEn: 'Relative Humidity (%)',
        required: false,
        placeholder: { ar: '45', en: '45' }
      },
      {
        id: 'finalInspector',
        type: 'text',
        labelAr: 'مفتش التنظيف النهائي',
        labelEn: 'Final Cleaning Inspector',
        required: true,
        placeholder: { ar: 'اسم المفتش', en: 'Inspector name' }
      },
      {
        id: 'overallStatus',
        type: 'select',
        labelAr: 'الحالة العامة',
        labelEn: 'Overall Status',
        required: true,
        options: [
          { value: 'approved', labelAr: 'معتمد للإنتاج', labelEn: 'Approved for Production' },
          { value: 'rejected', labelAr: 'مرفوض - يحتاج إعادة تنظيف', labelEn: 'Rejected - Needs Re-cleaning' },
          { value: 'conditional', labelAr: 'معتمد بشروط', labelEn: 'Conditionally Approved' }
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

    // Set default date and time
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    setFormData(prev => ({
      ...prev,
      cleaningDate: today,
      startTime: now
    }));
  }, []);

  const isRTL = tenantConfig?.language === 'ar';

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...cleaningSteps];
    updatedSteps[index][field] = value;
    setCleaningSteps(updatedSteps);
  };

  const addStep = () => {
    setCleaningSteps([
      ...cleaningSteps,
      {
        step: '',
        area: '',
        method: '',
        cleaningAgent: '',
        concentration: '',
        contactTime: '',
        temperature: '',
        responsible: '',
        status: 'pending',
        verification: '',
        notes: ''
      }
    ]);
  };

  const removeStep = index => {
    if (cleaningSteps.length > 1) {
      setCleaningSteps(cleaningSteps.filter((_, i) => i !== index));
    }
  };

  // Calculate total cleaning time
  const calculateCleaningTime = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`1970-01-01T${formData.startTime}:00`);
      const end = new Date(`1970-01-01T${formData.endTime}:00`);
      const diffMs = end - start;
      return Math.max(0, Math.floor(diffMs / (1000 * 60))); // minutes
    }
    return 0;
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const completedSteps = cleaningSteps.filter(step => step.status === 'completed').length;
    return cleaningSteps.length > 0 ? Math.round((completedSteps / cleaningSteps.length) * 100) : 0;
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='text-green-600' size={16} />;
      case 'in_progress':
        return <AlertTriangle className='text-blue-600' size={16} />;
      case 'failed':
        return <XCircle className='text-red-600' size={16} />;
      default:
        return <AlertTriangle className='text-yellow-600' size={16} />;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

      // Validate cleaning steps
      const emptySteps = cleaningSteps.filter(step => !step.step || !step.area);
      if (emptySteps.length > 0) {
        alert(
          isRTL
            ? 'يرجى ملء جميع خطوات التنظيف أو حذف الصفوف الفارغة'
            : 'Please fill all cleaning steps or remove empty rows'
        );
        return;
      }

      const record = {
        id: Date.now(),
        formTemplateId: formTemplate.id,
        data: formData,
        cleaningSteps: cleaningSteps,
        totalTime: calculateCleaningTime(),
        completionPercentage: getCompletionPercentage(),
        createdAt: new Date().toISOString(),
        createdBy: formData.teamLeader || 'Unknown'
      };

      // Save to localStorage
      const existingRecords = JSON.parse(localStorage.getItem('cleaningRecords') || '[]');
      existingRecords.push(record);
      localStorage.setItem('cleaningRecords', JSON.stringify(existingRecords));

      alert(isRTL ? 'تم حفظ سجل التنظيف بنجاح!' : 'Cleaning record saved successfully!');

      // Clear form after successful save
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().slice(0, 5);
      setFormData({ cleaningDate: today, startTime: now });
      setCleaningSteps([
        {
          step: '',
          area: '',
          method: '',
          cleaningAgent: '',
          concentration: '',
          contactTime: '',
          temperature: '',
          responsible: '',
          status: 'pending',
          verification: '',
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
      a.download = `${formData.lineId || 'cleaning'}-${new Date().toISOString().split('T')[0]}.html`;
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
    const totalTime = calculateCleaningTime();
    const completionPercentage = getCompletionPercentage();

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
          .status-completed { background-color: #dcfce7; color: #166534; }
          .status-in_progress { background-color: #dbeafe; color: #1d4ed8; }
          .status-failed { background-color: #fecaca; color: #dc2626; }
          .status-pending { background-color: #fef3c7; color: #92400e; }
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
          .summary-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .progress-bar {
            width: 200px;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: ${completionPercentage === 100 ? '#10b981' : completionPercentage >= 75 ? '#3b82f6' : '#f59e0b'};
            width: ${completionPercentage}%;
            transition: width 0.3s ease;
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
        
        <div class="section-title">${isRTL ? 'معلومات خط الإنتاج' : 'Production Line Information'}</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'رقم خط الإنتاج' : 'Line ID'}:</div>
            <div>${formData.lineId || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'اسم خط الإنتاج' : 'Line Name'}:</div>
            <div>${formData.lineName || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'المنتج السابق' : 'Previous Product'}:</div>
            <div>${formData.previousProduct || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'المنتج التالي' : 'Next Product'}:</div>
            <div>${formData.nextProduct || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'تاريخ التنظيف' : 'Cleaning Date'}:</div>
            <div>${formData.cleaningDate || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'نوع التنظيف' : 'Cleaning Type'}:</div>
            <div>${formData.cleaningType || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'وقت البداية' : 'Start Time'}:</div>
            <div>${formData.startTime || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'وقت الانتهاء' : 'End Time'}:</div>
            <div>${formData.endTime || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'رئيس فريق التنظيف' : 'Team Leader'}:</div>
            <div>${formData.teamLeader || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'عدد العمال' : 'Number of Workers'}:</div>
            <div>${formData.numberOfWorkers || '_______________'}</div>
          </div>
        </div>
        
        <div class="summary-box">
          <div>
            <strong>${isRTL ? 'الحالة العامة:' : 'Overall Status:'}</strong> 
            <span class="status-${formData.overallStatus === 'approved' ? 'completed' : formData.overallStatus === 'rejected' ? 'failed' : 'pending'}" style="padding: 4px 8px; border-radius: 10px; margin-left: 10px;">
              ${
  formData.overallStatus === 'approved'
    ? isRTL
      ? 'معتمد للإنتاج'
      : 'Approved'
    : formData.overallStatus === 'rejected'
      ? isRTL
        ? 'مرفوض'
        : 'Rejected'
      : isRTL
        ? 'معتمد بشروط'
        : 'Conditional'
}
            </span>
          </div>
          <div>
            <strong>${isRTL ? 'إجمالي الوقت:' : 'Total Time:'}</strong> ${totalTime} ${isRTL ? 'دقيقة' : 'minutes'}
          </div>
          <div>
            <strong>${isRTL ? 'نسبة الإنجاز:' : 'Completion:'}</strong> 
            <div class="progress-bar" style="display: inline-block; margin-left: 10px;">
              <div class="progress-fill"></div>
            </div>
            ${completionPercentage}%
          </div>
        </div>
        
        <div class="section-title">${isRTL ? 'خطوات التنظيف التفصيلية' : 'Detailed Cleaning Steps'}</div>
        <table>
          <tr>
            <th>${isRTL ? 'الخطوة' : 'Step'}</th>
            <th>${isRTL ? 'المنطقة/المعدة' : 'Area/Equipment'}</th>
            <th>${isRTL ? 'طريقة التنظيف' : 'Method'}</th>
            <th>${isRTL ? 'مادة التنظيف' : 'Agent'}</th>
            <th>${isRTL ? 'التركيز' : 'Conc.'}</th>
            <th>${isRTL ? 'وقت التماس' : 'Contact Time'}</th>
            <th>${isRTL ? 'درجة الحرارة' : 'Temp.'}</th>
            <th>${isRTL ? 'المسؤول' : 'Responsible'}</th>
            <th>${isRTL ? 'الحالة' : 'Status'}</th>
            <th>${isRTL ? 'التحقق' : 'Verification'}</th>
          </tr>
          ${cleaningSteps
    .map(
      (step, index) => `
            <tr>
              <td>${index + 1}. ${step.step || '_______________'}</td>
              <td>${step.area || '_______________'}</td>
              <td>${step.method || '_______________'}</td>
              <td>${step.cleaningAgent || '_______________'}</td>
              <td>${step.concentration || '_______________'}</td>
              <td>${step.contactTime || '_______________'}</td>
              <td>${step.temperature || '_______________'}</td>
              <td>${step.responsible || '_______________'}</td>
              <td class="status-${step.status}">
                ${
  step.status === 'completed'
    ? isRTL
      ? 'مكتملة'
      : 'Completed'
    : step.status === 'in_progress'
      ? isRTL
        ? 'قيد التنفيذ'
        : 'In Progress'
      : step.status === 'failed'
        ? isRTL
          ? 'فشلت'
          : 'Failed'
        : isRTL
          ? 'في الانتظار'
          : 'Pending'
}
              </td>
              <td>${step.verification || '_______________'}</td>
            </tr>
          `
    )
    .join('')}
        </table>
        
        ${
  formData.ambientTemperature || formData.humidity
    ? `
          <div class="section-title">${isRTL ? 'الظروف البيئية' : 'Environmental Conditions'}</div>
          <div class="field-row">
            ${
  formData.ambientTemperature
    ? `
              <div class="field">
                <div class="field-label">${isRTL ? 'درجة الحرارة' : 'Temperature'}:</div>
                <div>${formData.ambientTemperature}°C</div>
              </div>
            `
    : ''
}
            ${
  formData.humidity
    ? `
              <div class="field">
                <div class="field-label">${isRTL ? 'الرطوبة النسبية' : 'Humidity'}:</div>
                <div>${formData.humidity}%</div>
              </div>
            `
    : ''
}
          </div>
        `
    : ''
}
        
        ${
  formData.generalNotes
    ? `
          <div class="section-title">${isRTL ? 'ملاحظات عامة' : 'General Notes'}</div>
          <div style="border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
            ${formData.generalNotes}
          </div>
        `
    : ''
}
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">
              ${isRTL ? 'توقيع رئيس فريق التنظيف' : 'Team Leader Signature'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">${formData.teamLeader || '_______________'}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">
              ${isRTL ? 'توقيع مفتش التنظيف' : 'Cleaning Inspector Signature'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">${formData.finalInspector || '_______________'}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">
              ${isRTL ? 'توقيع مدير ضمان الجودة' : 'QA Manager Signature'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">_______________</div>
          </div>
        </div>
        
        <div class="footer">
          <div><strong>${isRTL ? tenantConfig.companyName : tenantConfig.companyNameEn}</strong></div>
          <div>${isRTL ? `تم الإنشاء في: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}` : `Created on: ${new Date().toLocaleDateString('en-US')} - ${new Date().toLocaleTimeString('en-US')}`}</div>
          <div style="margin-top: 5px; font-weight: bold; color: #2563eb;">
            ${isRTL ? 'يجب الاحتفاظ بهذا السجل لمدة 3 سنوات حسب معايير GMP' : 'This record must be retained for 3 years per GMP standards'}
          </div>
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

      case 'time':
        return (
          <div key={field.id} className='mb-4'>
            <label className='block text-sm font-medium mb-2 text-gray-700'>
              {label} {field.required && <span className='text-red-500'>*</span>}
            </label>
            <input
              type='time'
              value={formData[field.id] || ''}
              onChange={e => handleInputChange(field.id, e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required={field.required}
            />
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

  const totalTime = calculateCleaningTime();
  const completionPercentage = getCompletionPercentage();

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
                  {isRTL ? 'نظام إدارة النظافة والتعقيم' : 'Hygiene & Sanitation Management System'}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2 rtl:space-x-reverse'>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  formData.overallStatus === 'approved'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : formData.overallStatus === 'rejected'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}
              >
                {formData.overallStatus === 'approved' ? '✓' : formData.overallStatus === 'rejected' ? '✗' : '⚠️'}
                <span className='mr-1'>
                  {formData.overallStatus === 'approved'
                    ? isRTL
                      ? 'معتمد'
                      : 'Approved'
                    : formData.overallStatus === 'rejected'
                      ? isRTL
                        ? 'مرفوض'
                        : 'Rejected'
                      : isRTL
                        ? 'بشروط'
                        : 'Conditional'}
                </span>
              </div>
              {completionPercentage > 0 && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    completionPercentage === 100
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : completionPercentage >= 75
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}
                >
                  {completionPercentage}% {isRTL ? 'مكتمل' : 'Complete'}
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
                  <Droplets className='text-blue-600' size={24} />
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

          {/* Progress Summary */}
          {totalTime > 0 && (
            <div className='bg-blue-50 border-l-4 border-blue-400 p-4 m-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <Beaker className='text-blue-600 ml-2' size={20} />
                  <span className='font-medium text-blue-800'>{isRTL ? 'ملخص التنظيف:' : 'Cleaning Summary:'}</span>
                </div>
                <div className='flex items-center space-x-4 rtl:space-x-reverse text-sm text-blue-700'>
                  <span>{isRTL ? `الوقت الكلي: ${totalTime} دقيقة` : `Total Time: ${totalTime} min`}</span>
                  <span>{isRTL ? `الإنجاز: ${completionPercentage}%` : `Progress: ${completionPercentage}%`}</span>
                  <span>{isRTL ? `الخطوات: ${cleaningSteps.length}` : `Steps: ${cleaningSteps.length}`}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className='p-6'>
            <div className='grid md:grid-cols-2 gap-6 mb-8'>{formTemplate.fields.map(field => renderField(field))}</div>

            {/* Cleaning Steps Table */}
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <Droplets className='ml-2 text-blue-600' size={20} />
                  {isRTL ? 'خطوات التنظيف التفصيلية' : 'Detailed Cleaning Steps'}
                </h3>
                <button
                  onClick={addStep}
                  className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                >
                  <Plus size={16} className='ml-1' />
                  {isRTL ? 'إضافة خطوة' : 'Add Step'}
                </button>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full border border-gray-300 rounded-lg'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'الخطوة' : 'Step'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'المنطقة/المعدة' : 'Area/Equipment'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'الطريقة' : 'Method'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'المادة' : 'Agent'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'التركيز' : 'Conc.'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'وقت التماس' : 'Contact Time'}
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium text-gray-700 border-b'>
                        {isRTL ? 'المسؤول' : 'Responsible'}
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
                    {cleaningSteps.map((step, index) => (
                      <tr key={index} className='border-b'>
                        <td className='px-3 py-3'>
                          <input
                            type='text'
                            value={step.step}
                            onChange={e => handleStepChange(index, 'step', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'مثل: إزالة البقايا' : 'e.g: Remove residue'}
                          />
                        </td>
                        <td className='px-3 py-3'>
                          <select
                            value={step.area}
                            onChange={e => handleStepChange(index, 'area', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          >
                            <option value=''>{isRTL ? 'اختر...' : 'Select...'}</option>
                            <option value='mixer'>{isRTL ? 'الخلاط' : 'Mixer'}</option>
                            <option value='pipes'>{isRTL ? 'الأنابيب' : 'Pipes'}</option>
                            <option value='tanks'>{isRTL ? 'الخزانات' : 'Tanks'}</option>
                            <option value='filters'>{isRTL ? 'المرشحات' : 'Filters'}</option>
                            <option value='packaging'>{isRTL ? 'التعبئة' : 'Packaging'}</option>
                            <option value='conveyor'>{isRTL ? 'الناقل' : 'Conveyor'}</option>
                            <option value='floor'>{isRTL ? 'الأرضية' : 'Floor'}</option>
                            <option value='walls'>{isRTL ? 'الجدران' : 'Walls'}</option>
                          </select>
                        </td>
                        <td className='px-3 py-3'>
                          <select
                            value={step.method}
                            onChange={e => handleStepChange(index, 'method', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          >
                            <option value=''>{isRTL ? 'اختر...' : 'Select...'}</option>
                            <option value='rinse'>{isRTL ? 'شطف' : 'Rinse'}</option>
                            <option value='wash'>{isRTL ? 'غسيل' : 'Wash'}</option>
                            <option value='sanitize'>{isRTL ? 'تعقيم' : 'Sanitize'}</option>
                            <option value='disassemble'>{isRTL ? 'فك' : 'Disassemble'}</option>
                            <option value='scrub'>{isRTL ? 'فرك' : 'Scrub'}</option>
                            <option value='steam'>{isRTL ? 'بخار' : 'Steam'}</option>
                          </select>
                        </td>
                        <td className='px-3 py-3'>
                          <select
                            value={step.cleaningAgent}
                            onChange={e => handleStepChange(index, 'cleaningAgent', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          >
                            <option value=''>{isRTL ? 'اختر...' : 'Select...'}</option>
                            <option value='water'>{isRTL ? 'ماء' : 'Water'}</option>
                            <option value='detergent'>{isRTL ? 'منظف' : 'Detergent'}</option>
                            <option value='alkaline'>{isRTL ? 'قلوي' : 'Alkaline'}</option>
                            <option value='acid'>{isRTL ? 'حمضي' : 'Acid'}</option>
                            <option value='alcohol'>{isRTL ? 'كحول' : 'Alcohol'}</option>
                            <option value='chlorine'>{isRTL ? 'كلور' : 'Chlorine'}</option>
                            <option value='steam'>{isRTL ? 'بخار' : 'Steam'}</option>
                          </select>
                        </td>
                        <td className='px-3 py-3'>
                          <input
                            type='text'
                            value={step.concentration}
                            onChange={e => handleStepChange(index, 'concentration', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? '2%' : '2%'}
                          />
                        </td>
                        <td className='px-3 py-3'>
                          <input
                            type='text'
                            value={step.contactTime}
                            onChange={e => handleStepChange(index, 'contactTime', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? '5 دقائق' : '5 min'}
                          />
                        </td>
                        <td className='px-3 py-3'>
                          <input
                            type='text'
                            value={step.responsible}
                            onChange={e => handleStepChange(index, 'responsible', e.target.value)}
                            className='w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'الاسم' : 'Name'}
                          />
                        </td>
                        <td className='px-3 py-3 text-center'>
                          <select
                            value={step.status}
                            onChange={e => handleStepChange(index, 'status', e.target.value)}
                            className={`p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(step.status)}`}
                          >
                            <option value='pending'>{isRTL ? 'انتظار' : 'Pending'}</option>
                            <option value='in_progress'>{isRTL ? 'تنفيذ' : 'In Progress'}</option>
                            <option value='completed'>{isRTL ? 'مكتمل' : 'Completed'}</option>
                            <option value='failed'>{isRTL ? 'فشل' : 'Failed'}</option>
                          </select>
                        </td>
                        <td className='px-3 py-3 text-center'>
                          <button
                            onClick={() => removeStep(index)}
                            disabled={cleaningSteps.length === 1}
                            className={`p-2 rounded-lg transition-colors ${
                              cleaningSteps.length === 1
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

              {/* Additional Step Details */}
              <div className='mt-4 space-y-4'>
                {cleaningSteps.map(
                  (step, index) =>
                    step.notes && (
                      <div key={index} className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>
                          {isRTL ? `ملاحظات الخطوة ${index + 1}:` : `Step ${index + 1} Notes:`} {step.step}
                        </h4>
                        <p className='text-sm text-gray-600'>{step.notes}</p>
                        {step.verification && (
                          <div className='mt-2'>
                            <span className='text-xs font-medium text-blue-600'>
                              {isRTL ? 'طريقة التحقق:' : 'Verification:'} {step.verification}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                )}

                {/* Add notes to current step */}
                <div className='grid md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2 text-gray-700'>
                      {isRTL ? 'ملاحظات الخطوة الأخيرة:' : 'Last Step Notes:'}
                    </label>
                    <textarea
                      value={cleaningSteps[cleaningSteps.length - 1]?.notes || ''}
                      onChange={e => handleStepChange(cleaningSteps.length - 1, 'notes', e.target.value)}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      rows={3}
                      placeholder={isRTL ? 'أضف ملاحظات للخطوة...' : 'Add step notes...'}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2 text-gray-700'>
                      {isRTL ? 'طريقة التحقق:' : 'Verification Method:'}
                    </label>
                    <select
                      value={cleaningSteps[cleaningSteps.length - 1]?.verification || ''}
                      onChange={e => handleStepChange(cleaningSteps.length - 1, 'verification', e.target.value)}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value=''>{isRTL ? 'اختر طريقة التحقق...' : 'Select verification method...'}</option>
                      <option value='visual'>{isRTL ? 'فحص بصري' : 'Visual Inspection'}</option>
                      <option value='swab'>{isRTL ? 'مسحة ميكروبية' : 'Microbial Swab'}</option>
                      <option value='atp'>{isRTL ? 'اختبار ATP' : 'ATP Test'}</option>
                      <option value='ph'>{isRTL ? 'قياس pH' : 'pH Measurement'}</option>
                      <option value='conductivity'>{isRTL ? 'قياس التوصيل' : 'Conductivity'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className='border-t pt-6'>
              <div className='grid md:grid-cols-3 gap-8'>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>
                      {isRTL ? 'توقيع رئيس فريق التنظيف' : 'Team Leader Signature'}
                    </p>
                    <p className='font-medium'>{formData.teamLeader || '_______________'}</p>
                  </div>
                </div>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>
                      {isRTL ? 'توقيع مفتش التنظيف' : 'Cleaning Inspector Signature'}
                    </p>
                    <p className='font-medium'>{formData.finalInspector || '_______________'}</p>
                  </div>
                </div>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>{isRTL ? 'توقيع مدير ضمان الجودة' : 'QA Manager Signature'}</p>
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

export default ProductionLineCleaningForm;
