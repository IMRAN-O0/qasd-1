// Analytics Service - Advanced data processing and business intelligence
class AnalyticsService {
  constructor() {
    this.dataCache = new Map();
    this.metrics = new Map();
    this.dashboards = new Map();
    this.reports = new Map();
    this.alerts = new Map();

    this.config = {
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      batchSize: 1000,
      maxDataPoints: 10000,
      refreshInterval: 30000, // 30 seconds
      retentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days
      aggregationLevels: ['minute', 'hour', 'day', 'week', 'month', 'year']
    };

    this.dataSources = {
      production: {
        endpoint: '/api/analytics/production',
        fields: ['output', 'efficiency', 'downtime', 'quality_rate', 'oee'],
        aggregations: ['sum', 'avg', 'min', 'max', 'count']
      },
      quality: {
        endpoint: '/api/analytics/quality',
        fields: ['defect_rate', 'first_pass_yield', 'customer_complaints', 'rework_rate'],
        aggregations: ['avg', 'min', 'max', 'trend']
      },
      inventory: {
        endpoint: '/api/analytics/inventory',
        fields: ['stock_levels', 'turnover_rate', 'carrying_cost', 'stockouts'],
        aggregations: ['sum', 'avg', 'current', 'variance']
      },
      sales: {
        endpoint: '/api/analytics/sales',
        fields: ['revenue', 'orders', 'customers', 'conversion_rate'],
        aggregations: ['sum', 'count', 'avg', 'growth']
      },
      maintenance: {
        endpoint: '/api/analytics/maintenance',
        fields: ['mtbf', 'mttr', 'planned_maintenance', 'unplanned_downtime'],
        aggregations: ['avg', 'sum', 'count', 'trend']
      },
      safety: {
        endpoint: '/api/analytics/safety',
        fields: ['incidents', 'near_misses', 'training_completion', 'safety_score'],
        aggregations: ['count', 'sum', 'avg', 'rate']
      },
      financial: {
        endpoint: '/api/analytics/financial',
        fields: ['costs', 'profit_margin', 'roi', 'budget_variance'],
        aggregations: ['sum', 'avg', 'variance', 'percentage']
      }
    };

    this.kpis = {
      production: {
        oee: { target: 85, unit: '%', trend: 'higher_better' },
        efficiency: { target: 90, unit: '%', trend: 'higher_better' },
        downtime: { target: 5, unit: '%', trend: 'lower_better' },
        throughput: { target: 1000, unit: 'units/hour', trend: 'higher_better' }
      },
      quality: {
        defect_rate: { target: 2, unit: '%', trend: 'lower_better' },
        first_pass_yield: { target: 95, unit: '%', trend: 'higher_better' },
        customer_satisfaction: { target: 4.5, unit: '/5', trend: 'higher_better' },
        rework_cost: { target: 50000, unit: 'SAR', trend: 'lower_better' }
      },
      financial: {
        profit_margin: { target: 15, unit: '%', trend: 'higher_better' },
        cost_per_unit: { target: 25, unit: 'SAR', trend: 'lower_better' },
        roi: { target: 20, unit: '%', trend: 'higher_better' },
        revenue_growth: { target: 10, unit: '%', trend: 'higher_better' }
      },
      safety: {
        incident_rate: { target: 0.5, unit: 'per 100k hours', trend: 'lower_better' },
        training_completion: { target: 95, unit: '%', trend: 'higher_better' },
        safety_score: { target: 90, unit: '%', trend: 'higher_better' }
      }
    };

    this.initializeService();
  }

