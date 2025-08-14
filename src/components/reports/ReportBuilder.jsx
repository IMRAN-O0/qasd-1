import React, { useState, useEffect, useRef } from 'react';
import {
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ShareIcon,
  ClockIcon,
  UserGroupIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  MapIcon,
  CalculatorIcon,
  BoltIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

const ReportBuilder = () => {
  const { user } = useAuth();
  const { request } = useApi();

  // State management
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [reportConfig, setReportConfig] = useState({
    title: '',
    description: '',
    dataSource: '',
    filters: [],
    groupBy: [],
    sortBy: [],
    calculations: [],
    visualizations: [],
    layout: 'vertical',
    pageSize: 'A4',
    orientation: 'portrait'
  });

  // Available data sources
  const dataSources = {
    production: {
      name: 'بيانات الإنتاج',
      tables: ['batches', 'products', 'machines', 'downtime'],
      fields: {
        batches: ['batch_id', 'product_id', 'quantity', 'start_date', 'end_date', 'status', 'quality_score'],
        products: ['product_id', 'name', 'category', 'unit_cost', 'selling_price'],
        machines: ['machine_id', 'name', 'type', 'efficiency', 'maintenance_date'],
        downtime: ['downtime_id', 'machine_id', 'start_time', 'end_time', 'reason', 'impact']
      }
    },
    sales: {
      name: 'بيانات المبيعات',
      tables: ['orders', 'customers', 'products', 'payments'],
      fields: {
        orders: ['order_id', 'customer_id', 'product_id', 'quantity', 'total_amount', 'order_date', 'status'],
        customers: ['customer_id', 'name', 'email', 'phone', 'address', 'registration_date'],
        products: ['product_id', 'name', 'category', 'price', 'stock_quantity'],
        payments: ['payment_id', 'order_id', 'amount', 'payment_date', 'method', 'status']
      }
    },
    inventory: {
      name: 'بيانات المخزون',
      tables: ['stock', 'movements', 'suppliers', 'warehouses'],
      fields: {
        stock: ['item_id', 'name', 'category', 'current_stock', 'min_stock', 'max_stock', 'unit_cost'],
        movements: ['movement_id', 'item_id', 'type', 'quantity', 'date', 'reference'],
        suppliers: ['supplier_id', 'name', 'contact', 'rating', 'payment_terms'],
        warehouses: ['warehouse_id', 'name', 'location', 'capacity', 'current_usage']
      }
    },
    quality: {
      name: 'بيانات الجودة',
      tables: ['inspections', 'defects', 'corrective_actions', 'audits'],
      fields: {
        inspections: ['inspection_id', 'batch_id', 'inspector', 'date', 'result', 'score'],
        defects: ['defect_id', 'batch_id', 'type', 'severity', 'detected_date', 'resolved_date'],
        corrective_actions: ['action_id', 'defect_id', 'description', 'assigned_to', 'due_date', 'status'],
        audits: ['audit_id', 'type', 'auditor', 'date', 'findings', 'score']
      }
    },
    safety: {
      name: 'بيانات السلامة',
      tables: ['incidents', 'training', 'inspections', 'equipment'],
      fields: {
        incidents: ['incident_id', 'type', 'severity', 'date', 'location', 'injured_count', 'description'],
        training: ['training_id', 'employee_id', 'course', 'completion_date', 'score', 'valid_until'],
        inspections: ['inspection_id', 'area', 'inspector', 'date', 'findings', 'risk_level'],
        equipment: ['equipment_id', 'name', 'type', 'last_inspection', 'next_inspection', 'status']
      }
    }
  };

  // Visualization types
  const visualizationTypes = [
    { id: 'bar', name: 'مخطط أعمدة', icon: ChartBarIcon, component: BarChart },
    { id: 'line', name: 'مخطط خطي', icon: PresentationChartLineIcon, component: LineChart },
    { id: 'pie', name: 'مخطط دائري', icon: ChartPieIcon, component: PieChart },
    { id: 'scatter', name: 'مخطط نقطي', icon: MapIcon, component: ScatterChart },
    { id: 'table', name: 'جدول', icon: TableCellsIcon, component: 'table' },
    { id: 'kpi', name: 'مؤشر أداء', icon: CalculatorIcon, component: 'kpi' }
  ];

  // Calculation functions
  const calculationTypes = [
    { id: 'sum', name: 'المجموع', formula: 'SUM' },
    { id: 'avg', name: 'المتوسط', formula: 'AVG' },
    { id: 'count', name: 'العدد', formula: 'COUNT' },
    { id: 'min', name: 'الحد الأدنى', formula: 'MIN' },
    { id: 'max', name: 'الحد الأعلى', formula: 'MAX' },
    { id: 'percentage', name: 'النسبة المئوية', formula: 'PERCENTAGE' },
    { id: 'growth', name: 'معدل النمو', formula: 'GROWTH' },
    { id: 'variance', name: 'التباين', formula: 'VARIANCE' }
  ];

  // Load saved reports
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await request('/api/reports');
      setReports(response.data || mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  // Mock reports data
  const mockReports = [
    {
      id: 1,
      title: 'تقرير الإنتاج الشهري',
      description: 'تحليل شامل لأداء الإنتاج خلال الشهر',
      dataSource: 'production',
      createdBy: 'أحمد محمد',
      createdAt: '2024-01-15T10:30:00Z',
      lastRun: '2024-01-20T14:20:00Z',
      schedule: 'monthly',
      status: 'active'
    },
    {
      id: 2,
      title: 'تقرير مبيعات المنتجات',
      description: 'أداء المبيعات حسب المنتج والعميل',
      dataSource: 'sales',
      createdBy: 'سارة أحمد',
      createdAt: '2024-01-10T09:15:00Z',
      lastRun: '2024-01-21T08:00:00Z',
      schedule: 'weekly',
      status: 'active'
    },
    {
      id: 3,
      title: 'تقرير مستويات المخزون',
      description: 'حالة المخزون والحاجة للتجديد',
      dataSource: 'inventory',
      createdBy: 'محمد علي',
      createdAt: '2024-01-05T16:45:00Z',
      lastRun: '2024-01-21T12:30:00Z',
      schedule: 'daily',
      status: 'active'
    }
  ];

  // Create new report
  const createNewReport = () => {
    setCurrentReport(null);
    setReportConfig({
      title: '',
      description: '',
      dataSource: '',
      filters: [],
      groupBy: [],
      sortBy: [],
      calculations: [],
      visualizations: [],
      layout: 'vertical',
      pageSize: 'A4',
      orientation: 'portrait'
    });
    setIsBuilding(true);
  };

  // Load existing report for editing
  const editReport = report => {
    setCurrentReport(report);
    // Load report configuration
    loadReportConfig(report.id);
    setIsBuilding(true);
  };

  const loadReportConfig = async reportId => {
    try {
      const response = await request(`/api/reports/${reportId}/config`);
      setReportConfig(
        response.data || {
          title: 'تقرير الإنتاج الشهري',
          description: 'تحليل شامل لأداء الإنتاج خلال الشهر',
          dataSource: 'production',
          filters: [
            { field: 'start_date', operator: 'gte', value: '2024-01-01' },
            { field: 'status', operator: 'eq', value: 'completed' }
          ],
          groupBy: ['product_id', 'date'],
          sortBy: [{ field: 'date', direction: 'desc' }],
          calculations: [
            { field: 'quantity', type: 'sum', alias: 'total_quantity' },
            { field: 'quality_score', type: 'avg', alias: 'avg_quality' }
          ],
          visualizations: [
            {
              id: 'chart1',
              type: 'bar',
              title: 'الإنتاج حسب المنتج',
              xAxis: 'product_id',
              yAxis: 'total_quantity',
              position: { x: 0, y: 0, width: 6, height: 4 }
            },
            {
              id: 'chart2',
              type: 'line',
              title: 'اتجاه الجودة',
              xAxis: 'date',
              yAxis: 'avg_quality',
              position: { x: 6, y: 0, width: 6, height: 4 }
            }
          ],
          layout: 'vertical',
          pageSize: 'A4',
          orientation: 'portrait'
        }
      );
    } catch (error) {
      console.error('Error loading report config:', error);
    }
  };

  // Execute report and fetch data
  const executeReport = async () => {
    try {
      setLoading(true);
      const response = await request('/api/reports/execute', {
        method: 'POST',
        body: reportConfig
      });
      setReportData(response.data || generateMockData());
      setPreviewMode(true);
    } catch (error) {
      console.error('Error executing report:', error);
      setReportData(generateMockData());
      setPreviewMode(true);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for preview
  const generateMockData = () => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      data.push({
        month: `2024-${String(i + 1).padStart(2, '0')}`,
        production: Math.floor(Math.random() * 1000) + 500,
        quality: Math.floor(Math.random() * 20) + 80,
        efficiency: Math.floor(Math.random() * 15) + 85,
        defects: Math.floor(Math.random() * 50) + 10
      });
    }
    return data;
  };

  // Save report
  const saveReport = async () => {
    try {
      const method = currentReport ? 'PUT' : 'POST';
      const url = currentReport ? `/api/reports/${currentReport.id}` : '/api/reports';

      const response = await request(url, {
        method,
        body: {
          ...reportConfig,
          id: currentReport?.id
        }
      });

      loadReports();
      setIsBuilding(false);
      setCurrentReport(null);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  // Add filter
  const addFilter = () => {
    setReportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, { field: '', operator: 'eq', value: '' }]
    }));
  };

  // Update filter
  const updateFilter = (index, field, value) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) => (i === index ? { ...filter, [field]: value } : filter))
    }));
  };

  // Remove filter
  const removeFilter = index => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  // Add visualization
  const addVisualization = type => {
    const newViz = {
      id: `viz_${Date.now()}`,
      type,
      title: `مخطط ${visualizationTypes.find(v => v.id === type)?.name}`,
      xAxis: '',
      yAxis: '',
      position: { x: 0, y: 0, width: 6, height: 4 }
    };

    setReportConfig(prev => ({
      ...prev,
      visualizations: [...prev.visualizations, newViz]
    }));
  };

  // Update visualization
  const updateVisualization = (id, field, value) => {
    setReportConfig(prev => ({
      ...prev,
      visualizations: prev.visualizations.map(viz => (viz.id === id ? { ...viz, [field]: value } : viz))
    }));
  };

  // Remove visualization
  const removeVisualization = id => {
    setReportConfig(prev => ({
      ...prev,
      visualizations: prev.visualizations.filter(viz => viz.id !== id)
    }));
  };

  // Drag and drop handler
  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(reportConfig.visualizations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setReportConfig(prev => ({
      ...prev,
      visualizations: items
    }));
  };

  // Export report
  const exportReport = async format => {
    try {
      const response = await request('/api/reports/export', {
        method: 'POST',
        body: {
          config: reportConfig,
          data: reportData,
          format
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportConfig.title}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  // Schedule report
  const scheduleReport = async schedule => {
    try {
      await request('/api/reports/schedule', {
        method: 'POST',
        body: {
          reportId: currentReport?.id,
          config: reportConfig,
          schedule
        }
      });

      alert('تم جدولة التقرير بنجاح');
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };

  if (!isBuilding) {
    return (
      <div className='h-full flex flex-col bg-white' dir='rtl'>
        {/* Header */}
        <div className='border-b border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-gray-900'>منشئ التقارير</h1>
            <button
              onClick={createNewReport}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-reverse space-x-2'
            >
              <PlusIcon className='h-5 w-5' />
              <span>تقرير جديد</span>
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className='flex-1 overflow-auto p-6'>
          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {reports.map(report => (
                <div
                  key={report.id}
                  className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>{report.title}</h3>
                      <p className='text-sm text-gray-600 mb-3'>{report.description}</p>

                      <div className='flex items-center space-x-reverse space-x-4 text-xs text-gray-500'>
                        <span>بواسطة: {report.createdBy}</span>
                        <span>آخر تشغيل: {new Date(report.lastRun).toLocaleDateString('ar-SA')}</span>
                      </div>

                      <div className='flex items-center space-x-reverse space-x-2 mt-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {report.status === 'active' ? 'نشط' : 'معطل'}
                        </span>
                        <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                          {report.schedule === 'daily'
                            ? 'يومي'
                            : report.schedule === 'weekly'
                              ? 'أسبوعي'
                              : report.schedule === 'monthly'
                                ? 'شهري'
                                : 'حسب الطلب'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
                    <div className='flex items-center space-x-reverse space-x-2'>
                      <button
                        onClick={() => editReport(report)}
                        className='text-blue-600 hover:text-blue-800 flex items-center space-x-reverse space-x-1'
                      >
                        <Cog6ToothIcon className='h-4 w-4' />
                        <span>تعديل</span>
                      </button>
                      <button className='text-green-600 hover:text-green-800 flex items-center space-x-reverse space-x-1'>
                        <PlayIcon className='h-4 w-4' />
                        <span>تشغيل</span>
                      </button>
                    </div>

                    <div className='flex items-center space-x-reverse space-x-2'>
                      <button className='text-gray-600 hover:text-gray-800'>
                        <EyeIcon className='h-4 w-4' />
                      </button>
                      <button className='text-gray-600 hover:text-gray-800'>
                        <ShareIcon className='h-4 w-4' />
                      </button>
                      <button className='text-gray-600 hover:text-gray-800'>
                        <DocumentArrowDownIcon className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex bg-gray-50' dir='rtl'>
      {/* Report Builder Sidebar */}
      <div className='w-80 bg-white border-l border-gray-200 flex flex-col'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-medium text-gray-900'>إعدادات التقرير</h2>
            <button onClick={() => setIsBuilding(false)} className='text-gray-400 hover:text-gray-600'>
              <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>عنوان التقرير</label>
              <input
                type='text'
                value={reportConfig.title}
                onChange={e => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='أدخل عنوان التقرير'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الوصف</label>
              <textarea
                value={reportConfig.description}
                onChange={e => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                rows={3}
                placeholder='وصف مختصر للتقرير'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>مصدر البيانات</label>
              <select
                value={reportConfig.dataSource}
                onChange={e => setReportConfig(prev => ({ ...prev, dataSource: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>اختر مصدر البيانات</option>
                {Object.entries(dataSources).map(([key, source]) => (
                  <option key={key} value={key}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-gray-900'>المرشحات</h3>
            <button onClick={addFilter} className='text-blue-600 hover:text-blue-800'>
              <PlusIcon className='h-4 w-4' />
            </button>
          </div>

          <div className='space-y-2 max-h-40 overflow-y-auto'>
            {reportConfig.filters.map((filter, index) => (
              <div key={index} className='flex items-center space-x-reverse space-x-2'>
                <select
                  value={filter.field}
                  onChange={e => updateFilter(index, 'field', e.target.value)}
                  className='flex-1 px-2 py-1 border border-gray-300 rounded text-sm'
                >
                  <option value=''>اختر الحقل</option>
                  {reportConfig.dataSource &&
                    dataSources[reportConfig.dataSource] &&
                    Object.entries(dataSources[reportConfig.dataSource].fields).map(([table, fields]) => (
                      <optgroup key={table} label={table}>
                        {fields.map(field => (
                          <option key={field} value={`${table}.${field}`}>
                            {field}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>

                <select
                  value={filter.operator}
                  onChange={e => updateFilter(index, 'operator', e.target.value)}
                  className='px-2 py-1 border border-gray-300 rounded text-sm'
                >
                  <option value='eq'>يساوي</option>
                  <option value='ne'>لا يساوي</option>
                  <option value='gt'>أكبر من</option>
                  <option value='gte'>أكبر أو يساوي</option>
                  <option value='lt'>أصغر من</option>
                  <option value='lte'>أصغر أو يساوي</option>
                  <option value='contains'>يحتوي على</option>
                </select>

                <input
                  type='text'
                  value={filter.value}
                  onChange={e => updateFilter(index, 'value', e.target.value)}
                  className='flex-1 px-2 py-1 border border-gray-300 rounded text-sm'
                  placeholder='القيمة'
                />

                <button onClick={() => removeFilter(index)} className='text-red-600 hover:text-red-800'>
                  <TrashIcon className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Visualizations Section */}
        <div className='flex-1 p-4 overflow-y-auto'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-gray-900'>المخططات</h3>
          </div>

          <div className='grid grid-cols-2 gap-2 mb-4'>
            {visualizationTypes.map(type => (
              <button
                key={type.id}
                onClick={() => addVisualization(type.id)}
                className='p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center space-y-1'
              >
                <type.icon className='h-5 w-5 text-gray-600' />
                <span className='text-xs text-gray-600'>{type.name}</span>
              </button>
            ))}
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='visualizations'>
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef} className='space-y-2'>
                  {reportConfig.visualizations.map((viz, index) => (
                    <Draggable key={viz.id} draggableId={viz.id} index={index}>
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className='p-3 border border-gray-200 rounded-lg bg-white'
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium text-gray-900'>{viz.title}</span>
                            <button
                              onClick={() => removeVisualization(viz.id)}
                              className='text-red-600 hover:text-red-800'
                            >
                              <TrashIcon className='h-4 w-4' />
                            </button>
                          </div>

                          <div className='space-y-2'>
                            <input
                              type='text'
                              value={viz.title}
                              onChange={e => updateVisualization(viz.id, 'title', e.target.value)}
                              className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                              placeholder='عنوان المخطط'
                            />

                            {viz.type !== 'table' && viz.type !== 'kpi' && (
                              <>
                                <select
                                  value={viz.xAxis}
                                  onChange={e => updateVisualization(viz.id, 'xAxis', e.target.value)}
                                  className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                                >
                                  <option value=''>المحور السيني</option>
                                  {reportConfig.dataSource &&
                                    dataSources[reportConfig.dataSource] &&
                                    Object.entries(dataSources[reportConfig.dataSource].fields).map(([table, fields]) =>
                                      fields.map(field => (
                                        <option key={field} value={`${table}.${field}`}>
                                          {field}
                                        </option>
                                      ))
                                    )}
                                </select>

                                <select
                                  value={viz.yAxis}
                                  onChange={e => updateVisualization(viz.id, 'yAxis', e.target.value)}
                                  className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                                >
                                  <option value=''>المحور الصادي</option>
                                  {reportConfig.dataSource &&
                                    dataSources[reportConfig.dataSource] &&
                                    Object.entries(dataSources[reportConfig.dataSource].fields).map(([table, fields]) =>
                                      fields.map(field => (
                                        <option key={field} value={`${table}.${field}`}>
                                          {field}
                                        </option>
                                      ))
                                    )}
                                </select>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Action Buttons */}
        <div className='p-4 border-t border-gray-200 space-y-2'>
          <button
            onClick={executeReport}
            disabled={!reportConfig.title || !reportConfig.dataSource || loading}
            className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-reverse space-x-2'
          >
            {loading ? (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            ) : (
              <>
                <PlayIcon className='h-4 w-4' />
                <span>تشغيل التقرير</span>
              </>
            )}
          </button>

          <button
            onClick={saveReport}
            disabled={!reportConfig.title || !reportConfig.dataSource}
            className='w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            حفظ التقرير
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className='flex-1 flex flex-col'>
        {previewMode ? (
          <ReportPreview config={reportConfig} data={reportData} onExport={exportReport} onSchedule={scheduleReport} />
        ) : (
          <div className='flex-1 flex items-center justify-center bg-gray-100'>
            <div className='text-center'>
              <ChartBarIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>معاينة التقرير</h3>
              <p className='text-gray-600 mb-4'>قم بتكوين التقرير وتشغيله لرؤية النتائج</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Report Preview Component
const ReportPreview = ({ config, data, onExport, onSchedule }) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  const renderVisualization = (viz, index) => {
    const vizData = data.slice(0, 10); // Limit data for demo

    switch (viz.type) {
      case 'bar':
        return (
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={vizData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey={viz.xAxis?.split('.')[1] || 'month'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={viz.yAxis?.split('.')[1] || 'production'} fill={colors[index % colors.length]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={vizData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey={viz.xAxis?.split('.')[1] || 'month'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey={viz.yAxis?.split('.')[1] || 'quality'}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={vizData.slice(0, 6)}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill='#8884d8'
                dataKey={viz.yAxis?.split('.')[1] || 'production'}
              >
                {vizData.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'table':
        return (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {Object.keys(vizData[0] || {}).map(key => (
                    <th
                      key={key}
                      className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {vizData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'kpi':
        const kpiValue = vizData.reduce((sum, item) => sum + (item[viz.yAxis?.split('.')[1] || 'production'] || 0), 0);
        return (
          <div className='text-center p-8'>
            <div className='text-4xl font-bold text-blue-600 mb-2'>{kpiValue.toLocaleString()}</div>
            <div className='text-lg text-gray-600'>{viz.title}</div>
          </div>
        );

      default:
        return <div className='p-4 text-center text-gray-500'>نوع مخطط غير مدعوم</div>;
    }
  };

  return (
    <div className='flex-1 flex flex-col'>
      {/* Preview Header */}
      <div className='bg-white border-b border-gray-200 p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>{config.title}</h2>
            <p className='text-sm text-gray-600'>{config.description}</p>
          </div>

          <div className='flex items-center space-x-reverse space-x-2'>
            <button
              onClick={() => onExport('pdf')}
              className='bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-reverse space-x-1'
            >
              <DocumentArrowDownIcon className='h-4 w-4' />
              <span>PDF</span>
            </button>

            <button
              onClick={() => onExport('excel')}
              className='bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-reverse space-x-1'
            >
              <DocumentArrowDownIcon className='h-4 w-4' />
              <span>Excel</span>
            </button>

            <button
              onClick={() => onSchedule('daily')}
              className='bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-reverse space-x-1'
            >
              <ClockIcon className='h-4 w-4' />
              <span>جدولة</span>
            </button>

            <button className='bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-reverse space-x-1'>
              <EnvelopeIcon className='h-4 w-4' />
              <span>إرسال</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className='flex-1 overflow-auto p-6 bg-gray-50'>
        <div className='space-y-6'>
          {config.visualizations.map((viz, index) => (
            <div key={viz.id} className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>{viz.title}</h3>
              {renderVisualization(viz, index)}
            </div>
          ))}

          {config.visualizations.length === 0 && (
            <div className='text-center py-12'>
              <ChartBarIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>لا توجد مخططات</h3>
              <p className='text-gray-600'>أضف مخططات من الشريط الجانبي لعرض البيانات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
