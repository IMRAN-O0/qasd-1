import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

const Stepper = ({
  steps = [],
  currentStep = 0,
  orientation = 'horizontal', // horizontal, vertical
  size = 'md', // sm, md, lg
  variant = 'default', // default, minimal, circles
  className = '',
  onStepClick = null,
  showStepNumber = true,
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          circle: 'w-6 h-6 text-xs',
          title: 'text-sm',
          description: 'text-xs',
          connector: 'h-0.5'
        };
      case 'lg':
        return {
          circle: 'w-12 h-12 text-lg',
          title: 'text-lg',
          description: 'text-base',
          connector: 'h-1'
        };
      default:
        return {
          circle: 'w-8 h-8 text-sm',
          title: 'text-base',
          description: 'text-sm',
          connector: 'h-0.5'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getStepStatus = index => {
    if (index < currentStep) {
      return 'completed';
    }
    if (index === currentStep) {
      return 'current';
    }
    return 'upcoming';
  };

  const getStepClasses = status => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 text-white border-green-500',
          title: 'text-green-600 font-medium',
          description: 'text-green-500',
          connector: 'bg-green-500'
        };
      case 'current':
        return {
          circle: 'bg-blue-500 text-white border-blue-500 ring-4 ring-blue-100',
          title: 'text-blue-600 font-medium',
          description: 'text-blue-500',
          connector: 'bg-gray-300'
        };
      default:
        return {
          circle: 'bg-gray-100 text-gray-400 border-gray-300',
          title: 'text-gray-400',
          description: 'text-gray-300',
          connector: 'bg-gray-300'
        };
    }
  };

  const renderStepContent = (step, index) => {
    const status = getStepStatus(index);
    const stepClasses = getStepClasses(status);

    return (
      <div className={`flex items-center ${orientation === 'vertical' ? 'flex-col text-center' : ''}`}>
        {/* دائرة الخطوة */}
        <div
          className={`
            ${sizeClasses.circle} ${stepClasses.circle}
            flex items-center justify-center rounded-full border-2 transition-all duration-200
            ${onStepClick && status !== 'upcoming' ? 'cursor-pointer hover:scale-105' : ''}
          `}
          onClick={() => onStepClick && status !== 'upcoming' && onStepClick(index)}
        >
          {status === 'completed' ? (
            <Check size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16} />
          ) : (
            showStepNumber && <span>{index + 1}</span>
          )}
          {step.icon && !showStepNumber && status !== 'completed' && step.icon}
        </div>

        {/* تفاصيل الخطوة */}
        {(step.title || step.description) && (
          <div className={`${orientation === 'vertical' ? 'mt-2' : 'mr-3 mr-reverse'} text-right`}>
            {step.title && (
              <div className={`${sizeClasses.title} ${stepClasses.title} transition-colors duration-200`}>
                {step.title}
              </div>
            )}
            {step.description && (
              <div
                className={`${sizeClasses.description} ${stepClasses.description} mt-1 transition-colors duration-200`}
              >
                {step.description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderConnector = index => {
    if (index === steps.length - 1) {
      return null;
    }

    const status = getStepStatus(index);
    const stepClasses = getStepClasses(status);

    if (orientation === 'vertical') {
      return (
        <div className='flex justify-center my-2'>
          <div className={`w-0.5 h-8 ${stepClasses.connector} transition-colors duration-200`} />
        </div>
      );
    }

    return (
      <div className='flex-1 mx-4'>
        <div className={`${sizeClasses.connector} ${stepClasses.connector} transition-colors duration-200`} />
      </div>
    );
  };

  if (variant === 'minimal') {
    return (
      <div className={`${className}`} {...props}>
        <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'items-center'}`}>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className='flex items-center'>
                <span className={`${sizeClasses.title} ${getStepClasses(getStepStatus(index)).title}`}>
                  {step.title}
                </span>
              </div>
              {orientation === 'horizontal' && index < steps.length - 1 && (
                <ChevronRight className='mx-2 text-gray-400' size={16} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'circles') {
    return (
      <div className={`${className}`} {...props}>
        <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'items-center justify-center'}`}>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div
                className={`
                  ${sizeClasses.circle} ${getStepClasses(getStepStatus(index)).circle}
                  flex items-center justify-center rounded-full border-2 transition-all duration-200
                  ${onStepClick && getStepStatus(index) !== 'upcoming' ? 'cursor-pointer hover:scale-105' : ''}
                `}
                onClick={() => onStepClick && getStepStatus(index) !== 'upcoming' && onStepClick(index)}
                title={step.title}
              >
                {getStepStatus(index) === 'completed' ? (
                  <Check size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {renderConnector(index)}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`} {...props}>
      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'items-center'}`}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {renderStepContent(step, index)}
            {renderConnector(index)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
