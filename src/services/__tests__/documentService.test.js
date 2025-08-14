import documentService from '../documentService';

// Mock fetch globally
global.fetch = jest.fn();

describe('Document Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getDocuments', () => {
    it('should fetch documents successfully', async () => {
      const mockDocuments = [
        { id: 1, title: 'Document 1', type: 'report' },
        { id: 2, title: 'Document 2', type: 'form' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockDocuments })
      });

      const result = await documentService.getDocuments();
      expect(result.data).toEqual(mockDocuments);
      expect(fetch).toHaveBeenCalledWith('/api/documents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String)
        }
      });
    });

    it('should handle fetch errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(documentService.getDocuments()).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(documentService.getDocuments()).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('createDocument', () => {
    it('should create document successfully', async () => {
      const newDocument = { title: 'New Document', type: 'report', content: 'Test content' };
      const createdDocument = { id: 3, ...newDocument };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: createdDocument })
      });

      const result = await documentService.createDocument(newDocument);
      expect(result.data).toEqual(createdDocument);
      expect(fetch).toHaveBeenCalledWith('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String)
        },
        body: JSON.stringify(newDocument)
      });
    });

    it('should validate required fields', async () => {
      await expect(documentService.createDocument({})).rejects.toThrow('Title is required');
      await expect(documentService.createDocument({ title: '' })).rejects.toThrow('Title is required');
    });
  });

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const documentId = 1;
      const updates = { title: 'Updated Title' };
      const updatedDocument = { id: documentId, title: 'Updated Title', type: 'report' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: updatedDocument })
      });

      const result = await documentService.updateDocument(documentId, updates);
      expect(result.data).toEqual(updatedDocument);
      expect(fetch).toHaveBeenCalledWith(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String)
        },
        body: JSON.stringify(updates)
      });
    });

    it('should validate document ID', async () => {
      await expect(documentService.updateDocument(null, {})).rejects.toThrow('Document ID is required');
      await expect(documentService.updateDocument('', {})).rejects.toThrow('Document ID is required');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      const documentId = 1;

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await documentService.deleteDocument(documentId);
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String)
        }
      });
    });

    it('should validate document ID', async () => {
      await expect(documentService.deleteDocument(null)).rejects.toThrow('Document ID is required');
    });
  });

  describe('generateDocument', () => {
    it('should generate document successfully', async () => {
      const templateId = 'template-1';
      const data = { name: 'John Doe', date: '2024-01-15' };
      const generatedDocument = { id: 4, title: 'Generated Document', content: 'Generated content' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: generatedDocument })
      });

      const result = await documentService.generateDocument(templateId, data);
      expect(result.data).toEqual(generatedDocument);
      expect(fetch).toHaveBeenCalledWith('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String)
        },
        body: JSON.stringify({ templateId, data })
      });
    });

    it('should validate template ID', async () => {
      await expect(documentService.generateDocument(null, {})).rejects.toThrow('Template ID is required');
    });
  });

  describe('searchDocuments', () => {
    it('should search documents successfully', async () => {
      const query = 'test search';
      const filters = { type: 'report' };
      const searchResults = [{ id: 1, title: 'Test Document', type: 'report' }];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: searchResults, total: 1 })
      });

      const result = await documentService.searchDocuments(query, filters);
      expect(result.data).toEqual(searchResults);
      expect(result.total).toBe(1);
    });

    it('should handle empty search results', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 })
      });

      const result = await documentService.searchDocuments('nonexistent');
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
