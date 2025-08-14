import React, { useState, useEffect, useRef } from 'react';
import {
  FolderIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import documentService from '../../services/documentService';

const DocumentManager = () => {
  const { user } = useAuth();
  const { request } = useApi();
  const fileInputRef = useRef(null);

  // State management
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('name'); // name, date, size, type
  const [filterBy, setFilterBy] = useState('all'); // all, documents, folders
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});

  // Document types configuration
  const documentTypes = {
    contracts: { name: 'العقود', icon: '📄', color: 'blue' },
    certificates: { name: 'الشهادات', icon: '🏆', color: 'green' },
    reports: { name: 'التقارير', icon: '📊', color: 'purple' },
    procedures: { name: 'الإجراءات', icon: '📋', color: 'orange' },
    policies: { name: 'السياسات', icon: '📜', color: 'red' },
    training: { name: 'التدريب', icon: '🎓', color: 'indigo' },
    quality: { name: 'الجودة', icon: '✅', color: 'emerald' },
    safety: { name: 'السلامة', icon: '🛡️', color: 'yellow' },
    maintenance: { name: 'الصيانة', icon: '🔧', color: 'gray' },
    financial: { name: 'المالية', icon: '💰', color: 'cyan' }
  };

  // Load documents and folders
  useEffect(() => {
    loadDocuments();
    loadFolders();
  }, [currentFolder]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await request('/api/documents', {
        params: { folderId: currentFolder?.id }
      });
      setDocuments(response.data || mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments(mockDocuments);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await request('/api/folders', {
        params: { parentId: currentFolder?.id }
      });
      setFolders(response.data || mockFolders);
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders(mockFolders);
    }
  };

  // Mock data for development
  const mockDocuments = [
    {
      id: 1,
      name: 'ISO 9001 Certificate.pdf',
      type: 'certificates',
      size: '2.5 MB',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      createdBy: 'أحمد محمد',
      version: '1.0',
      status: 'approved',
      tags: ['ISO', 'Quality', 'Certificate'],
      permissions: ['view', 'download'],
      isLocked: false,
      hasSignature: true
    },
    {
      id: 2,
      name: 'Production SOP.docx',
      type: 'procedures',
      size: '1.8 MB',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-16T09:15:00Z',
      createdBy: 'سارة أحمد',
      version: '2.1',
      status: 'draft',
      tags: ['SOP', 'Production', 'Procedures'],
      permissions: ['view', 'edit', 'download'],
      isLocked: true,
      hasSignature: false
    },
    {
      id: 3,
      name: 'Monthly Quality Report.pdf',
      type: 'reports',
      size: '4.2 MB',
      createdAt: '2024-01-10T16:45:00Z',
      updatedAt: '2024-01-10T16:45:00Z',
      createdBy: 'محمد علي',
      version: '1.0',
      status: 'approved',
      tags: ['Quality', 'Monthly', 'Report'],
      permissions: ['view', 'download'],
      isLocked: false,
      hasSignature: true
    }
  ];

  const mockFolders = [
    {
      id: 1,
      name: 'Quality Management',
      type: 'quality',
      itemCount: 15,
      createdAt: '2024-01-01T00:00:00Z',
      permissions: ['view', 'edit']
    },
    {
      id: 2,
      name: 'Safety Procedures',
      type: 'safety',
      itemCount: 8,
      createdAt: '2024-01-01T00:00:00Z',
      permissions: ['view']
    },
    {
      id: 3,
      name: 'Training Materials',
      type: 'training',
      itemCount: 23,
      createdAt: '2024-01-01T00:00:00Z',
      permissions: ['view', 'edit', 'delete']
    }
  ];

  // Filter and sort documents
  const filteredItems = [...folders, ...documents]
    .filter(item => {
      if (filterBy === 'documents' && item.itemCount !== undefined) {
        return false;
      }
      if (filterBy === 'folders' && item.itemCount === undefined) {
        return false;
      }
      if (searchTerm) {
        return (
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        case 'size':
          if (a.itemCount !== undefined && b.itemCount !== undefined) {
            return b.itemCount - a.itemCount;
          }
          if (a.itemCount !== undefined) {
            return -1;
          }
          if (b.itemCount !== undefined) {
            return 1;
          }
          return parseFloat(b.size) - parseFloat(a.size);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

  // File upload handler
  const handleFileUpload = async files => {
    const uploadPromises = Array.from(files).map(async file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', currentFolder?.id || '');
      formData.append('type', detectDocumentType(file.name));

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        const response = await request('/api/documents/upload', {
          method: 'POST',
          body: formData,
          onUploadProgress: progressEvent => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        });

        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });

        return response.data;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
        throw error;
      }
    });

    try {
      await Promise.all(uploadPromises);
      loadDocuments();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Detect document type based on filename
  const detectDocumentType = filename => {
    const name = filename.toLowerCase();
    if (name.includes('certificate') || name.includes('cert')) {
      return 'certificates';
    }
    if (name.includes('report')) {
      return 'reports';
    }
    if (name.includes('sop') || name.includes('procedure')) {
      return 'procedures';
    }
    if (name.includes('policy')) {
      return 'policies';
    }
    if (name.includes('training')) {
      return 'training';
    }
    if (name.includes('quality')) {
      return 'quality';
    }
    if (name.includes('safety')) {
      return 'safety';
    }
    if (name.includes('maintenance')) {
      return 'maintenance';
    }
    if (name.includes('financial') || name.includes('invoice')) {
      return 'financial';
    }
    return 'contracts';
  };

  // Create new folder
  const createFolder = async (folderName, folderType) => {
    try {
      const response = await request('/api/folders', {
        method: 'POST',
        body: {
          name: folderName,
          type: folderType,
          parentId: currentFolder?.id
        }
      });
      loadFolders();
      setShowNewFolderModal(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  // Delete selected items
  const deleteSelectedItems = async () => {
    if (!window.confirm('هل أنت متأكد من حذف العناصر المحددة؟')) {
      return;
    }

    try {
      await Promise.all(
        selectedItems.map(async item => {
          const endpoint = item.itemCount !== undefined ? '/api/folders' : '/api/documents';
          await request(`${endpoint}/${item.id}`, { method: 'DELETE' });
        })
      );

      setSelectedItems([]);
      loadDocuments();
      loadFolders();
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  // Generate document using template
  const generateDocument = async (templateType, data) => {
    try {
      const doc = await documentService.templates[templateType.category][templateType.type](data);
      const filename = `${templateType.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      documentService.saveDocument(doc, filename);
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };

  // Get status color
  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'review':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className='h-full flex flex-col bg-white' dir='rtl'>
      {/* Header */}
      <div className='border-b border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold text-gray-900'>إدارة المستندات</h1>
          <div className='flex items-center space-x-reverse space-x-4'>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-reverse space-x-2'
            >
              <FolderIcon className='h-5 w-5' />
              <span>مجلد جديد</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-reverse space-x-2'
            >
              <PlusIcon className='h-5 w-5' />
              <span>رفع ملف</span>
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className='flex items-center space-x-reverse space-x-4'>
          <div className='flex-1 relative'>
            <MagnifyingGlassIcon className='h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='البحث في المستندات...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          <select
            value={filterBy}
            onChange={e => setFilterBy(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>جميع العناصر</option>
            <option value='documents'>المستندات فقط</option>
            <option value='folders'>المجلدات فقط</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          >
            <option value='name'>ترتيب بالاسم</option>
            <option value='date'>ترتيب بالتاريخ</option>
            <option value='size'>ترتيب بالحجم</option>
            <option value='type'>ترتيب بالنوع</option>
          </select>

          <div className='flex border border-gray-300 rounded-lg'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        {currentFolder && (
          <div className='mt-4 flex items-center space-x-reverse space-x-2 text-sm text-gray-600'>
            <button onClick={() => setCurrentFolder(null)} className='hover:text-blue-600'>
              الرئيسية
            </button>
            <span>/</span>
            <span className='text-gray-900'>{currentFolder.name}</span>
          </div>
        )}

        {/* Selected items actions */}
        {selectedItems.length > 0 && (
          <div className='mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg'>
            <span className='text-blue-800'>تم تحديد {selectedItems.length} عنصر</span>
            <div className='flex items-center space-x-reverse space-x-2'>
              <button
                onClick={deleteSelectedItems}
                className='text-red-600 hover:text-red-800 flex items-center space-x-reverse space-x-1'
              >
                <TrashIcon className='h-4 w-4' />
                <span>حذف</span>
              </button>
              <button className='text-blue-600 hover:text-blue-800 flex items-center space-x-reverse space-x-1'>
                <ShareIcon className='h-4 w-4' />
                <span>مشاركة</span>
              </button>
              <button className='text-green-600 hover:text-green-800 flex items-center space-x-reverse space-x-1'>
                <ArrowDownTrayIcon className='h-4 w-4' />
                <span>تحميل</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-auto p-6'>
        {loading ? (
          <div className='flex items-center justify-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className='text-center py-12'>
            <DocumentIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>لا توجد مستندات</h3>
            <p className='text-gray-600 mb-4'>ابدأ برفع أول مستند أو إنشاء مجلد جديد</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            >
              رفع ملف
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-2'
            }
          >
            {filteredItems.map(item => (
              <DocumentItem
                key={`${item.itemCount !== undefined ? 'folder' : 'document'}-${item.id}`}
                item={item}
                viewMode={viewMode}
                documentTypes={documentTypes}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                setCurrentFolder={setCurrentFolder}
                setSelectedDocument={setSelectedDocument}
                setShowVersionHistory={setShowVersionHistory}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className='fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm'>
          <h4 className='font-medium text-gray-900 mb-2'>جاري الرفع...</h4>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className='mb-2'>
              <div className='flex justify-between text-sm text-gray-600 mb-1'>
                <span className='truncate'>{filename}</span>
                <span>{progress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
          documentTypes={documentTypes}
        />
      )}

      {showNewFolderModal && (
        <NewFolderModal
          onClose={() => setShowNewFolderModal(false)}
          onCreate={createFolder}
          documentTypes={documentTypes}
        />
      )}

      {showVersionHistory && selectedDocument && (
        <VersionHistoryModal
          document={selectedDocument}
          onClose={() => {
            setShowVersionHistory(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};

// Document/Folder Item Component
const DocumentItem = ({
  item,
  viewMode,
  documentTypes,
  selectedItems,
  setSelectedItems,
  setCurrentFolder,
  setSelectedDocument,
  setShowVersionHistory,
  getStatusColor
}) => {
  const isFolder = item.itemCount !== undefined;
  const isSelected = selectedItems.some(selected => selected.id === item.id);
  const typeConfig = documentTypes[item.type] || { name: item.type, icon: '📄', color: 'gray' };

  const handleSelect = e => {
    e.stopPropagation();
    if (isSelected) {
      setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const handleClick = () => {
    if (isFolder) {
      setCurrentFolder(item);
    } else {
      setSelectedDocument(item);
      setShowVersionHistory(true);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div
        className={`relative bg-white border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={handleClick}
      >
        <div className='absolute top-2 left-2'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={handleSelect}
            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            onClick={e => e.stopPropagation()}
          />
        </div>

        <div className='text-center'>
          <div className={`text-4xl mb-2 ${isFolder ? 'text-blue-500' : ''}`}>{isFolder ? '📁' : typeConfig.icon}</div>
          <h3 className='font-medium text-gray-900 truncate mb-1'>{item.name}</h3>
          <p className='text-sm text-gray-600 mb-2'>{isFolder ? `${item.itemCount} عنصر` : item.size}</p>

          {!isFolder && (
            <>
              <div className='flex items-center justify-center space-x-reverse space-x-2 mb-2'>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                  {item.status === 'approved'
                    ? 'معتمد'
                    : item.status === 'draft'
                      ? 'مسودة'
                      : item.status === 'review'
                        ? 'قيد المراجعة'
                        : 'مرفوض'}
                </span>
                {item.hasSignature && <CheckCircleIcon className='h-4 w-4 text-green-500' title='موقع رقمياً' />}
                {item.isLocked && <LockClosedIcon className='h-4 w-4 text-red-500' title='مقفل' />}
              </div>

              <div className='flex flex-wrap gap-1 mb-2'>
                {item.tags?.slice(0, 2).map((tag, index) => (
                  <span key={index} className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'>
                    {tag}
                  </span>
                ))}
                {item.tags?.length > 2 && (
                  <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'>+{item.tags.length - 2}</span>
                )}
              </div>
            </>
          )}

          <div className='text-xs text-gray-500'>
            <div className='flex items-center justify-center space-x-reverse space-x-1 mb-1'>
              <UserIcon className='h-3 w-3' />
              <span>{item.createdBy}</span>
            </div>
            <div className='flex items-center justify-center space-x-reverse space-x-1'>
              <ClockIcon className='h-3 w-3' />
              <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
      }`}
      onClick={handleClick}
    >
      <input
        type='checkbox'
        checked={isSelected}
        onChange={handleSelect}
        className='ml-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
        onClick={e => e.stopPropagation()}
      />

      <div className='text-2xl ml-3'>{isFolder ? '📁' : typeConfig.icon}</div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center space-x-reverse space-x-2'>
          <h3 className='font-medium text-gray-900 truncate'>{item.name}</h3>
          {!isFolder && (
            <>
              {item.hasSignature && <CheckCircleIcon className='h-4 w-4 text-green-500' title='موقع رقمياً' />}
              {item.isLocked && <LockClosedIcon className='h-4 w-4 text-red-500' title='مقفل' />}
            </>
          )}
        </div>

        <div className='flex items-center space-x-reverse space-x-4 text-sm text-gray-600'>
          <span>{isFolder ? `${item.itemCount} عنصر` : item.size}</span>
          <span>{item.createdBy}</span>
          <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString('ar-SA')}</span>
          {!isFolder && (
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
              {item.status === 'approved'
                ? 'معتمد'
                : item.status === 'draft'
                  ? 'مسودة'
                  : item.status === 'review'
                    ? 'قيد المراجعة'
                    : 'مرفوض'}
            </span>
          )}
        </div>

        {!isFolder && item.tags && (
          <div className='flex flex-wrap gap-1 mt-1'>
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'>
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'>+{item.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className='flex items-center space-x-reverse space-x-2'>
        <button className='p-1 text-gray-400 hover:text-gray-600'>
          <EyeIcon className='h-4 w-4' />
        </button>
        <button className='p-1 text-gray-400 hover:text-gray-600'>
          <ArrowDownTrayIcon className='h-4 w-4' />
        </button>
        <button className='p-1 text-gray-400 hover:text-gray-600'>
          <ShareIcon className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
};

// Upload Modal Component
const UploadModal = ({ onClose, onUpload, documentTypes }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedType, setSelectedType] = useState('contracts');
  const fileInputRef = useRef(null);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = e => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>رفع ملفات جديدة</h2>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>نوع المستند</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          >
            {Object.entries(documentTypes).map(([key, type]) => (
              <option key={key} value={key}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type='file'
            multiple
            onChange={handleFileSelect}
            className='hidden'
            accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png'
          />

          <DocumentIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-600 mb-2'>اسحب الملفات هنا أو انقر للاختيار</p>
          <p className='text-sm text-gray-500'>PDF, Word, Excel, PowerPoint, Images</p>
        </div>

        {selectedFiles.length > 0 && (
          <div className='mt-4'>
            <h3 className='font-medium text-gray-900 mb-2'>الملفات المحددة:</h3>
            <div className='space-y-2 max-h-32 overflow-y-auto'>
              {selectedFiles.map((file, index) => (
                <div key={index} className='flex items-center justify-between text-sm'>
                  <span className='truncate'>{file.name}</span>
                  <span className='text-gray-500'>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='flex justify-end space-x-reverse space-x-3 mt-6'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            إلغاء
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            رفع الملفات
          </button>
        </div>
      </div>
    </div>
  );
};

// New Folder Modal Component
const NewFolderModal = ({ onClose, onCreate, documentTypes }) => {
  const [folderName, setFolderName] = useState('');
  const [folderType, setFolderType] = useState('contracts');

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreate(folderName.trim(), folderType);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>إنشاء مجلد جديد</h2>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>اسم المجلد</label>
          <input
            type='text'
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            placeholder='أدخل اسم المجلد'
            autoFocus
          />
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>نوع المجلد</label>
          <select
            value={folderType}
            onChange={e => setFolderType(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          >
            {Object.entries(documentTypes).map(([key, type]) => (
              <option key={key} value={key}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex justify-end space-x-reverse space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            إلغاء
          </button>
          <button
            onClick={handleCreate}
            disabled={!folderName.trim()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            إنشاء المجلد
          </button>
        </div>
      </div>
    </div>
  );
};

// Version History Modal Component
const VersionHistoryModal = ({ document, onClose }) => {
  const [versions] = useState([
    {
      version: '2.1',
      date: '2024-01-16T09:15:00Z',
      author: 'سارة أحمد',
      changes: 'تحديث إجراءات السلامة',
      size: '1.8 MB',
      isCurrent: true
    },
    {
      version: '2.0',
      date: '2024-01-10T14:30:00Z',
      author: 'محمد علي',
      changes: 'إضافة قسم مراقبة الجودة',
      size: '1.6 MB',
      isCurrent: false
    },
    {
      version: '1.0',
      date: '2024-01-01T10:00:00Z',
      author: 'أحمد محمد',
      changes: 'النسخة الأولى',
      size: '1.2 MB',
      isCurrent: false
    }
  ]);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold text-gray-900'>تاريخ الإصدارات</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='mb-4 p-4 bg-gray-50 rounded-lg'>
          <h3 className='font-medium text-gray-900'>{document.name}</h3>
          <p className='text-sm text-gray-600'>النسخة الحالية: {document.version}</p>
        </div>

        <div className='space-y-4'>
          {versions.map((version, index) => (
            <div key={version.version} className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center space-x-reverse space-x-2'>
                  <span className='font-medium text-gray-900'>الإصدار {version.version}</span>
                  {version.isCurrent && (
                    <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>الحالي</span>
                  )}
                </div>
                <span className='text-sm text-gray-500'>{version.size}</span>
              </div>

              <div className='text-sm text-gray-600 mb-2'>
                <div className='flex items-center space-x-reverse space-x-4'>
                  <span>بواسطة: {version.author}</span>
                  <span>{new Date(version.date).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>

              <p className='text-sm text-gray-700 mb-3'>{version.changes}</p>

              <div className='flex items-center space-x-reverse space-x-2'>
                <button className='text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-reverse space-x-1'>
                  <EyeIcon className='h-4 w-4' />
                  <span>عرض</span>
                </button>
                <button className='text-green-600 hover:text-green-800 text-sm flex items-center space-x-reverse space-x-1'>
                  <ArrowDownTrayIcon className='h-4 w-4' />
                  <span>تحميل</span>
                </button>
                {!version.isCurrent && (
                  <button className='text-orange-600 hover:text-orange-800 text-sm flex items-center space-x-reverse space-x-1'>
                    <DocumentDuplicateIcon className='h-4 w-4' />
                    <span>استعادة</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
