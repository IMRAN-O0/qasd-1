import React, { useState } from 'react';

const Tabs = ({
  tabs = [],
  defaultTab = 0,
  onChange = () => {},
  variant = 'default', // default, pills, underline
  size = 'md', // sm, md, lg
  className = '',
  tabClassName = '',
  contentClassName = '',
  direction = 'horizontal', // horizontal, vertical
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = index => {
    setActiveTab(index);
    onChange(index, tabs[index]);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'pills':
        return {
          container: 'bg-gray-100 p-1 rounded-lg',
          tab: `px-3 py-2 rounded-md transition-colors duration-200 ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          }`,
          activeTab: 'bg-white text-blue-600 shadow-sm',
          inactiveTab: 'text-gray-600 hover:text-gray-800'
        };
      case 'underline':
        return {
          container: 'border-b border-gray-200',
          tab: `px-4 py-2 border-b-2 transition-colors duration-200 ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          }`,
          activeTab: 'border-blue-500 text-blue-600',
          inactiveTab: 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
        };
      default:
        return {
          container: 'border-b border-gray-200',
          tab: `px-4 py-2 border-b-2 transition-colors duration-200 ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          }`,
          activeTab: 'border-blue-500 text-blue-600 bg-blue-50',
          inactiveTab: 'border-transparent text-gray-600 hover:text-gray-800'
        };
    }
  };

  const classes = getVariantClasses();

  if (direction === 'vertical') {
    return (
      <div className={`flex ${className}`} {...props}>
        {/* علامات التبويب العمودية */}
        <div className={`flex flex-col ${classes.container} border-b-0 border-r border-gray-200 min-w-48`}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`
                ${classes.tab} ${tabClassName}
                ${activeTab === index ? classes.activeTab : classes.inactiveTab}
                text-right border-b-0 border-r-2
              `}
              disabled={tab.disabled}
            >
              <div className='flex items-center gap-2'>
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center'>
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* محتوى التبويب */}
        <div className={`flex-1 p-4 ${contentClassName}`}>{tabs[activeTab] && tabs[activeTab].content}</div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* علامات التبويب الأفقية */}
      <div className={`flex ${classes.container}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`
              ${classes.tab} ${tabClassName}
              ${activeTab === index ? classes.activeTab : classes.inactiveTab}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={tab.disabled}
          >
            <div className='flex items-center gap-2'>
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center'>
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* محتوى التبويب */}
      <div className={`mt-4 ${contentClassName}`}>{tabs[activeTab] && tabs[activeTab].content}</div>
    </div>
  );
};

// مكون TabPanel منفصل للاستخدام المرن
const TabPanel = ({ children, value, index, ...props }) => {
  return (
    <div role='tabpanel' hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...props}>
      {value === index && children}
    </div>
  );
};

Tabs.Panel = TabPanel;

export default Tabs;
