import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Download } from 'lucide-react';

const FileUpload = ({
  accept = '*/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  onFileSelect = () => {},
  onFileRemove = () => {},
  className = '',
  disabled = false,
  showPreview = true,
  allowedTypes = [],
  label = 'اختر الملفات',
  description = 'اسحب الملفات هنا أو انقر للاختيار',
  ...props
}) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = file => {
    // التحقق من الحجم
    if (file.size > maxSize) {
      return `الملف كبير جداً. الحد الأقصى ${(maxSize / 1024 / 1024).toFixed(1)} ميجا`;
    }

    // التحقق من نوع الملف
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = selectedFiles => {
    const fileArray = Array.from(selectedFiles);

    // التحقق من عدد الملفات
    if (!multiple && fileArray.length > 1) {
      setError('يمكن اختيار ملف واحد فقط');
      return;
    }

    if (files.length + fileArray.length > maxFiles) {
      setError(`لا يمكن رفع أكثر من ${maxFiles} ملفات`);
      return;
    }

    // التحقق من صحة كل ملف
    const validFiles = [];
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation) {
        setError(validation);
        return;
      }
      validFiles.push({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      });
    }

    setError('');
    const newFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(newFiles);
    onFileSelect(newFiles);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) {
      return;
    }

    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = e => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = fileId => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFileRemove(updatedFiles);
  };

  const getFileIcon = type => {
    if (type.startsWith('image/')) {
      return <Image size={20} />;
    }
    if (type.includes('pdf')) {
      return <FileText size={20} />;
    }
    return <File size={20} />;
  };

  const formatFileSize = bytes => {
    if (bytes === 0) {
      return '0 بايت';
    }
    const k = 1024;
    const sizes = ['بايت', 'كيلو', 'ميجا', 'جيجا'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>}

      {/* منطقة الرفع */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept={accept}
          multiple={multiple}
          onChange={e => handleFileSelect(e.target.files)}
          className='hidden'
          disabled={disabled}
        />

        <Upload className='mx-auto mb-4 text-gray-400' size={48} />
        <p className='text-lg font-medium text-gray-700 mb-1'>{label}</p>
        <p className='text-sm text-gray-500'>{description}</p>

        {maxSize && (
          <p className='text-xs text-gray-400 mt-2'>الحد الأقصى: {(maxSize / 1024 / 1024).toFixed(1)} ميجا</p>
        )}
      </div>

      {/* رسالة الخطأ */}
      {error && <div className='mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2'>{error}</div>}

      {/* معاينة الملفات */}
      {showPreview && files.length > 0 && (
        <div className='mt-4 space-y-2'>
          <h4 className='text-sm font-medium text-gray-700'>الملفات المختارة:</h4>
          {files.map(fileItem => (
            <div key={fileItem.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'>
              <div className='flex items-center space-x-3 space-x-reverse'>
                {fileItem.preview ? (
                  <img src={fileItem.preview} alt={fileItem.name} className='w-10 h-10 rounded object-cover' />
                ) : (
                  <div className='w-10 h-10 bg-gray-200 rounded flex items-center justify-center'>
                    {getFileIcon(fileItem.type)}
                  </div>
                )}
                <div>
                  <p className='text-sm font-medium text-gray-900'>{fileItem.name}</p>
                  <p className='text-xs text-gray-500'>{formatFileSize(fileItem.size)}</p>
                </div>
              </div>

              <div className='flex items-center space-x-2 space-x-reverse'>
                {fileItem.preview && (
                  <button
                    type='button'
                    onClick={() => window.open(fileItem.preview, '_blank')}
                    className='text-blue-600 hover:text-blue-800'
                    title='معاينة'
                  >
                    <Download size={16} />
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => removeFile(fileItem.id)}
                  className='text-red-600 hover:text-red-800'
                  title='حذف'
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
