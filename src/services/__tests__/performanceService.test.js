import { loadComponentByName } from '../performanceService';

// اختبار بسيط لدالة تحميل المكونات
describe('loadComponentByName', () => {
  test('should load Dashboard component', async () => {
    try {
      const component = await loadComponentByName('Dashboard');
      expect(component).toBeDefined();
      console.log('✅ Dashboard component loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Dashboard component:', error);
      throw error;
    }
  });

  test('should load SalesPage component', async () => {
    try {
      const component = await loadComponentByName('SalesPage');
      expect(component).toBeDefined();
      console.log('✅ SalesPage component loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load SalesPage component:', error);
      throw error;
    }
  });

  test('should throw error for non-existent component', async () => {
    try {
      await loadComponentByName('NonExistentComponent');
      throw new Error('Should have thrown an error');
    } catch (error) {
      expect(error.message).toContain('Component not found');
      console.log('✅ Error handling works correctly for non-existent component');
    }
  });
});

// اختبار يدوي يمكن تشغيله في المتصفح
if (typeof window !== 'undefined') {
  window.testLoadComponent = async () => {
    console.log('🧪 Testing loadComponentByName function...');
    
    try {
      const dashboard = await loadComponentByName('Dashboard');
      console.log('✅ Dashboard loaded:', dashboard);
      
      const salesPage = await loadComponentByName('SalesPage');
      console.log('✅ SalesPage loaded:', salesPage);
      
      console.log('🎉 All tests passed!');
      return true;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  };
}