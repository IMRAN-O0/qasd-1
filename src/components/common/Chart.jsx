import React from 'react';
import {
  LineChart,
  Line,
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

const Chart = ({
  type = 'line',
  data = [],
  width = '100%',
  height = 300,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  xAxisDataKey = 'name',
  yAxisDataKey = 'value',
  lines = [],
  bars = [],
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  className = '',
  title = '',
  ...props
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray='3 3' />}
            <XAxis dataKey={xAxisDataKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {lines.length > 0 ? (
              lines.map((line, index) => (
                <Line
                  key={line.dataKey}
                  type='monotone'
                  dataKey={line.dataKey}
                  stroke={line.color || colors[index % colors.length]}
                  strokeWidth={line.strokeWidth || 2}
                  name={line.name}
                />
              ))
            ) : (
              <Line type='monotone' dataKey={yAxisDataKey} stroke={colors[0]} strokeWidth={2} />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray='3 3' />}
            <XAxis dataKey={xAxisDataKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {bars.length > 0 ? (
              bars.map((bar, index) => (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  fill={bar.color || colors[index % colors.length]}
                  name={bar.name}
                />
              ))
            ) : (
              <Bar dataKey={yAxisDataKey} fill={colors[0]} />
            )}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill='#8884d8'
              dataKey={yAxisDataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className='text-lg font-semibold text-gray-800 mb-4 text-center'>{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
