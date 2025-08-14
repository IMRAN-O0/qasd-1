import React, { forwardRef } from 'react';
import { formatters } from '../../utils';
import { SYSTEM_CONFIG } from '../../constants';

// قالب الطباعة الأساسي
const PrintTemplate = forwardRef(
  (
    {
      title,
      subtitle,
      data,
      template = 'default',
      showHeader = true,
      showFooter = true,
      companyInfo,
      watermark,
      className = ''
    },
    ref
  ) => {
    const defaultCompanyInfo = {
      name: 'شركة المصنع المتكامل',
      address: 'الرياض، المملكة العربية السعودية',
      phone: '+966 11 123 4567',
      email: 'info@factory.com',
      website: 'www.factory.com',
      cr: '1234567890',
      vat: '123456789012345'
    };

    const company = { ...defaultCompanyInfo, ...companyInfo };
    const currentDate = new Date();

    return (
      <div ref={ref} className={`print-template bg-white ${className}`}>
        <style jsx>{`
          @media print {
            .print-template {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
            }

            .no-print {
              display: none !important;
            }

            .page-break {
              page-break-before: always;
            }

            .avoid-break {
              page-break-inside: avoid;
            }

            table {
              border-collapse: collapse;
              width: 100%;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: right;
            }

            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
          }
        `}</style>

        {/* رأس الصفحة */}
        {showHeader && (
          <div className='print-header mb-8 avoid-break'>
            <div className='flex justify-between items-start mb-6'>
              {/* معلومات الشركة */}
              <div className='company-info'>
                <h1 className='text-2xl font-bold text-gray-900 mb-2'>{company.name}</h1>
                <div className='text-sm text-gray-600 space-y-1'>
                  <p>{company.address}</p>
                  <p>
                    هاتف: {company.phone} | بريد: {company.email}
                  </p>
                  <p>موقع: {company.website}</p>
                  <div className='flex gap-4 mt-2'>
                    <span>س.ت: {company.cr}</span>
                    <span>ض.ق.م: {company.vat}</span>
                  </div>
                </div>
              </div>

              {/* الشعار */}
              <div className='logo'>
                <div className='w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center'>
                  <span className='text-gray-500 text-xs'>الشعار</span>
                </div>
              </div>
            </div>

            {/* عنوان التقرير */}
            <div className='text-center border-t border-b border-gray-300 py-4'>
              <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
              {subtitle && <p className='text-gray-600 mt-1'>{subtitle}</p>}
              <p className='text-sm text-gray-500 mt-2'>
                تاريخ الطباعة: {formatters.datetime(currentDate, 'long', '24')}
              </p>
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <div className='print-content'>
          {template === 'invoice' && <InvoiceTemplate data={data} />}
          {template === 'report' && <ReportTemplate data={data} />}
          {template === 'list' && <ListTemplate data={data} />}
          {template === 'form' && <FormTemplate data={data} />}
          {template === 'default' && <DefaultTemplate data={data} />}
        </div>

        {/* العلامة المائية */}
        {watermark && (
          <div className='fixed inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0'>
            <div className='transform rotate-45 text-6xl font-bold text-gray-400'>{watermark}</div>
          </div>
        )}

        {/* تذييل الصفحة */}
        {showFooter && (
          <div className='print-footer mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500'>
            <p>تم إنشاء هذا التقرير بواسطة نظام إدارة المصنع المتكامل</p>
            <p className='mt-1'>
              الصفحة <span className='page-number'></span> من <span className='total-pages'></span>
            </p>
          </div>
        )}
      </div>
    );
  }
);

// قالب الفاتورة
const InvoiceTemplate = ({ data }) => {
  const { invoice, items = [], totals = {} } = data;

  return (
    <div className='invoice-template'>
      {/* معلومات الفاتورة */}
      <div className='grid grid-cols-2 gap-8 mb-6'>
        <div>
          <h3 className='font-bold mb-3'>معلومات العميل:</h3>
          <div className='space-y-1 text-sm'>
            <p>
              <strong>الاسم:</strong> {invoice?.customerName}
            </p>
            <p>
              <strong>الكود:</strong> {invoice?.customerCode}
            </p>
            <p>
              <strong>العنوان:</strong> {invoice?.customerAddress}
            </p>
            <p>
              <strong>الهاتف:</strong> {invoice?.customerPhone}
            </p>
          </div>
        </div>

        <div>
          <h3 className='font-bold mb-3'>معلومات الفاتورة:</h3>
          <div className='space-y-1 text-sm'>
            <p>
              <strong>رقم الفاتورة:</strong> {invoice?.number}
            </p>
            <p>
              <strong>التاريخ:</strong> {formatters.date(invoice?.date)}
            </p>
            <p>
              <strong>تاريخ الاستحقاق:</strong> {formatters.date(invoice?.dueDate)}
            </p>
            <p>
              <strong>شروط الدفع:</strong> {invoice?.paymentTerms}
            </p>
          </div>
        </div>
      </div>

      {/* جدول الأصناف */}
      <table className='w-full mb-6'>
        <thead>
          <tr>
            <th>م</th>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{formatters.number(item.quantity)}</td>
              <td>{item.unit}</td>
              <td>{formatters.currency(item.price)}</td>
              <td>{formatters.currency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* الإجماليات */}
      <div className='flex justify-end'>
        <div className='w-64'>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>المجموع الفرعي:</span>
              <span>{formatters.currency(totals.subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span>الخصم:</span>
              <span>{formatters.currency(totals.discount)}</span>
            </div>
            <div className='flex justify-between'>
              <span>ضريبة القيمة المضافة ({totals.vatRate}%):</span>
              <span>{formatters.currency(totals.vat)}</span>
            </div>
            <div className='flex justify-between font-bold text-lg border-t pt-2'>
              <span>الإجمالي النهائي:</span>
              <span>{formatters.currency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// قالب التقرير
const ReportTemplate = ({ data }) => {
  const { summary = {}, details = [], charts = [] } = data;

  return (
    <div className='report-template'>
      {/* ملخص التقرير */}
      {Object.keys(summary).length > 0 && (
        <div className='summary-section mb-8 avoid-break'>
          <h3 className='font-bold text-lg mb-4'>ملخص التقرير</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className='bg-gray-50 p-3 rounded'>
                <p className='text-sm text-gray-600'>{key}</p>
                <p className='font-bold text-lg'>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تفاصيل التقرير */}
      {details.length > 0 && (
        <div className='details-section'>
          <h3 className='font-bold text-lg mb-4'>التفاصيل</h3>
          <table className='w-full'>
            <thead>
              <tr>{details[0] && Object.keys(details[0]).map(key => <th key={key}>{key}</th>)}</tr>
            </thead>
            <tbody>
              {details.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// قالب القائمة
const ListTemplate = ({ data }) => {
  const { items = [], columns = [] } = data;

  return (
    <div className='list-template'>
      <table className='w-full'>
        <thead>
          <tr>
            <th>م</th>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              {columns.map(col => (
                <td key={col.key}>{col.format ? formatters[col.format](item[col.key]) : item[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// قالب النموذج
const FormTemplate = ({ data }) => {
  const { fields = [] } = data;

  return (
    <div className='form-template'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {fields.map((field, index) => (
          <div key={index} className='field-group'>
            <label className='block font-medium text-gray-700 mb-1'>{field.label}:</label>
            <div className='border-b border-gray-300 pb-1 min-h-[24px]'>{field.value || '_______________'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// القالب الافتراضي
const DefaultTemplate = ({ data }) => {
  return (
    <div className='default-template'>
      <pre className='whitespace-pre-wrap font-mono text-sm'>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

PrintTemplate.displayName = 'PrintTemplate';

export default PrintTemplate;
