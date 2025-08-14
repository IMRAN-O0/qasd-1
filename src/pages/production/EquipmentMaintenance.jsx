import React, { useState, useEffect } from 'react';
import {
  Settings,
  Download,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const EquipmentMaintenanceForm = () => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [maintenanceTasks, setMaintenanceTasks] = useState([
    {
      task: '',
      description: '',
      status: 'pending',
      startTime: '',
      endTime: '',
      technician: '',
      spareParts: '',
      notes: ''
    }
  ]);

  // Form template for Equipment Maintenance
  const formTemplate = {
    id: 'equipment-maintenance',
    nameAr: 'سجل صيانة المعدات',
    nameEn: 'Equipment Maintenance Record',
    category: 'maintenance',
    version: '1.0',
    fields: [
      {
        id: 'equipmentId',
        type: 'text',
        labelAr: 'رقم المعدة',
        labelEn: 'Equipment ID',
        required: true,
        placeholder: { ar: 'EQ-001', en: 'EQ-001' }
      },
      {
        id: 'equipmentName',
        type: 'text',
        labelAr: 'اسم المعدة',
        labelEn: 'Equipment Name',
        required: true,
        placeholder: { ar: 'آلة الخلط الرئيسية', en: 'Main Mixing Machine' }
      },
      {
        id: 'location',
        type: 'text',
        labelAr: 'الموقع',
        labelEn: 'Location',
        required: true,
        placeholder: { ar: 'خط الإنتاج رقم 1', en: 'Production Line 1' }
      },
      {
        id: 'maintenanceType',
        type: 'select',
        labelAr: 'نوع الصيانة',
        labelEn: 'Maintenance Type',
        required: true,
        options: [
          { value: 'preventive', labelAr: 'صيانة وقائية', labelEn: 'Preventive' },
          { value: 'corrective', labelAr: 'صيانة تصحيحية', labelEn: 'Corrective' },
          { value: 'emergency', labelAr: 'صيانة طارئة', labelEn: 'Emergency' },
          { value: 'scheduled', labelAr: 'صيانة مجدولة', labelEn: 'Scheduled' }
        ]
      },
      {
        id: 'maintenanceDate',
        type: 'date',
        labelAr: 'تاريخ الصيانة',
        labelEn: 'Maintenance Date',
        required: true
      },
      {
        id: 'requestedBy',
        type: 'text',
        labelAr: 'طلب بواسطة',
        labelEn: 'Requested By',
        required: true,
        placeholder: { ar: 'اسم مشرف الإنتاج', en: 'Production Supervisor Name' }
      },
      {
        id: 'maintenanceTeamLeader',
        type: 'text',
        labelAr: 'رئيس فريق الصيانة',
        labelEn: 'Maintenance Team Leader',
        required: true,
        placeholder: { ar: 'اسم رئيس الفريق', en: 'Team Leader Name' }
      },
      {
        id: 'priority',
        type: 'select',
        labelAr: 'مستوى الأولوية',
        labelEn: 'Priority Level',
        required: true,
        options: [
          { value: 'low', labelAr: 'منخفض', labelEn: 'Low' },
          { value: 'medium', labelAr: 'متوسط', labelEn: 'Medium' },
          { value: 'high', labelAr: 'عالي', labelEn: 'High' },
          { value: 'critical', labelAr: 'حرج', labelEn: 'Critical' }
        ]
      },
      {
        id: 'downtime',
        type: 'number',
        labelAr: 'وقت التوقف (دقيقة)',
        labelEn: 'Downtime (minutes)',
        required: false,
        placeholder: { ar: '60', en: '60' }
      },
      {
        id: 'nextMaintenanceDate',
        type: 'date',
        labelAr: 'تاريخ الصيانة التالية',
        labelEn: 'Next Maintenance Date',
        required: false
      },
      {
        id: 'overallStatus',
        type: 'select',
        labelAr: 'الحالة العامة',
        labelEn: 'Overall Status',
        required: true,
        options: [
          { value: 'completed', labelAr: 'مكتملة', labelEn: 'Completed' },
          { value: 'in_progress', labelAr: 'قيد التنفيذ', labelEn: 'In Progress' },
          { value: 'pending', labelAr: 'في الانتظار', labelEn: 'Pending' },
          { value: 'cancelled', labelAr: 'ملغية', labelEn: 'Cancelled' }
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
    setFormData(prev => ({
      ...prev,
      maintenanceDate: today
    }));
  }, []);

  const isRTL = tenantConfig?.language === 'ar';

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...maintenanceTasks];
    updatedTasks[index][field] = value;
    setMaintenanceTasks(updatedTasks);
  };

  const addTask = () => {
    setMaintenanceTasks([
      ...maintenanceTasks,
      {
        task: '',
        description: '',
        status: 'pending',
        startTime: '',
        endTime: '',
        technician: '',
        spareParts: '',
        notes: ''
      }
    ]);
  };

  const removeTask = index => {
    if (maintenanceTasks.length > 1) {
      setMaintenanceTasks(maintenanceTasks.filter((_, i) => i !== index));
    }
  };

  // Calculate total maintenance time
  const calculateTotalTime = () => {
    return maintenanceTasks.reduce((total, task) => {
      if (task.startTime && task.endTime) {
        const start = new Date(`1970-01-01T${task.startTime}:00`);
        const end = new Date(`1970-01-01T${task.endTime}:00`);
        const diffMs = end - start;
        const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
        return total + diffMins;
      }
      return total;
    }, 0);
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='text-green-600' size={16} />;
      case 'in_progress':
        return <Clock className='text-blue-600' size={16} />;
      case 'pending':
        return <AlertCircle className='text-yellow-600' size={16} />;
      default:
        return <AlertCircle className='text-gray-600' size={16} />;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
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

      // Validate maintenance tasks
      const emptyTasks = maintenanceTasks.filter(task => !task.task || !task.description);
      if (emptyTasks.length > 0) {
        alert(
          isRTL
            ? 'يرجى ملء جميع مهام الصيانة أو حذف الصفوف الفارغة'
            : 'Please fill all maintenance tasks or remove empty rows'
        );
        return;
      }

      const record = {
        id: Date.now(),
        formTemplateId: formTemplate.id,
        data: formData,
        maintenanceTasks: maintenanceTasks,
        totalTime: calculateTotalTime(),
        createdAt: new Date().toISOString(),
        createdBy: formData.maintenanceTeamLeader || 'Unknown'
      };

      // Save to localStorage
      const existingRecords = JSON.parse(localStorage.getItem('maintenanceRecords') || '[]');
      existingRecords.push(record);
      localStorage.setItem('maintenanceRecords', JSON.stringify(existingRecords));

      alert(isRTL ? 'تم حفظ سجل الصيانة بنجاح!' : 'Maintenance record saved successfully!');

      // Clear form after successful save
      const today = new Date().toISOString().split('T')[0];
      setFormData({ maintenanceDate: today });
      setMaintenanceTasks([
        {
          task: '',
          description: '',
          status: 'pending',
          startTime: '',
          endTime: '',
          technician: '',
          spareParts: '',
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
      a.download = `${formData.equipmentId || 'maintenance'}-${new Date().toISOString().split('T')[0]}.html`;
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
    const totalTime = calculateTotalTime();
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
          .status-completed { background-color: #dcfce7; color: #166534; }
          .status-in_progress { background-color: #dbeafe; color: #1d4ed8; }
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .priority-critical { background-color: #fecaca; color: #dc2626; font-weight: bold; }
          .priority-high { background-color: #fed7aa; color: #ea580c; }
          .priority-medium { background-color: #fef3c7; color: #ca8a04; }
          .priority-low { background-color: #dcfce7; color: #16a34a; }
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
          .summary-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
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
        
        <div class="section-title">${isRTL ? 'معلومات المعدة' : 'Equipment Information'}</div>
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'رقم المعدة' : 'Equipment ID'}:</div>
            <div>${formData.equipmentId || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'اسم المعدة' : 'Equipment Name'}:</div>
            <div>${formData.equipmentName || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'الموقع' : 'Location'}:</div>
            <div>${formData.location || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'نوع الصيانة' : 'Maintenance Type'}:</div>
            <div>${formData.maintenanceType || '_______________'}</div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'تاريخ الصيانة' : 'Maintenance Date'}:</div>
            <div>${formData.maintenanceDate || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'مستوى الأولوية' : 'Priority Level'}:</div>
            <div class="priority-${formData.priority}" style="padding: 2px 8px; border-radius: 10px; display: inline-block;">
              ${formData.priority || '_______________'}
            </div>
          </div>
        </div>
        
        <div class="field-row">
          <div class="field">
            <div class="field-label">${isRTL ? 'طلب بواسطة' : 'Requested By'}:</div>
            <div>${formData.requestedBy || '_______________'}</div>
          </div>
          <div class="field">
            <div class="field-label">${isRTL ? 'رئيس فريق الصيانة' : 'Team Leader'}:</div>
            <div>${formData.maintenanceTeamLeader || '_______________'}</div>
          </div>
        </div>
        
        <div class="summary-box">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div><strong>${isRTL ? 'الحالة العامة:' : 'Overall Status:'}</strong> 
              <span class="status-${formData.overallStatus}" style="padding: 4px 8px; border-radius: 10px; margin-left: 10px;">
                ${formData.overallStatus || 'غير محدد'}
              </span>
            </div>
            <div><strong>${isRTL ? 'إجمالي الوقت:' : 'Total Time:'}</strong> ${totalTime} ${isRTL ? 'دقيقة' : 'minutes'}</div>
            ${formData.downtime ? `<div><strong>${isRTL ? 'وقت التوقف:' : 'Downtime:'}</strong> ${formData.downtime} ${isRTL ? 'دقيقة' : 'minutes'}</div>` : ''}
          </div>
        </div>
        
        <div class="section-title">${isRTL ? 'مهام الصيانة' : 'Maintenance Tasks'}</div>
        <table>
          <tr>
            <th>${isRTL ? 'المهمة' : 'Task'}</th>
            <th>${isRTL ? 'الوصف' : 'Description'}</th>
            <th>${isRTL ? 'الفني' : 'Technician'}</th>
            <th>${isRTL ? 'وقت البداية' : 'Start Time'}</th>
            <th>${isRTL ? 'وقت الانتهاء' : 'End Time'}</th>
            <th>${isRTL ? 'قطع الغيار' : 'Spare Parts'}</th>
            <th>${isRTL ? 'الحالة' : 'Status'}</th>
          </tr>
          ${maintenanceTasks
    .map(
      task => `
            <tr>
              <td>${task.task || '_______________'}</td>
              <td>${task.description || '_______________'}</td>
              <td>${task.technician || '_______________'}</td>
              <td>${task.startTime || '_______________'}</td>
              <td>${task.endTime || '_______________'}</td>
              <td>${task.spareParts || '_______________'}</td>
              <td class="status-${task.status}">
                ${
  task.status === 'completed'
    ? isRTL
      ? 'مكتملة'
      : 'Completed'
    : task.status === 'in_progress'
      ? isRTL
        ? 'قيد التنفيذ'
        : 'In Progress'
      : isRTL
        ? 'في الانتظار'
        : 'Pending'
}
              </td>
            </tr>
          `
    )
    .join('')}
        </table>
        
        ${
  formData.nextMaintenanceDate
    ? `
          <div class="field-row">
            <div class="field">
              <div class="field-label">${isRTL ? 'تاريخ الصيانة التالية' : 'Next Maintenance Date'}:</div>
              <div style="font-weight: bold; color: #dc2626;">${formData.nextMaintenanceDate}</div>
            </div>
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
              ${isRTL ? 'توقيع رئيس فريق الصيانة' : 'Team Leader Signature'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">${formData.maintenanceTeamLeader || '_______________'}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">
              ${isRTL ? 'توقيع مدير الصيانة' : 'Maintenance Manager Signature'}
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

  const totalTime = calculateTotalTime();

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
                  {isRTL ? 'نظام إدارة الصيانة' : 'Maintenance Management System'}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2 rtl:space-x-reverse'>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(formData.overallStatus || 'pending')}`}
              >
                {getStatusIcon(formData.overallStatus || 'pending')}
                <span className='mr-1'>
                  {formData.overallStatus === 'completed'
                    ? isRTL
                      ? 'مكتملة'
                      : 'Completed'
                    : formData.overallStatus === 'in_progress'
                      ? isRTL
                        ? 'قيد التنفيذ'
                        : 'In Progress'
                      : isRTL
                        ? 'في الانتظار'
                        : 'Pending'}
                </span>
              </div>
              {formData.priority && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(formData.priority)}`}
                >
                  {isRTL
                    ? formData.priority === 'critical'
                      ? 'حرج'
                      : formData.priority === 'high'
                        ? 'عالي'
                        : formData.priority === 'medium'
                          ? 'متوسط'
                          : 'منخفض'
                    : formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
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
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='bg-white rounded-lg shadow-lg'>
          {/* Form Header */}
          <div className='border-b border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4 rtl:space-x-reverse'>
                <div className='bg-blue-100 p-3 rounded-lg'>
                  <Settings className='text-blue-600' size={24} />
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

            {/* Maintenance Tasks Table */}
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <Wrench className='ml-2 text-blue-600' size={20} />
                  {isRTL ? 'مهام الصيانة' : 'Maintenance Tasks'}
                </h3>
                <div className='flex items-center space-x-4 rtl:space-x-reverse'>
                  <div className='text-sm text-gray-600'>
                    {isRTL ? `إجمالي الوقت: ${totalTime} دقيقة` : `Total Time: ${totalTime} minutes`}
                  </div>
                  <button
                    onClick={addTask}
                    className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                  >
                    <Plus size={16} className='ml-1' />
                    {isRTL ? 'إضافة مهمة' : 'Add Task'}
                  </button>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full border border-gray-300 rounded-lg'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'المهمة' : 'Task'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'الوصف' : 'Description'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'الفني' : 'Technician'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'وقت البداية' : 'Start Time'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'وقت الانتهاء' : 'End Time'}
                      </th>
                      <th className='px-4 py-3 text-right text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'قطع الغيار' : 'Spare Parts'}
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-medium text-gray-700 border-b'>
                        {isRTL ? 'إجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceTasks.map((task, index) => (
                      <tr key={index} className='border-b'>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={task.task}
                            onChange={e => handleTaskChange(index, 'task', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'مثل: تشحيم المحامل' : 'e.g: Lubricate bearings'}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <textarea
                            value={task.description}
                            onChange={e => handleTaskChange(index, 'description', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            rows={2}
                            placeholder={isRTL ? 'وصف تفصيلي للمهمة' : 'Detailed task description'}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={task.technician}
                            onChange={e => handleTaskChange(index, 'technician', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'اسم الفني' : 'Technician name'}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='time'
                            value={task.startTime}
                            onChange={e => handleTaskChange(index, 'startTime', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='time'
                            value={task.endTime}
                            onChange={e => handleTaskChange(index, 'endTime', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={task.spareParts}
                            onChange={e => handleTaskChange(index, 'spareParts', e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder={isRTL ? 'قطع الغيار المستخدمة' : 'Used spare parts'}
                          />
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <select
                            value={task.status}
                            onChange={e => handleTaskChange(index, 'status', e.target.value)}
                            className={`p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(task.status)}`}
                          >
                            <option value='pending'>{isRTL ? 'في الانتظار' : 'Pending'}</option>
                            <option value='in_progress'>{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
                            <option value='completed'>{isRTL ? 'مكتملة' : 'Completed'}</option>
                          </select>
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <button
                            onClick={() => removeTask(index)}
                            disabled={maintenanceTasks.length === 1}
                            className={`p-2 rounded-lg transition-colors ${
                              maintenanceTasks.length === 1
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

              {/* Task Notes */}
              <div className='mt-4'>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  {isRTL ? 'ملاحظات إضافية على المهام:' : 'Additional Task Notes:'}
                </h4>
                {maintenanceTasks.map(
                  (task, index) =>
                    task.notes && (
                      <div key={index} className='mb-2 p-3 bg-gray-50 rounded-lg'>
                        <div className='text-sm font-medium text-gray-600'>
                          {task.task || `${isRTL ? 'المهمة' : 'Task'} ${index + 1}`}:
                        </div>
                        <div className='text-sm text-gray-800 mt-1'>{task.notes}</div>
                      </div>
                    )
                )}
                <textarea
                  value={maintenanceTasks[maintenanceTasks.length - 1]?.notes || ''}
                  onChange={e => handleTaskChange(maintenanceTasks.length - 1, 'notes', e.target.value)}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                  placeholder={isRTL ? 'أضف ملاحظات للمهمة الأخيرة...' : 'Add notes for the last task...'}
                />
              </div>
            </div>

            {/* Signature Section */}
            <div className='border-t pt-6'>
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>
                      {isRTL ? 'توقيع رئيس فريق الصيانة' : 'Team Leader Signature'}
                    </p>
                    <p className='font-medium'>{formData.maintenanceTeamLeader || '_______________'}</p>
                  </div>
                </div>
                <div className='text-center'>
                  <div className='border-t-2 border-gray-300 pt-2 mt-16'>
                    <p className='text-sm text-gray-600'>
                      {isRTL ? 'توقيع مدير الصيانة' : 'Maintenance Manager Signature'}
                    </p>
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

export default EquipmentMaintenanceForm;
