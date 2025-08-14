import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ISOComplianceReports = () => {
  const [activeStandard, setActiveStandard] = useState('iso9001');
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current_year');
  const [complianceScore, setComplianceScore] = useState(0);
  const [trends, setTrends] = useState([]);
  const [auditFindings, setAuditFindings] = useState([]);
  const [correctiveActions, setCorrectiveActions] = useState([]);

  const isoStandards = {
    iso9001: {
      name: 'ISO 9001:2015',
      title: 'نظام إدارة الجودة',
      description: 'إدارة الجودة وتحسين رضا العملاء',
      color: 'blue',
      icon: CheckCircleIcon,
      clauses: [
        { id: '4', name: 'سياق المنظمة', weight: 10 },
        { id: '5', name: 'القيادة', weight: 15 },
        { id: '6', name: 'التخطيط', weight: 15 },
        { id: '7', name: 'الدعم', weight: 20 },
        { id: '8', name: 'العمليات', weight: 25 },
        { id: '9', name: 'تقييم الأداء', weight: 10 },
        { id: '10', name: 'التحسين', weight: 5 }
      ]
    },
    iso45001: {
      name: 'ISO 45001:2018',
      title: 'نظام إدارة الصحة والسلامة المهنية',
      description: 'حماية العمال ومنع الإصابات المهنية',
      color: 'red',
      icon: ShieldCheckIcon,
      clauses: [
        { id: '4', name: 'سياق المنظمة', weight: 10 },
        { id: '5', name: 'القيادة والمشاركة', weight: 20 },
        { id: '6', name: 'التخطيط', weight: 15 },
        { id: '7', name: 'الدعم', weight: 15 },
        { id: '8', name: 'العمليات', weight: 25 },
        { id: '9', name: 'تقييم الأداء', weight: 10 },
        { id: '10', name: 'التحسين', weight: 5 }
      ]
    },
    iso14001: {
      name: 'ISO 14001:2015',
      title: 'نظام الإدارة البيئية',
      description: 'حماية البيئة وتقليل التأثير البيئي',
      color: 'green',
      icon: CogIcon,
      clauses: [
        { id: '4', name: 'سياق المنظمة', weight: 10 },
        { id: '5', name: 'القيادة', weight: 15 },
        { id: '6', name: 'التخطيط', weight: 20 },
        { id: '7', name: 'الدعم', weight: 15 },
        { id: '8', name: 'العمليات', weight: 25 },
        { id: '9', name: 'تقييم الأداء', weight: 10 },
        { id: '10', name: 'التحسين', weight: 5 }
      ]
    },
    iso22716: {
      name: 'ISO 22716:2007',
      title: 'الممارسات التصنيعية الجيدة للمستحضرات التجميلية',
      description: 'ضمان جودة وسلامة المنتجات التجميلية',
      color: 'purple',
      icon: UserGroupIcon,
      clauses: [
        { id: '5', name: 'إدارة الجودة', weight: 20 },
        { id: '6', name: 'الموظفون', weight: 15 },
        { id: '7', name: 'المباني والمرافق', weight: 15 },
        { id: '8', name: 'المعدات', weight: 10 },
        { id: '9', name: 'المواد والتعبئة', weight: 15 },
        { id: '10', name: 'الإنتاج', weight: 15 },
        { id: '11', name: 'مراقبة الجودة', weight: 10 }
      ]
    }
  };

  const reportPeriods = {
    current_month: 'الشهر الحالي',
    current_quarter: 'الربع الحالي',
    current_year: 'السنة الحالية',
    last_year: 'السنة الماضية',
    custom: 'فترة مخصصة'
  };

  useEffect(() => {
    loadComplianceData();
  }, [activeStandard, selectedPeriod]);

  // Load compliance data
  const loadComplianceData = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock data
      const mockData = generateMockComplianceData(activeStandard, selectedPeriod);

      setReportData(mockData.reportData);
      setComplianceScore(mockData.complianceScore);
      setTrends(mockData.trends);
      setAuditFindings(mockData.auditFindings);
      setCorrectiveActions(mockData.correctiveActions);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock compliance data
  const generateMockComplianceData = (standard, period) => {
    const standardConfig = isoStandards[standard];

    // Generate clause compliance scores
    const clauseScores = standardConfig.clauses.map(clause => ({
      ...clause,
      score: Math.floor(Math.random() * 30) + 70, // 70-100%
      findings: Math.floor(Math.random() * 5),
      actions: Math.floor(Math.random() * 3)
    }));

    // Calculate overall compliance score
    const overallScore = clauseScores.reduce((total, clause) => total + (clause.score * clause.weight) / 100, 0);

    // Generate trends
    const trendData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(2024, i, 1), 'MMM', { locale: ar }),
      score: Math.floor(Math.random() * 20) + 75,
      findings: Math.floor(Math.random() * 10) + 2,
      actions: Math.floor(Math.random() * 8) + 1
    }));

    // Generate audit findings
    const findings = [
      {
        id: 1,
        type: 'major',
        clause: '8.5.1',
        description: 'عدم وجود إجراءات موثقة لمراقبة الإنتاج',
        status: 'open',
        dueDate: '2024-02-15',
        responsible: 'مدير الإنتاج'
      },
      {
        id: 2,
        type: 'minor',
        clause: '7.1.5',
        description: 'نقص في معايرة بعض أجهزة القياس',
        status: 'in_progress',
        dueDate: '2024-01-30',
        responsible: 'مهندس الجودة'
      },
      {
        id: 3,
        type: 'observation',
        clause: '9.2.2',
        description: 'تحسين توثيق نتائج التدقيق الداخلي',
        status: 'closed',
        dueDate: '2024-01-20',
        responsible: 'منسق الجودة'
      }
    ];

    // Generate corrective actions
    const actions = [
      {
        id: 1,
        title: 'تطوير إجراءات مراقبة الإنتاج',
        description: 'إعداد وتوثيق إجراءات شاملة لمراقبة عمليات الإنتاج',
        priority: 'high',
        status: 'in_progress',
        progress: 65,
        dueDate: '2024-02-15',
        responsible: 'فريق الجودة',
        resources: 'مستشار خارجي + فريق داخلي'
      },
      {
        id: 2,
        title: 'برنامج معايرة الأجهزة',
        description: 'تنفيذ برنامج شامل لمعايرة جميع أجهزة القياس والمراقبة',
        priority: 'medium',
        status: 'planned',
        progress: 25,
        dueDate: '2024-03-01',
        responsible: 'قسم الصيانة',
        resources: 'شركة معايرة معتمدة'
      }
    ];

    return {
      reportData: {
        clauses: clauseScores,
        summary: {
          totalClauses: standardConfig.clauses.length,
          compliantClauses: clauseScores.filter(c => c.score >= 80).length,
          nonCompliantClauses: clauseScores.filter(c => c.score < 80).length,
          totalFindings: findings.length,
          openFindings: findings.filter(f => f.status === 'open').length,
          totalActions: actions.length,
          completedActions: actions.filter(a => a.status === 'completed').length
        }
      },
      complianceScore: Math.round(overallScore),
      trends: trendData,
      auditFindings: findings,
      correctiveActions: actions
    };
  };

  // Export report
  const exportReport = async format => {
    try {
      const response = await fetch('/api/compliance/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          standard: activeStandard,
          period: selectedPeriod,
          format,
          data: {
            reportData,
            complianceScore,
            trends,
            auditFindings,
            correctiveActions
          }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iso-compliance-report-${activeStandard}-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  // Print report
  const printReport = () => {
    window.print();
  };

  // Share report
  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تقرير الامتثال ${isoStandards[activeStandard].name}`,
          text: `تقرير امتثال ${isoStandards[activeStandard].title}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط إلى الحافظة');
    }
  };

  // Get compliance status color
  const getComplianceColor = score => {
    if (score >= 90) {
      return 'text-green-600 bg-green-100';
    }
    if (score >= 80) {
      return 'text-yellow-600 bg-yellow-100';
    }
    if (score >= 70) {
      return 'text-orange-600 bg-orange-100';
    }
    return 'text-red-600 bg-red-100';
  };

  // Get finding type color
  const getFindingTypeColor = type => {
    switch (type) {
      case 'major':
        return 'text-red-600 bg-red-100';
      case 'minor':
        return 'text-yellow-600 bg-yellow-100';
      case 'observation':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status color
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
      case 'closed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'planned':
      case 'open':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const currentStandard = isoStandards[activeStandard];
  const IconComponent = currentStandard.icon;

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-3 rtl:space-x-reverse'>
            <DocumentTextIcon className='w-8 h-8 text-blue-600' />
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>تقارير الامتثال لمعايير ISO</h1>
              <p className='text-gray-600'>مراقبة وتقييم الامتثال للمعايير الدولية</p>
            </div>
          </div>

          <div className='flex items-center space-x-2 rtl:space-x-reverse'>
            <button
              onClick={() => exportReport('pdf')}
              className='flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              <ArrowDownTrayIcon className='w-4 h-4' />
              <span>تصدير PDF</span>
            </button>

            <button
              onClick={printReport}
              className='flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700'
            >
              <PrinterIcon className='w-4 h-4' />
              <span>طباعة</span>
            </button>

            <button
              onClick={shareReport}
              className='flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
            >
              <ShareIcon className='w-4 h-4' />
              <span>مشاركة</span>
            </button>
          </div>
        </div>

        {/* Standard Selection */}
        <div className='flex flex-wrap gap-2 mb-4'>
          {Object.entries(isoStandards).map(([key, standard]) => {
            const StandardIcon = standard.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveStandard(key)}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg border transition-colors ${
                  activeStandard === key
                    ? `bg-${standard.color}-100 border-${standard.color}-300 text-${standard.color}-700`
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <StandardIcon className='w-4 h-4' />
                <span className='font-medium'>{standard.name}</span>
              </button>
            );
          })}
        </div>

        {/* Period Selection */}
        <div className='flex items-center space-x-4 rtl:space-x-reverse'>
          <CalendarIcon className='w-5 h-5 text-gray-400' />
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            {Object.entries(reportPeriods).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='space-y-8'>
          {/* Current Standard Overview */}
          <div className={`bg-${currentStandard.color}-50 border border-${currentStandard.color}-200 rounded-lg p-6`}>
            <div className='flex items-start space-x-4 rtl:space-x-reverse'>
              <div className={`p-3 bg-${currentStandard.color}-100 rounded-lg`}>
                <IconComponent className={`w-8 h-8 text-${currentStandard.color}-600`} />
              </div>
              <div className='flex-1'>
                <h2 className='text-xl font-bold text-gray-900 mb-2'>
                  {currentStandard.name} - {currentStandard.title}
                </h2>
                <p className='text-gray-600 mb-4'>{currentStandard.description}</p>

                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <div className='bg-white rounded-lg p-4 border'>
                    <div className='text-2xl font-bold text-gray-900'>{complianceScore}%</div>
                    <div className='text-sm text-gray-600'>نسبة الامتثال الإجمالية</div>
                  </div>

                  <div className='bg-white rounded-lg p-4 border'>
                    <div className='text-2xl font-bold text-green-600'>{reportData.summary?.compliantClauses || 0}</div>
                    <div className='text-sm text-gray-600'>بنود متوافقة</div>
                  </div>

                  <div className='bg-white rounded-lg p-4 border'>
                    <div className='text-2xl font-bold text-red-600'>{reportData.summary?.openFindings || 0}</div>
                    <div className='text-sm text-gray-600'>ملاحظات مفتوحة</div>
                  </div>

                  <div className='bg-white rounded-lg p-4 border'>
                    <div className='text-2xl font-bold text-blue-600'>{reportData.summary?.totalActions || 0}</div>
                    <div className='text-sm text-gray-600'>إجراءات تصحيحية</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance by Clause */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse'>
                <ChartBarIcon className='w-5 h-5' />
                <span>الامتثال حسب البنود</span>
              </h3>
            </div>

            <div className='p-6'>
              <div className='space-y-4'>
                {reportData.clauses?.map(clause => (
                  <div key={clause.id} className='border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center space-x-3 rtl:space-x-reverse'>
                        <span className='font-medium text-gray-900'>
                          البند {clause.id}: {clause.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(clause.score)}`}
                        >
                          {clause.score}%
                        </span>
                      </div>

                      <div className='flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600'>
                        <span>{clause.findings} ملاحظة</span>
                        <span>{clause.actions} إجراء</span>
                        <span>الوزن: {clause.weight}%</span>
                      </div>
                    </div>

                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${
                          clause.score >= 90
                            ? 'bg-green-500'
                            : clause.score >= 80
                              ? 'bg-yellow-500'
                              : clause.score >= 70
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${clause.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Findings */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse'>
                <ExclamationTriangleIcon className='w-5 h-5' />
                <span>ملاحظات التدقيق</span>
              </h3>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      النوع
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      البند
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الوصف
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الحالة
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      تاريخ الاستحقاق
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      المسؤول
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {auditFindings.map(finding => (
                    <tr key={finding.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getFindingTypeColor(finding.type)}`}
                        >
                          {finding.type === 'major' ? 'رئيسية' : finding.type === 'minor' ? 'فرعية' : 'ملاحظة'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {finding.clause}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>{finding.description}</td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(finding.status)}`}
                        >
                          {finding.status === 'open'
                            ? 'مفتوحة'
                            : finding.status === 'in_progress'
                              ? 'قيد التنفيذ'
                              : 'مغلقة'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        <div className='flex items-center space-x-1 rtl:space-x-reverse'>
                          <ClockIcon className='w-4 h-4 text-gray-400' />
                          <span>{format(new Date(finding.dueDate), 'dd/MM/yyyy')}</span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{finding.responsible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Corrective Actions */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse'>
                <CogIcon className='w-5 h-5' />
                <span>الإجراءات التصحيحية</span>
              </h3>
            </div>

            <div className='p-6'>
              <div className='space-y-6'>
                {correctiveActions.map(action => (
                  <div key={action.id} className='border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <h4 className='font-medium text-gray-900 mb-1'>{action.title}</h4>
                        <p className='text-sm text-gray-600 mb-2'>{action.description}</p>

                        <div className='flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600'>
                          <span>المسؤول: {action.responsible}</span>
                          <span>الموارد: {action.resources}</span>
                          <span>الاستحقاق: {format(new Date(action.dueDate), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>

                      <div className='flex items-center space-x-2 rtl:space-x-reverse'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            action.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : action.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {action.priority === 'high' ? 'عالية' : action.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </span>

                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                          {action.status === 'completed'
                            ? 'مكتملة'
                            : action.status === 'in_progress'
                              ? 'قيد التنفيذ'
                              : 'مخططة'}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3 rtl:space-x-reverse'>
                      <div className='flex-1 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${action.progress}%` }}
                        ></div>
                      </div>
                      <span className='text-sm font-medium text-gray-900'>{action.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance Trends */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse'>
                <ChartBarIcon className='w-5 h-5' />
                <span>اتجاهات الامتثال</span>
              </h3>
            </div>

            <div className='p-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Compliance Score Trend */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-4'>نسبة الامتثال الشهرية</h4>
                  <div className='h-64 flex items-end space-x-2 rtl:space-x-reverse'>
                    {trends.map((trend, index) => (
                      <div key={index} className='flex-1 flex flex-col items-center'>
                        <div
                          className='w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600'
                          style={{ height: `${(trend.score / 100) * 200}px` }}
                          title={`${trend.month}: ${trend.score}%`}
                        ></div>
                        <div className='text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-right'>
                          {trend.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Findings Trend */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-4'>عدد الملاحظات الشهرية</h4>
                  <div className='h-64 flex items-end space-x-2 rtl:space-x-reverse'>
                    {trends.map((trend, index) => (
                      <div key={index} className='flex-1 flex flex-col items-center'>
                        <div
                          className='w-full bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600'
                          style={{ height: `${(trend.findings / 15) * 200}px` }}
                          title={`${trend.month}: ${trend.findings} ملاحظة`}
                        ></div>
                        <div className='text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-right'>
                          {trend.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ISOComplianceReports;
