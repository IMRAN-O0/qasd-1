// Auth Pages
export { default as LoginPage } from './core/LoginPage';
export { default as LoginSetup } from './auth/LoginSetup';
export { default as UserManagement } from './auth/UserManagement';

// Core Pages
export { default as Dashboard } from './core/Dashboard';

// Sales Pages
export { default as SalesPage } from './sales/SalesPage';
export { default as CustomersPage } from './sales/customers';
export { default as InvoicesPage } from './sales/invoices';
export { default as ProductsPage } from './sales/products';
export { default as QuotationPage } from './sales/quotation';

// Inventory Pages
export { default as InventoryPage } from './inventory/InventoryPage';
export { default as AddMaterial } from './inventory/AddMaterial';
export { default as ExpiryReports } from './inventory/ExpiryReports';
export { default as InventoryCount } from './inventory/InventoryCount';
export { default as MaterialIssue } from './inventory/MaterialIssue';
export { default as MaterialReceipt } from './inventory/MaterialReceipt';
export { default as ViewMaterials } from './inventory/ViewMaterials';

// Production Pages
export { default as ProductionPage } from './production/ProductionPage';
export { default as BatchProductionRecord } from './production/BatchProductionRecord';
export { default as EquipmentCalibration } from './production/EquipmentCalibration';
export { default as EquipmentMaintenance } from './production/EquipmentMaintenance';
export { default as ProductionLineCleaning } from './production/ProductionLineCleaning';

// Quality Pages
export { default as QualityPage } from './quality/QualityPage';
export { default as COAReport } from './quality/COAReport';
export { default as CorrectiveActionReport } from './quality/CorrectiveActionReport';
export { default as FinalProductInspection } from './quality/FinalProductInspection';
export { default as NonConformanceRecord } from './quality/NonConformanceRecord';
export { default as RawMaterialsInspection } from './quality/RawMaterialsInspection';

// Safety Pages
export { default as SafetyPage } from './safety/SafetyPage';
export { default as IncidentReport } from './safety/IncidentReport';
export { default as SafetyEquipmentInspection } from './safety/SafetyEquipmentInspection';
export { default as TrainingRecord } from './safety/TrainingRecord';

// HR Pages
export { default as HRPage } from './hr/HRPage';

// Default export object for convenience
export default {
  // Auth
  LoginPage,
  LoginSetup,
  UserManagement,

  // Core
  Dashboard,

  // Sales
  SalesPage,
  CustomersPage,
  InvoicesPage,
  ProductsPage,
  QuotationPage,

  // Inventory
  InventoryPage,
  AddMaterial,
  ExpiryReports,
  InventoryCount,
  MaterialIssue,
  MaterialReceipt,
  ViewMaterials,

  // Production
  ProductionPage,
  BatchProductionRecord,
  EquipmentCalibration,
  EquipmentMaintenance,
  ProductionLineCleaning,

  // Quality
  QualityPage,
  COAReport,
  CorrectiveActionReport,
  FinalProductInspection,
  NonConformanceRecord,
  RawMaterialsInspection,

  // Safety
  SafetyPage,
  IncidentReport,
  SafetyEquipmentInspection,
  TrainingRecord,

  // HR
  HRPage
};
