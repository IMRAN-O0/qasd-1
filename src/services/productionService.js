import api from './api';

export const createBatchProductionRecord = async data => {
  try {
    const response = await api.post('/production/batches', data);
    return response.data;
  } catch (error) {
    console.error('Error creating batch production record:', error);
    throw error;
  }
};
