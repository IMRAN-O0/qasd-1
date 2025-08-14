import React, { useState, useEffect, useRef } from 'react';
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
  Area,
  AreaChart
} from 'recharts';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ShareIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const MobileAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const scrollRef = useRef(null);

  // Mock data for different analytics
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      kpis: [
        { id: 1, title: 'إجمالي الإنتاج', value: '1,234', change: '+12%', trend: 'up', color: 'text-green-600' },
        { id: 2, title: 'معدل الجودة', value: '98.5%', change: '+2.1%', trend: 'up', color: 'text-green-600' },
        { id: 3, title: 'الكفاءة', value: '87.3%', change: '-1.2%', trend: 'down', color: 'text-red-600' },
        { id: 4, title: 'التكلفة', value: '45,678', change: '-5.4%', trend: 'down', color: 'text-green-600' }
      ],
      chartData: [
        { name: 'السبت', production: 120, quality: 98, efficiency: 85 },
        { name: 'الأحد', production: 135, quality: 97, efficiency: 88 },
        { name: 'الاثنين', production: 148, quality: 99, efficiency: 92 },
        { name: 'الثلاثاء', production: 142, quality: 98, efficiency: 89 },
        { name: 'الأربعاء', production: 156, quality: 99, efficiency: 94 },
        { name: 'الخميس', production: 163, quality: 98, efficiency: 91 },
        { name: 'الجمعة', production: 171, quality: 99, efficiency: 96 }
      ]
    },
    production: {
      dailyOutput: [
        { time: '06:00', output: 45 },
        { time: '08:00', output: 78 },
        { time: '10:00', output: 92 },
        { time: '12:00', output: 85 },
        { time: '14:00', output: 96 },
        { time: '16:00', output: 103 },
        { time: '18:00', output: 89 }
      ],
      oeeData: [
        { name: 'التوفر', value: 92, color: '#10b981' },
        { name: 'الأداء', value: 87, color: '#3b82f6' },
        { name: 'الجودة', value: 95, color: '#8b5cf6' }
      ]
    },
    quality: {
      defectTypes: [
        { name: 'عيوب التصنيع', value: 35, color: '#ef4444' },
        { name: 'عيوب المواد', value: 25, color: '#f97316' },
        { name: 'عيوب التعبئة', value: 20, color: '#eab308' },
        { name: 'أخرى', value: 20, color: '#6b7280' }
      ],
      qualityTrend: [
        { week: 'الأسبوع 1', passed: 95, failed: 5 },
        { week: 'الأسبوع 2', passed: 97, failed: 3 },
        { week: 'الأسبوع 3', passed: 94, failed: 6 },
        { week: 'الأسبوع 4', passed: 98, failed: 2 }
      ]
    },
    inventory: {
      stockLevels: [
        { item: 'المادة الخام أ', current: 85, minimum: 20, maximum: 100 },
        { item: 'المادة الخام ب', current: 45, minimum: 30, maximum: 80 },
        { item: 'المنتج النهائي', current: 120, minimum: 50, maximum: 150 },
        { item: 'مواد التعبئة', current: 65, minimum: 25, maximum: 90 }
      ],
      turnoverRate: [
        { month: 'يناير', rate: 4.2 },
        { month: 'فبراير', rate: 3.8 },
        { month: 'مارس', rate: 4.5 },
        { month: 'أبريل', rate: 4.1 },
        { month: 'مايو', rate: 4.7 },
        { month: 'يونيو', rate: 4.3 }
      ]
    }
  });

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: ChartBarIcon },
    { id: 'production', name: 'الإنتاج', icon: ArrowTrendingUpIcon },
    { id: 'quality', name: 'الجودة', icon: EyeIcon },
    { id: 'inventory', name: 'المخزون', icon: FunnelIcon }
  ];

  const periods = [
    { id: 'today', name: 'اليوم' },
    { id: 'week', name: 'هذا الأسبوع' },
    { id: 'month', name: 'هذا الشهر' },
    { id: 'quarter', name: 'هذا الربع' }
  ];

  // Touch handling for swipe navigation
  const handleTouchStart = e => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = e => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }

    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update data (in real app, fetch from API)
    setAnalyticsData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        kpis: prev.overview.kpis.map(kpi => ({
          ...kpi,
          value: Math.floor(Math.random() * 1000) + 1000
        }))
      }
    }));

    setIsRefreshing(false);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900 mb-2'>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className='text-sm' style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render KPI cards
  const renderKPICards = () => (
    <div className='grid grid-cols-2 gap-3 mb-6'>
      {analyticsData.overview.kpis.map(kpi => (
        <div key={kpi.id} className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-sm font-medium text-gray-600'>{kpi.title}</h3>
            {kpi.trend === 'up' ? (
              <ArrowTrendingUpIcon className='w-4 h-4 text-green-500' />
            ) : (
              <ArrowTrendingDownIcon className='w-4 h-4 text-red-500' />
            )}
          </div>
          <div className='flex items-end justify-between'>
            <span className='text-2xl font-bold text-gray-900'>{kpi.value}</span>
            <span className={`text-sm font-medium ${kpi.color}`}>{kpi.change}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // Render overview tab
  const renderOverview = () => (
    <div className='space-y-6'>
      {renderKPICards()}

      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>الأداء الأسبوعي</h3>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analyticsData.overview.chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='name' tick={{ fontSize: 12 }} stroke='#6b7280' />
              <YAxis tick={{ fontSize: 12 }} stroke='#6b7280' />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type='monotone'
                dataKey='production'
                stackId='1'
                stroke='#3b82f6'
                fill='#3b82f6'
                fillOpacity={0.6}
              />
              <Area
                type='monotone'
                dataKey='efficiency'
                stackId='1'
                stroke='#10b981'
                fill='#10b981'
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Render production tab
  const renderProduction = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>الإنتاج اليومي</h3>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={analyticsData.production.dailyOutput}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='time' tick={{ fontSize: 12 }} stroke='#6b7280' />
              <YAxis tick={{ fontSize: 12 }} stroke='#6b7280' />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type='monotone'
                dataKey='output'
                stroke='#3b82f6'
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>معدل الكفاءة الإجمالية (OEE)</h3>
        <div className='space-y-4'>
          {analyticsData.production.oeeData.map((item, index) => (
            <div key={index} className='flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-700'>{item.name}</span>
              <div className='flex items-center space-x-3 rtl:space-x-reverse'>
                <div className='w-24 bg-gray-200 rounded-full h-2'>
                  <div
                    className='h-2 rounded-full transition-all duration-500'
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
                <span className='text-sm font-semibold text-gray-900 min-w-[3rem]'>{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render quality tab
  const renderQuality = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>أنواع العيوب</h3>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={analyticsData.quality.defectTypes}
                cx='50%'
                cy='50%'
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey='value'
              >
                {analyticsData.quality.defectTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign='bottom' height={36} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>اتجاه الجودة</h3>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={analyticsData.quality.qualityTrend}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='week' tick={{ fontSize: 12 }} stroke='#6b7280' />
              <YAxis tick={{ fontSize: 12 }} stroke='#6b7280' />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey='passed' stackId='a' fill='#10b981' />
              <Bar dataKey='failed' stackId='a' fill='#ef4444' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Render inventory tab
  const renderInventory = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>مستويات المخزون</h3>
        <div className='space-y-4'>
          {analyticsData.inventory.stockLevels.map((item, index) => (
            <div key={index} className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-gray-700'>{item.item}</span>
                <span className='text-sm text-gray-500'>
                  {item.current}/{item.maximum}
                </span>
              </div>
              <div className='relative'>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-blue-500 h-3 rounded-full transition-all duration-500'
                    style={{ width: `${(item.current / item.maximum) * 100}%` }}
                  />
                  <div
                    className='absolute top-0 h-3 w-1 bg-red-500 rounded'
                    style={{ left: `${(item.minimum / item.maximum) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>معدل دوران المخزون</h3>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analyticsData.inventory.turnoverRate}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='month' tick={{ fontSize: 12 }} stroke='#6b7280' />
              <YAxis tick={{ fontSize: 12 }} stroke='#6b7280' />
              <Tooltip content={<CustomTooltip />} />
              <Area type='monotone' dataKey='rate' stroke='#8b5cf6' fill='#8b5cf6' fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'production':
        return renderProduction();
      case 'quality':
        return renderQuality();
      case 'inventory':
        return renderInventory();
      default:
        return renderOverview();
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10'>
        <div className='px-4 py-3'>
          <div className='flex items-center justify-between mb-3'>
            <h1 className='text-xl font-bold text-gray-900'>التحليلات</h1>
            <div className='flex items-center space-x-2 rtl:space-x-reverse'>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className='p-2 text-gray-600 hover:text-gray-900 transition-colors'
              >
                <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className='p-2 text-gray-600 hover:text-gray-900 transition-colors'>
                <ShareIcon className='w-5 h-5' />
              </button>
              <button className='p-2 text-gray-600 hover:text-gray-900 transition-colors'>
                <AdjustmentsHorizontalIcon className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Period selector */}
          <div className='flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2'>
            {periods.map(period => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab navigation */}
        <div className='flex overflow-x-auto'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className='flex items-center justify-center space-x-2 rtl:space-x-reverse'>
                  <Icon className='w-4 h-4' />
                  <span className='truncate'>{tab.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        className='p-4 pb-20'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderContent()}
      </div>

      {/* Swipe indicator */}
      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 rtl:space-x-reverse bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs'>
        <ChevronRightIcon className='w-3 h-3' />
        <span>اسحب للتنقل</span>
        <ChevronLeftIcon className='w-3 h-3' />
      </div>
    </div>
  );
};

export default MobileAnalytics;