  // Initialize analytics service
  async initializeService() {
    try {
      // Load cached data
      await this.loadCachedData();

      // Setup real-time data collection
      this.setupRealTimeCollection();

      // Setup automated reports
      this.setupAutomatedReports();

      // Setup alert monitoring
      this.setupAlertMonitoring();

      // Setup data cleanup
      this.setupDataCleanup();

      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  // Setup real-time data collection
  setupRealTimeCollection() {
    // Collect data at regular intervals
    setInterval(async () => {
      try {
        await this.collectRealTimeData();
      } catch (error) {
        console.error('Real-time data collection failed:', error);
      }
    }, this.config.refreshInterval);

    // Setup WebSocket for real-time updates
    this.setupWebSocketConnection();
  }

  // Setup WebSocket connection
  setupWebSocketConnection() {
    try {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}/ws/analytics`;

      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('Analytics WebSocket connected');
      };

      this.websocket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.handleRealTimeUpdate(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Analytics WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.setupWebSocketConnection();
        }, 5000);
      };

      this.websocket.onerror = error => {
        console.error('Analytics WebSocket error:', error);
      };
    } catch (error) {
      console.warn('WebSocket not available for analytics');
    }
  }

  // Handle real-time update
  handleRealTimeUpdate(data) {
    const { source, metrics, timestamp } = data;

    // Update cached data
    this.updateCachedData(source, metrics, timestamp);

    // Check for alerts
    this.checkAlerts(source, metrics);

    // Emit update event
    window.dispatchEvent(
      new CustomEvent('analytics-update', {
        detail: { source, metrics, timestamp }
      })
    );
  }

  // Collect real-time data
  async collectRealTimeData() {
    const promises = Object.keys(this.dataSources).map(source => this.collectDataFromSource(source));

    await Promise.allSettled(promises);
  }

  // Collect data from specific source
  async collectDataFromSource(source) {
    try {
      const config = this.dataSources[source];
      if (!config) {
        throw new Error(`Unknown data source: ${source}`);
      }

      const response = await fetch(config.endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${source} data: ${response.statusText}`);
      }

      const data = await response.json();

      // Process and cache data
      this.processAndCacheData(source, data);

      return data;
    } catch (error) {
      console.error(`Failed to collect data from ${source}:`, error);

      // Use mock data for development
      const mockData = this.generateMockData(source);
      this.processAndCacheData(source, mockData);

      return mockData;
    }
  }

  // Process and cache data
  processAndCacheData(source, rawData) {
    const timestamp = Date.now();

    // Get existing cache
    const cacheKey = `${source}_data`;
    const cachedData = this.dataCache.get(cacheKey) || {
      data: [],
      lastUpdate: 0,
      aggregations: {}
    };

    // Add new data points
    const dataPoints = Array.isArray(rawData) ? rawData : [rawData];

    dataPoints.forEach(point => {
      cachedData.data.push({
        ...point,
        timestamp,
        source
      });
    });

    // Limit data points
    if (cachedData.data.length > this.config.maxDataPoints) {
      cachedData.data = cachedData.data.slice(-this.config.maxDataPoints);
    }

    // Update timestamp
    cachedData.lastUpdate = timestamp;

    // Calculate aggregations
    cachedData.aggregations = this.calculateAggregations(source, cachedData.data);

    // Update cache
    this.dataCache.set(cacheKey, cachedData);

    // Save to persistent storage
    this.saveCachedData(cacheKey, cachedData);
  }

  // Calculate aggregations
  calculateAggregations(source, data) {
    const config = this.dataSources[source];
    const aggregations = {};

    config.fields.forEach(field => {
      aggregations[field] = {};

      config.aggregations.forEach(aggType => {
        aggregations[field][aggType] = this.calculateAggregation(data, field, aggType);
      });
    });

    return aggregations;
  }

  // Calculate specific aggregation
  calculateAggregation(data, field, type) {
    const values = data.map(d => d[field]).filter(v => v !== undefined && v !== null);

    if (values.length === 0) {
      return null;
    }

    switch (type) {
      case 'sum':
        return values.reduce((sum, val) => sum + Number(val), 0);

      case 'avg':
        return values.reduce((sum, val) => sum + Number(val), 0) / values.length;

      case 'min':
        return Math.min(...values.map(Number));

      case 'max':
        return Math.max(...values.map(Number));

      case 'count':
        return values.length;

      case 'current':
        return values[values.length - 1];

      case 'variance':
        const avg = values.reduce((sum, val) => sum + Number(val), 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(Number(val) - avg, 2), 0) / values.length;

      case 'trend':
        return this.calculateTrend(values);

      case 'growth':
        return this.calculateGrowth(values);

      case 'rate':
        return this.calculateRate(values);

      case 'percentage':
        return this.calculatePercentage(values);

      default:
        return null;
    }
  }

  // Calculate trend
  calculateTrend(values) {
    if (values.length < 2) {
      return 0;
    }

    const numValues = values.map(Number);
    const n = numValues.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = numValues.reduce((sum, val) => sum + val, 0);
    const sumXY = numValues.reduce((sum, val, index) => sum + val * index, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return slope;
  }

  // Calculate growth rate
  calculateGrowth(values) {
    if (values.length < 2) {
      return 0;
    }

    const first = Number(values[0]);
    const last = Number(values[values.length - 1]);

    if (first === 0) {
      return 0;
    }

    return ((last - first) / first) * 100;
  }

  // Calculate rate
  calculateRate(values) {
    if (values.length === 0) {
      return 0;
    }

    const total = values.reduce((sum, val) => sum + Number(val), 0);
    const timeSpan = values.length; // Assuming each value represents a time unit

    return total / timeSpan;
  }

  // Calculate percentage
  calculatePercentage(values) {
    if (values.length < 2) {
      return 0;
    }

    const numerator = Number(values[0]);
    const denominator = Number(values[1]);

    if (denominator === 0) {
      return 0;
    }

    return (numerator / denominator) * 100;
  }

  // Generate mock data for development
  generateMockData(source) {
    const config = this.dataSources[source];
    const mockData = {};

    config.fields.forEach(field => {
      switch (field) {
        case 'output':
          mockData[field] = Math.floor(Math.random() * 1000) + 500;
          break;
        case 'efficiency':
        case 'quality_rate':
        case 'first_pass_yield':
        case 'training_completion':
        case 'safety_score':
          mockData[field] = Math.random() * 20 + 80; // 80-100%
          break;
        case 'defect_rate':
        case 'downtime':
        case 'incident_rate':
          mockData[field] = Math.random() * 5; // 0-5%
          break;
        case 'oee':
          mockData[field] = Math.random() * 15 + 75; // 75-90%
          break;
        case 'revenue':
          mockData[field] = Math.floor(Math.random() * 100000) + 50000;
          break;
        case 'orders':
        case 'customers':
          mockData[field] = Math.floor(Math.random() * 100) + 10;
          break;
        case 'stock_levels':
          mockData[field] = Math.floor(Math.random() * 1000) + 100;
          break;
        case 'turnover_rate':
          mockData[field] = Math.random() * 10 + 5;
          break;
        case 'mtbf':
          mockData[field] = Math.random() * 1000 + 500;
          break;
        case 'mttr':
          mockData[field] = Math.random() * 24 + 2;
          break;
        case 'costs':
          mockData[field] = Math.floor(Math.random() * 50000) + 10000;
          break;
        case 'profit_margin':
          mockData[field] = Math.random() * 20 + 10;
          break;
        case 'roi':
          mockData[field] = Math.random() * 25 + 15;
          break;
        default:
          mockData[field] = Math.random() * 100;
      }
    });

    return mockData;
  }

  // Get analytics data
  async getAnalyticsData(source, options = {}) {
    const { timeRange = '24h', aggregation = 'hour', fields = null, filters = {}, refresh = false } = options;

    const cacheKey = `${source}_${timeRange}_${aggregation}`;

    // Check cache first
    if (!refresh) {
      const cached = this.dataCache.get(cacheKey);
      if (cached && Date.now() - cached.lastUpdate < this.config.cacheTimeout) {
        return this.filterData(cached.data, fields, filters);
      }
    }

    // Fetch fresh data
    try {
      const data = await this.fetchAnalyticsData(source, timeRange, aggregation);

      // Cache the data
      this.dataCache.set(cacheKey, {
        data,
        lastUpdate: Date.now()
      });

      return this.filterData(data, fields, filters);
    } catch (error) {
      console.error(`Failed to get analytics data for ${source}:`, error);

      // Return cached data if available
      const cached = this.dataCache.get(cacheKey);
      if (cached) {
        return this.filterData(cached.data, fields, filters);
      }

      throw error;
    }
  }

  // Fetch analytics data from API
  async fetchAnalyticsData(source, timeRange, aggregation) {
    const config = this.dataSources[source];
    if (!config) {
      throw new Error(`Unknown data source: ${source}`);
    }

    const params = new URLSearchParams({
      timeRange,
      aggregation,
      limit: this.config.batchSize.toString()
    });

    const response = await fetch(`${config.endpoint}?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
    }

    return response.json();
  }

  // Filter data based on fields and filters
  filterData(data, fields, filters) {
    let filteredData = [...data];

    // Apply filters
    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];

      if (filterValue !== undefined && filterValue !== null) {
        filteredData = filteredData.filter(item => {
          if (typeof filterValue === 'object' && filterValue.min !== undefined) {
            return item[key] >= filterValue.min && item[key] <= filterValue.max;
          } else {
            return item[key] === filterValue;
          }
        });
      }
    });

    // Select specific fields
    if (fields && Array.isArray(fields)) {
      filteredData = filteredData.map(item => {
        const filtered = {};
        fields.forEach(field => {
          if (item[field] !== undefined) {
            filtered[field] = item[field];
          }
        });
        filtered.timestamp = item.timestamp;
        return filtered;
      });
    }

    return filteredData;
  }

  // Get KPI data
  async getKPIData(category = null) {
    const kpiData = {};

    const categories = category ? [category] : Object.keys(this.kpis);

    for (const cat of categories) {
      kpiData[cat] = {};

      for (const [kpiName, kpiConfig] of Object.entries(this.kpis[cat])) {
        try {
          const currentValue = await this.getCurrentKPIValue(cat, kpiName);
          const previousValue = await this.getPreviousKPIValue(cat, kpiName);

          kpiData[cat][kpiName] = {
            current: currentValue,
            previous: previousValue,
            target: kpiConfig.target,
            unit: kpiConfig.unit,
            trend: this.calculateKPITrend(currentValue, previousValue, kpiConfig.trend),
            status: this.getKPIStatus(currentValue, kpiConfig.target, kpiConfig.trend),
            variance: this.calculateKPIVariance(currentValue, kpiConfig.target)
          };
        } catch (error) {
          console.error(`Failed to get KPI data for ${cat}.${kpiName}:`, error);

          // Use mock data
          const mockValue = this.generateMockKPIValue(kpiName, kpiConfig);
          kpiData[cat][kpiName] = {
            current: mockValue,
            previous: mockValue * 0.95,
            target: kpiConfig.target,
            unit: kpiConfig.unit,
            trend: 'up',
            status: 'good',
            variance: 5
          };
        }
      }
    }

    return kpiData;
  }

  // Get current KPI value
  async getCurrentKPIValue(category, kpiName) {
    // This would fetch the current value from your data source
    // For now, return a mock value
    const kpiConfig = this.kpis[category][kpiName];
    return this.generateMockKPIValue(kpiName, kpiConfig);
  }

  // Get previous KPI value
  async getPreviousKPIValue(category, kpiName) {
    // This would fetch the previous period value
    // For now, return a mock value
    const current = await this.getCurrentKPIValue(category, kpiName);
    return current * (0.9 + Math.random() * 0.2); // ±10% variation
  }

  // Generate mock KPI value
  generateMockKPIValue(kpiName, config) {
    const target = config.target;
    const variance = target * 0.1; // 10% variance

    return target + (Math.random() - 0.5) * variance;
  }

  // Calculate KPI trend
  calculateKPITrend(current, previous, trendType) {
    if (current === previous) {
      return 'stable';
    }

    const isIncreasing = current > previous;

    if (trendType === 'higher_better') {
      return isIncreasing ? 'up' : 'down';
    } else {
      return isIncreasing ? 'down' : 'up';
    }
  }

  // Get KPI status
  getKPIStatus(current, target, trendType) {
    const variance = Math.abs((current - target) / target) * 100;

    if (variance <= 5) {
      return 'excellent';
    } else if (variance <= 10) {
      return 'good';
    } else if (variance <= 20) {
      return 'warning';
    } else {
      return 'critical';
    }
  }

  // Calculate KPI variance
  calculateKPIVariance(current, target) {
    return ((current - target) / target) * 100;
  }

  // Create custom dashboard
  createDashboard(dashboardConfig) {
    const dashboard = {
      id: this.generateId('dashboard'),
      ...dashboardConfig,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.dashboards.set(dashboard.id, dashboard);
    this.saveDashboard(dashboard);

    return dashboard;
  }

  // Update dashboard
  updateDashboard(dashboardId, updates) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    const updatedDashboard = {
      ...dashboard,
      ...updates,
      updatedAt: Date.now()
    };

    this.dashboards.set(dashboardId, updatedDashboard);
    this.saveDashboard(updatedDashboard);

    return updatedDashboard;
  }

  // Get dashboard
  getDashboard(dashboardId) {
    return this.dashboards.get(dashboardId);
  }

  // Get all dashboards
  getDashboards() {
    return Array.from(this.dashboards.values());
  }

  // Delete dashboard
  deleteDashboard(dashboardId) {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      this.dashboards.delete(dashboardId);
      this.removeDashboardFromStorage(dashboardId);
    }
    return dashboard;
  }

  // Create custom report
  createReport(reportConfig) {
    const report = {
      id: this.generateId('report'),
      ...reportConfig,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastRun: null,
      status: 'created'
    };

    this.reports.set(report.id, report);
    this.saveReport(report);

    return report;
  }

  // Run report
  async runReport(reportId) {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    try {
      report.status = 'running';
      report.lastRun = Date.now();

      // Generate report data
      const reportData = await this.generateReportData(report);

      report.status = 'completed';
      report.lastResult = reportData;

      this.reports.set(reportId, report);
      this.saveReport(report);

      return reportData;
    } catch (error) {
      report.status = 'failed';
      report.lastError = error.message;

      this.reports.set(reportId, report);
      this.saveReport(report);

      throw error;
    }
  }

  // Generate report data
  async generateReportData(report) {
    const { dataSources, timeRange, aggregation, filters, groupBy, calculations } = report;

    const reportData = {
      metadata: {
        reportId: report.id,
        generatedAt: Date.now(),
        timeRange,
        aggregation
      },
      data: {},
      summary: {},
      charts: []
    };

    // Collect data from all sources
    for (const source of dataSources) {
      try {
        const data = await this.getAnalyticsData(source, {
          timeRange,
          aggregation,
          filters: filters[source] || {},
          refresh: true
        });

        reportData.data[source] = data;

        // Calculate summary statistics
        reportData.summary[source] = this.calculateSummaryStats(data);
      } catch (error) {
        console.error(`Failed to get data for ${source} in report:`, error);
        reportData.data[source] = [];
        reportData.summary[source] = {};
      }
    }

    // Apply grouping
    if (groupBy) {
      reportData.grouped = this.groupReportData(reportData.data, groupBy);
    }

    // Apply calculations
    if (calculations) {
      reportData.calculated = this.applyCalculations(reportData.data, calculations);
    }

    // Generate chart configurations
    reportData.charts = this.generateChartConfigs(report, reportData.data);

    return reportData;
  }

  // Calculate summary statistics
  calculateSummaryStats(data) {
    if (!data || data.length === 0) {
      return {};
    }

    const stats = {
      count: data.length,
      fields: {}
    };

    // Get numeric fields
    const numericFields = Object.keys(data[0]).filter(key => key !== 'timestamp' && typeof data[0][key] === 'number');

    numericFields.forEach(field => {
      const values = data.map(d => d[field]).filter(v => v !== null && v !== undefined);

      if (values.length > 0) {
        stats.fields[field] = {
          sum: values.reduce((sum, val) => sum + val, 0),
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });

    return stats;
  }

  // Group report data
  groupReportData(data, groupBy) {
    const grouped = {};

    Object.keys(data).forEach(source => {
      grouped[source] = {};

      data[source].forEach(item => {
        const groupKey = item[groupBy] || 'unknown';

        if (!grouped[source][groupKey]) {
          grouped[source][groupKey] = [];
        }

        grouped[source][groupKey].push(item);
      });
    });

    return grouped;
  }

  // Apply calculations
  applyCalculations(data, calculations) {
    const calculated = {};

    calculations.forEach(calc => {
      const { name, formula, sources } = calc;

      try {
        calculated[name] = this.evaluateFormula(formula, data, sources);
      } catch (error) {
        console.error(`Failed to calculate ${name}:`, error);
        calculated[name] = null;
      }
    });

    return calculated;
  }

  // Evaluate formula
  evaluateFormula(formula, data, sources) {
    // Simple formula evaluation
    // In a real implementation, you'd use a proper expression parser

    let result = formula;

    // Replace source references with actual values
    sources.forEach(source => {
      const sourceData = data[source] || [];
      const sum = sourceData.reduce((total, item) => {
        return (
          total +
          Object.values(item).reduce((sum, val) => {
            return sum + (typeof val === 'number' ? val : 0);
          }, 0)
        );
      }, 0);

      result = result.replace(new RegExp(`\\b${source}\\b`, 'g'), sum);
    });

    // Evaluate the expression (be careful with eval in production)
    try {
      return Function(`"use strict"; return (${result})`)();
    } catch (error) {
      throw new Error(`Invalid formula: ${formula}`);
    }
  }

  // Generate chart configurations
  generateChartConfigs(report, data) {
    const charts = [];

    // Generate charts based on report configuration
    if (report.charts) {
      report.charts.forEach(chartConfig => {
        const chart = {
          ...chartConfig,
          data: this.prepareChartData(data, chartConfig)
        };

        charts.push(chart);
      });
    }

    return charts;
  }

  // Prepare chart data
  prepareChartData(data, chartConfig) {
    const { type, source, xField, yField, groupField } = chartConfig;
    const sourceData = data[source] || [];

    switch (type) {
      case 'line':
      case 'bar':
        return sourceData.map(item => ({
          x: item[xField],
          y: item[yField],
          group: groupField ? item[groupField] : null
        }));

      case 'pie':
        const grouped = {};
        sourceData.forEach(item => {
          const key = item[groupField] || 'Other';
          grouped[key] = (grouped[key] || 0) + (item[yField] || 0);
        });

        return Object.keys(grouped).map(key => ({
          name: key,
          value: grouped[key]
        }));

      case 'scatter':
        return sourceData.map(item => ({
          x: item[xField],
          y: item[yField],
          size: item[chartConfig.sizeField] || 5
        }));

      default:
        return sourceData;
    }
  }

  // Setup automated reports
  setupAutomatedReports() {
    // Check for scheduled reports every hour
    setInterval(
      () => {
        this.runScheduledReports();
      },
      60 * 60 * 1000
    ); // 1 hour
  }

  // Run scheduled reports
  async runScheduledReports() {
    const now = Date.now();

    for (const [reportId, report] of this.reports) {
      if (report.schedule && this.shouldRunReport(report, now)) {
        try {
          await this.runReport(reportId);

          // Send report if configured
          if (report.distribution) {
            await this.distributeReport(report);
          }
        } catch (error) {
          console.error(`Failed to run scheduled report ${reportId}:`, error);
        }
      }
    }
  }

  // Check if report should run
  shouldRunReport(report, now) {
    if (!report.schedule || !report.schedule.enabled) {
      return false;
    }

    const { frequency, lastRun } = report.schedule;
    const timeSinceLastRun = now - (report.lastRun || 0);

    switch (frequency) {
      case 'hourly':
        return timeSinceLastRun >= 60 * 60 * 1000;
      case 'daily':
        return timeSinceLastRun >= 24 * 60 * 60 * 1000;
      case 'weekly':
        return timeSinceLastRun >= 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return timeSinceLastRun >= 30 * 24 * 60 * 60 * 1000;
      default:
        return false;
    }
  }

  // Distribute report
  async distributeReport(report) {
    const { distribution } = report;

    if (distribution.email) {
      await this.emailReport(report, distribution.email);
    }

    if (distribution.webhook) {
      await this.webhookReport(report, distribution.webhook);
    }
  }

  // Email report
  async emailReport(report, emailConfig) {
    try {
      const response = await fetch('/api/reports/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reportId: report.id,
          recipients: emailConfig.recipients,
          subject: emailConfig.subject || `Report: ${report.name}`,
          format: emailConfig.format || 'pdf'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to email report: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to email report:', error);
      throw error;
    }
  }

  // Webhook report
  async webhookReport(report, webhookConfig) {
    try {
      const response = await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhookConfig.headers
        },
        body: JSON.stringify({
          report: report.lastResult,
          metadata: {
            reportId: report.id,
            reportName: report.name,
            generatedAt: Date.now()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send report webhook:', error);
      throw error;
    }
  }

  // Setup alert monitoring
  setupAlertMonitoring() {
    // Check alerts every 5 minutes
    setInterval(
      () => {
        this.checkAllAlerts();
      },
      5 * 60 * 1000
    ); // 5 minutes
  }

  // Check all alerts
  async checkAllAlerts() {
    for (const [alertId, alert] of this.alerts) {
      if (alert.enabled) {
        try {
          await this.checkAlert(alert);
        } catch (error) {
          console.error(`Failed to check alert ${alertId}:`, error);
        }
      }
    }
  }

  // Check specific alert
  async checkAlert(alert) {
    const { condition, source, field, operator, threshold } = alert;

    // Get current value
    const data = await this.getAnalyticsData(source, { timeRange: '1h' });
    if (!data || data.length === 0) {
      return;
    }

    const currentValue = data[data.length - 1][field];

    // Check condition
    let triggered = false;

    switch (operator) {
      case 'gt':
        triggered = currentValue > threshold;
        break;
      case 'lt':
        triggered = currentValue < threshold;
        break;
      case 'eq':
        triggered = currentValue === threshold;
        break;
      case 'gte':
        triggered = currentValue >= threshold;
        break;
      case 'lte':
        triggered = currentValue <= threshold;
        break;
    }

    if (triggered && !alert.lastTriggered) {
      await this.triggerAlert(alert, currentValue);
    } else if (!triggered && alert.lastTriggered) {
      await this.resolveAlert(alert, currentValue);
    }
  }

  // Trigger alert
  async triggerAlert(alert, value) {
    alert.lastTriggered = Date.now();
    alert.triggerCount = (alert.triggerCount || 0) + 1;

    // Send notification
    if (window.notificationService) {
      await window.notificationService.sendFromTemplate('system_alert', {
        message: `Alert: ${alert.name}`,
        severity: alert.severity || 'warning',
        source: alert.source,
        value,
        threshold: alert.threshold
      });
    }

    // Log alert
    console.warn(`Alert triggered: ${alert.name}`, { value, threshold: alert.threshold });
  }

  // Resolve alert
  async resolveAlert(alert, value) {
    alert.lastTriggered = null;

    // Send resolution notification
    if (window.notificationService) {
      await window.notificationService.sendNotification({
        title: 'Alert Resolved',
        body: `Alert "${alert.name}" has been resolved`,
        category: 'system',
        priority: 'normal',
        channels: ['inApp']
      });
    }

    console.log(`Alert resolved: ${alert.name}`, { value, threshold: alert.threshold });
  }

  // Create alert
  createAlert(alertConfig) {
    const alert = {
      id: this.generateId('alert'),
      ...alertConfig,
      enabled: true,
      createdAt: Date.now(),
      lastTriggered: null,
      triggerCount: 0
    };

    this.alerts.set(alert.id, alert);
    this.saveAlert(alert);

    return alert;
  }

  // Update cached data
  updateCachedData(source, metrics, timestamp) {
    const cacheKey = `${source}_data`;
    const cachedData = this.dataCache.get(cacheKey) || {
      data: [],
      lastUpdate: 0,
      aggregations: {}
    };

    // Add new data point
    cachedData.data.push({
      ...metrics,
      timestamp,
      source
    });

    // Limit data points
    if (cachedData.data.length > this.config.maxDataPoints) {
      cachedData.data = cachedData.data.slice(-this.config.maxDataPoints);
    }

    cachedData.lastUpdate = timestamp;

    // Update cache
    this.dataCache.set(cacheKey, cachedData);
  }

  // Check alerts for real-time data
  checkAlerts(source, metrics) {
    for (const [alertId, alert] of this.alerts) {
      if (alert.enabled && alert.source === source) {
        const value = metrics[alert.field];
        if (value !== undefined) {
          this.checkAlertCondition(alert, value);
        }
      }
    }
  }

  // Check alert condition
  checkAlertCondition(alert, value) {
    let triggered = false;

    switch (alert.operator) {
      case 'gt':
        triggered = value > alert.threshold;
        break;
      case 'lt':
        triggered = value < alert.threshold;
        break;
      case 'eq':
        triggered = value === alert.threshold;
        break;
      case 'gte':
        triggered = value >= alert.threshold;
        break;
      case 'lte':
        triggered = value <= alert.threshold;
        break;
    }

    if (triggered && !alert.lastTriggered) {
      this.triggerAlert(alert, value);
    } else if (!triggered && alert.lastTriggered) {
      this.resolveAlert(alert, value);
    }
  }

  // Setup data cleanup
  setupDataCleanup() {
    // Clean up old data daily
    setInterval(
      () => {
        this.cleanupOldData();
      },
      24 * 60 * 60 * 1000
    ); // 24 hours
  }

  // Clean up old data
  cleanupOldData() {
    const cutoff = Date.now() - this.config.retentionPeriod;

    // Clean cache
    for (const [key, data] of this.dataCache) {
      if (data.data) {
        data.data = data.data.filter(item => item.timestamp >= cutoff);

        if (data.data.length === 0) {
          this.dataCache.delete(key);
        }
      }
    }

    // Clean persistent storage
    this.cleanupPersistentData();
  }

  // Load cached data
  async loadCachedData() {
    try {
      const stored = localStorage.getItem('qasd_analytics_cache');
      if (stored) {
        const cache = JSON.parse(stored);

        Object.keys(cache).forEach(key => {
          this.dataCache.set(key, cache[key]);
        });
      }
    } catch (error) {
      console.error('Failed to load cached analytics data:', error);
    }
  }

  // Save cached data
  saveCachedData(key, data) {
    try {
      const stored = JSON.parse(localStorage.getItem('qasd_analytics_cache') || '{}');
      stored[key] = data;
      localStorage.setItem('qasd_analytics_cache', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to save cached analytics data:', error);
    }
  }

  // Save dashboard
  saveDashboard(dashboard) {
    try {
      const stored = JSON.parse(localStorage.getItem('qasd_dashboards') || '{}');
      stored[dashboard.id] = dashboard;
      localStorage.setItem('qasd_dashboards', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  }

  // Save report
  saveReport(report) {
    try {
      const stored = JSON.parse(localStorage.getItem('qasd_reports') || '{}');
      stored[report.id] = report;
      localStorage.setItem('qasd_reports', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }

  // Save alert
  saveAlert(alert) {
    try {
      const stored = JSON.parse(localStorage.getItem('qasd_alerts') || '{}');
      stored[alert.id] = alert;
      localStorage.setItem('qasd_alerts', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to save alert:', error);
    }
  }

  // Remove dashboard from storage
  removeDashboardFromStorage(dashboardId) {
    try {
      const stored = JSON.parse(localStorage.getItem('qasd_dashboards') || '{}');
      delete stored[dashboardId];
      localStorage.setItem('qasd_dashboards', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to remove dashboard from storage:', error);
    }
  }

  // Cleanup persistent data
  cleanupPersistentData() {
    try {
      // This would clean up old data from persistent storage
      // For now, just log the action
      console.log('Cleaning up old analytics data');
    } catch (error) {
      console.error('Failed to cleanup persistent data:', error);
    }
  }

  // Generate ID
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get service status
  getServiceStatus() {
    return {
      initialized: true,
      dataSources: Object.keys(this.dataSources),
      cachedDataSources: Array.from(this.dataCache.keys()),
      dashboards: this.dashboards.size,
      reports: this.reports.size,
      alerts: this.alerts.size,
      websocketConnected: this.websocket?.readyState === WebSocket.OPEN,
      lastUpdate: Math.max(...Array.from(this.dataCache.values()).map(d => d.lastUpdate || 0))
    };
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Make it globally available
window.analyticsService = analyticsService;

export default analyticsService;
