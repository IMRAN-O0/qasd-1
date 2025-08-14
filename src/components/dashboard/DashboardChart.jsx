import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DashboardChart = ({
  type = 'line',
  data = [],
  title,
  height = 300,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  loading = false
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='text-gray-900 font-medium mb-2'>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className='text-sm' style={{ color: entry.color }}>
              {entry.name}: {new Intl.NumberFormat('ar-SA').format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className='flex items-center justify-center h-full'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className='flex items-center justify-center h-full text-gray-500'>
          <div className='text-center'>
            <div className='text-4xl mb-2'>📊</div>
            <div>لا توجد بيانات للعرض</div>
          </div>
        </div>
      );
    }

    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis dataKey='name' tick={{ fontSize: 12 }} stroke='#666' />
            <YAxis tick={{ fontSize: 12 }} stroke='#666' />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(data[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Area
                  key={key}
                  type='monotone'
                  dataKey={key}
                  stackId='1'
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis dataKey='name' tick={{ fontSize: 12 }} stroke='#666' />
            <YAxis tick={{ fontSize: 12 }} stroke='#666' />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(data[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Bar key={key} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
          </BarChart>
        );

      case 'pie':
        const pieData = data.map((item, index) => ({
          ...item,
          fill: colors[index % colors.length]
        }));
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill='#8884d8'
              dataKey='value'
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      default: // line chart
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis dataKey='name' tick={{ fontSize: 12 }} stroke='#666' />
            <YAxis tick={{ fontSize: 12 }} stroke='#666' />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(data[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Line
                  key={key}
                  type='monotone'
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                />
              ))}
          </LineChart>
        );
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
      {title && <h3 className='text-lg font-semibold text-gray-900 mb-4'>{title}</h3>}
      <ResponsiveContainer width='100%' height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;
