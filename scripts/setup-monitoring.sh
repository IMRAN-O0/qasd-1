#!/bin/bash
# Monitoring Setup Script for QASD Application
# Configures comprehensive monitoring, logging, and alerting

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MONITORING_DIR="/opt/qasd/monitoring"
LOG_DIR="/var/log/qasd"
CONFIG_DIR="$MONITORING_DIR/config"
DATA_DIR="$MONITORING_DIR/data"

# Default values
ENVIRONMENT="production"
ENABLE_PROMETHEUS="true"
ENABLE_GRAFANA="true"
ENABLE_ELASTICSEARCH="true"
ENABLE_ALERTMANAGER="true"
SKIP_DOCKER="false"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

step() {
    echo -e "${PURPLE}[$(date '+%Y-%m-%d %H:%M:%S')] STEP:${NC} $1"
}

# Error handling
error_exit() {
    error "$1"
    exit 1
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

QASD Monitoring Setup Script

OPTIONS:
    -e, --environment ENV     Target environment (production, staging) [default: production]
    --disable-prometheus      Disable Prometheus setup
    --disable-grafana         Disable Grafana setup
    --disable-elasticsearch   Disable Elasticsearch setup
    --disable-alertmanager    Disable Alertmanager setup
    --skip-docker            Skip Docker container setup
    -h, --help               Show this help message

EXAMPLES:
    $0                                    # Setup all monitoring components
    $0 -e staging                         # Setup for staging environment
    $0 --disable-elasticsearch            # Setup without Elasticsearch
    $0 --skip-docker                      # Setup configs only, no containers

EOF
}

# Function to parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --disable-prometheus)
                ENABLE_PROMETHEUS="false"
                shift
                ;;
            --disable-grafana)
                ENABLE_GRAFANA="false"
                shift
                ;;
            --disable-elasticsearch)
                ENABLE_ELASTICSEARCH="false"
                shift
                ;;
            --disable-alertmanager)
                ENABLE_ALERTMANAGER="false"
                shift
                ;;
            --skip-docker)
                SKIP_DOCKER="true"
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Function to create directories
setup_directories() {
    step "Setting up monitoring directories"
    
    # Create main directories
    sudo mkdir -p "$MONITORING_DIR"
    sudo mkdir -p "$CONFIG_DIR"
    sudo mkdir -p "$DATA_DIR"
    sudo mkdir -p "$LOG_DIR"
    
    # Create subdirectories for each service
    if [ "$ENABLE_PROMETHEUS" = "true" ]; then
        sudo mkdir -p "$CONFIG_DIR/prometheus"
        sudo mkdir -p "$DATA_DIR/prometheus"
    fi
    
    if [ "$ENABLE_GRAFANA" = "true" ]; then
        sudo mkdir -p "$CONFIG_DIR/grafana"
        sudo mkdir -p "$DATA_DIR/grafana"
    fi
    
    if [ "$ENABLE_ELASTICSEARCH" = "true" ]; then
        sudo mkdir -p "$CONFIG_DIR/elasticsearch"
        sudo mkdir -p "$DATA_DIR/elasticsearch"
        sudo mkdir -p "$CONFIG_DIR/logstash"
        sudo mkdir -p "$CONFIG_DIR/kibana"
    fi
    
    if [ "$ENABLE_ALERTMANAGER" = "true" ]; then
        sudo mkdir -p "$CONFIG_DIR/alertmanager"
        sudo mkdir -p "$DATA_DIR/alertmanager"
    fi
    
    # Set proper permissions
    sudo chown -R "$USER:$USER" "$MONITORING_DIR"
    sudo chmod -R 755 "$MONITORING_DIR"
    
    success "Directories created successfully"
}

# Function to setup Prometheus configuration
setup_prometheus() {
    if [ "$ENABLE_PROMETHEUS" != "true" ]; then
        return 0
    fi
    
    step "Setting up Prometheus configuration"
    
    cat > "$CONFIG_DIR/prometheus/prometheus.yml" << EOF
# Prometheus configuration for QASD
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    environment: '$ENVIRONMENT'
    service: 'qasd'

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # QASD Application
  - job_name: 'qasd-app'
    static_configs:
      - targets: ['qasd-app:5000']
    metrics_path: '/metrics'
    scrape_interval: 30s
    scrape_timeout: 10s

  # Nginx metrics
  - job_name: 'nginx'
    static_configs:
      - targets: ['qasd-app:9113']
    metrics_path: '/metrics'
    scrape_interval: 30s

  # Node Exporter (system metrics)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 30s

  # Docker metrics
  - job_name: 'docker'
    static_configs:
      - targets: ['docker-exporter:9323']
    scrape_interval: 30s

  # PostgreSQL metrics (if using)
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
    scrape_interval: 30s

  # Redis metrics (if using)
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
    scrape_interval: 30s

  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF
    
    # Create alert rules
    cat > "$CONFIG_DIR/prometheus/alert_rules.yml" << EOF
# Alert rules for QASD monitoring
groups:
  - name: qasd_alerts
    rules:
      # Application availability
      - alert: QASDAppDown
        expr: up{job="qasd-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "QASD application is down"
          description: "QASD application has been down for more than 1 minute"

      # High response time
      - alert: QASDHighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="qasd-app"}[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "QASD high response time"
          description: "95th percentile response time is {{ \$value }}s"

      # High error rate
      - alert: QASDHighErrorRate
        expr: rate(http_requests_total{job="qasd-app",status=~"5.."}[5m]) / rate(http_requests_total{job="qasd-app"}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "QASD high error rate"
          description: "Error rate is {{ \$value | humanizePercentage }}"

      # High CPU usage
      - alert: QASDHighCPU
        expr: rate(process_cpu_seconds_total{job="qasd-app"}[5m]) * 100 > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "QASD high CPU usage"
          description: "CPU usage is {{ \$value }}%"

      # High memory usage
      - alert: QASDHighMemory
        expr: process_resident_memory_bytes{job="qasd-app"} / 1024 / 1024 > 512
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "QASD high memory usage"
          description: "Memory usage is {{ \$value }}MB"

      # Disk space
      - alert: QASDLowDiskSpace
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "QASD low disk space"
          description: "Disk space is {{ \$value }}% available"
EOF
    
    success "Prometheus configuration created"
}

# Function to setup Grafana configuration
setup_grafana() {
    if [ "$ENABLE_GRAFANA" != "true" ]; then
        return 0
    fi
    
    step "Setting up Grafana configuration"
    
    # Grafana configuration
    cat > "$CONFIG_DIR/grafana/grafana.ini" << EOF
[server]
http_port = 3001
root_url = http://localhost:3001/

[database]
type = sqlite3
path = /var/lib/grafana/grafana.db

[security]
admin_user = admin
admin_password = ${GRAFANA_ADMIN_PASSWORD:-admin123}
secret_key = ${GRAFANA_SECRET_KEY:-SW2YcwTIb9zpOOhoPsMm}

[users]
allow_sign_up = false
allow_org_create = false

[auth.anonymous]
enabled = false

[log]
mode = console
level = info

[metrics]
enabled = true

[alerting]
enabled = true
EOF
    
    # Datasource configuration
    mkdir -p "$CONFIG_DIR/grafana/provisioning/datasources"
    cat > "$CONFIG_DIR/grafana/provisioning/datasources/prometheus.yml" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
    
    # Dashboard configuration
    mkdir -p "$CONFIG_DIR/grafana/provisioning/dashboards"
    cat > "$CONFIG_DIR/grafana/provisioning/dashboards/qasd.yml" << EOF
apiVersion: 1

providers:
  - name: 'QASD Dashboards'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF
    
    # Create QASD dashboard
    cat > "$CONFIG_DIR/grafana/provisioning/dashboards/qasd-dashboard.json" << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "QASD Application Dashboard",
    "tags": ["qasd", "application"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Application Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"qasd-app\"}",
            "legendFormat": "Status"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"qasd-app\"}[5m]))",
            "legendFormat": "95th percentile"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      },
      {
        "id": 3,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"qasd-app\"}[5m])",
            "legendFormat": "Requests/sec"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8}
      },
      {
        "id": 4,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"qasd-app\",status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors/sec"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8}
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
EOF
    
    success "Grafana configuration created"
}

# Function to setup Elasticsearch and ELK stack
setup_elasticsearch() {
    if [ "$ENABLE_ELASTICSEARCH" != "true" ]; then
        return 0
    fi
    
    step "Setting up Elasticsearch and ELK stack configuration"
    
    # Elasticsearch configuration
    cat > "$CONFIG_DIR/elasticsearch/elasticsearch.yml" << EOF
cluster.name: qasd-logs
node.name: qasd-es-node
path.data: /usr/share/elasticsearch/data
path.logs: /usr/share/elasticsearch/logs
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node
xpack.security.enabled: false
xpack.monitoring.collection.enabled: true
EOF
    
    # Logstash configuration
    cat > "$CONFIG_DIR/logstash/logstash.yml" << EOF
http.host: "0.0.0.0"
xpack.monitoring.elasticsearch.hosts: ["http://elasticsearch:9200"]
EOF
    
    # Logstash pipeline
    cat > "$CONFIG_DIR/logstash/pipeline.conf" << EOF
input {
  beats {
    port => 5044
  }
  
  # Nginx logs
  file {
    path => "/var/log/nginx/*.log"
    start_position => "beginning"
    tags => ["nginx"]
  }
  
  # Application logs
  file {
    path => "/var/log/qasd/*.log"
    start_position => "beginning"
    tags => ["qasd-app"]
  }
}

filter {
  if "nginx" in [tags] {
    grok {
      match => { "message" => "%{NGINXACCESS}" }
    }
    
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
    
    mutate {
      convert => { "response" => "integer" }
      convert => { "bytes" => "integer" }
      convert => { "responsetime" => "float" }
    }
  }
  
  if "qasd-app" in [tags] {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "qasd-logs-%{+YYYY.MM.dd}"
  }
  
  stdout {
    codec => rubydebug
  }
}
EOF
    
    # Kibana configuration
    cat > "$CONFIG_DIR/kibana/kibana.yml" << EOF
server.name: kibana
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://elasticsearch:9200"]
xpack.monitoring.ui.container.elasticsearch.enabled: true
EOF
    
    success "ELK stack configuration created"
}

# Function to setup Alertmanager
setup_alertmanager() {
    if [ "$ENABLE_ALERTMANAGER" != "true" ]; then
        return 0
    fi
    
    step "Setting up Alertmanager configuration"
    
    cat > "$CONFIG_DIR/alertmanager/alertmanager.yml" << EOF
global:
  smtp_smarthost: '${SMTP_HOST:-localhost:587}'
  smtp_from: '${ALERT_FROM_EMAIL:-alerts@qasd.com}'
  smtp_auth_username: '${SMTP_USERNAME:-}'
  smtp_auth_password: '${SMTP_PASSWORD:-}'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: '${WEBHOOK_URL:-http://localhost:5001/alerts}'
        send_resolved: true

  - name: 'critical-alerts'
    email_configs:
      - to: '${CRITICAL_ALERT_EMAIL:-admin@qasd.com}'
        subject: '[CRITICAL] QASD Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
          {{ end }}
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL:-}'
        channel: '#alerts'
        title: 'CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'warning-alerts'
    email_configs:
      - to: '${WARNING_ALERT_EMAIL:-team@qasd.com}'
        subject: '[WARNING] QASD Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
          {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF
    
    success "Alertmanager configuration created"
}

# Function to create monitoring Docker Compose
create_monitoring_compose() {
    if [ "$SKIP_DOCKER" = "true" ]; then
        return 0
    fi
    
    step "Creating monitoring Docker Compose configuration"
    
    cat > "$MONITORING_DIR/docker-compose.monitoring.yml" << EOF
version: '3.8'

services:
EOF
    
    # Add Prometheus service
    if [ "$ENABLE_PROMETHEUS" = "true" ]; then
        cat >> "$MONITORING_DIR/docker-compose.monitoring.yml" << EOF
  prometheus:
    image: prom/prometheus:latest
    container_name: qasd-prometheus
    ports:
      - "9090:9090"
    volumes:
      - $CONFIG_DIR/prometheus:/etc/prometheus
      - $DATA_DIR/prometheus:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - monitoring

EOF
    fi
    
    # Add Grafana service
    if [ "$ENABLE_GRAFANA" = "true" ]; then
        cat >> "$MONITORING_DIR/docker-compose.monitoring.yml" << EOF
  grafana:
    image: grafana/grafana:latest
    container_name: qasd-grafana
    ports:
      - "3001:5000"
    volumes:
      - $CONFIG_DIR/grafana:/etc/grafana
      - $DATA_DIR/grafana:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin123}
    restart: unless-stopped
    networks:
      - monitoring

EOF
    fi
    
    # Add Elasticsearch services
    if [ "$ENABLE_ELASTICSEARCH" = "true" ]; then
        cat >> "$MONITORING_DIR/docker-compose.monitoring.yml" << EOF
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    container_name: qasd-elasticsearch
    ports:
      - "9200:9200"
    volumes:
      - $CONFIG_DIR/elasticsearch/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml
      - $DATA_DIR/elasticsearch:/usr/share/elasticsearch/data
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    restart: unless-stopped
    networks:
      - monitoring

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    container_name: qasd-logstash
    ports:
      - "5044:5044"
    volumes:
      - $CONFIG_DIR/logstash:/usr/share/logstash/pipeline
      - $CONFIG_DIR/logstash/logstash.yml:/usr/share/logstash/config/logstash.yml
      - $LOG_DIR:/var/log/qasd:ro
    depends_on:
      - elasticsearch
    restart: unless-stopped
    networks:
      - monitoring

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    container_name: qasd-kibana
    ports:
      - "5601:5601"
    volumes:
      - $CONFIG_DIR/kibana/kibana.yml:/usr/share/kibana/config/kibana.yml
    depends_on:
      - elasticsearch
    restart: unless-stopped
    networks:
      - monitoring

EOF
    fi
    
    # Add Alertmanager service
    if [ "$ENABLE_ALERTMANAGER" = "true" ]; then
        cat >> "$MONITORING_DIR/docker-compose.monitoring.yml" << EOF
  alertmanager:
    image: prom/alertmanager:latest
    container_name: qasd-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - $CONFIG_DIR/alertmanager:/etc/alertmanager
      - $DATA_DIR/alertmanager:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped
    networks:
      - monitoring

EOF
    fi
    
    # Add Node Exporter
    cat >> "$MONITORING_DIR/docker-compose.monitoring.yml" << EOF
  node-exporter:
    image: prom/node-exporter:latest
    container_name: qasd-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
  elasticsearch_data:
  alertmanager_data:
EOF
    
    success "Monitoring Docker Compose configuration created"
}

# Function to start monitoring services
start_monitoring_services() {
    if [ "$SKIP_DOCKER" = "true" ]; then
        log "Skipping Docker container startup"
        return 0
    fi
    
    step "Starting monitoring services"
    
    cd "$MONITORING_DIR"
    
    # Start monitoring stack
    docker-compose -f docker-compose.monitoring.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    local services_ready=true
    
    if [ "$ENABLE_PROMETHEUS" = "true" ]; then
        if ! curl -s http://localhost:9090/-/ready > /dev/null; then
            warn "Prometheus is not ready"
            services_ready=false
        else
            success "Prometheus is ready"
        fi
    fi
    
    if [ "$ENABLE_GRAFANA" = "true" ]; then
        if ! curl -s http://localhost:3001/api/health > /dev/null; then
            warn "Grafana is not ready"
            services_ready=false
        else
            success "Grafana is ready"
        fi
    fi
    
    if [ "$ENABLE_ELASTICSEARCH" = "true" ]; then
        if ! curl -s http://localhost:9200/_cluster/health > /dev/null; then
            warn "Elasticsearch is not ready"
            services_ready=false
        else
            success "Elasticsearch is ready"
        fi
    fi
    
    if [ "$services_ready" = "true" ]; then
        success "All monitoring services are ready"
    else
        warn "Some services may not be fully ready yet"
    fi
}

# Function to show monitoring URLs
show_monitoring_urls() {
    step "Monitoring services are available at:"
    
    if [ "$ENABLE_PROMETHEUS" = "true" ]; then
        log "Prometheus: http://localhost:9090"
    fi
    
    if [ "$ENABLE_GRAFANA" = "true" ]; then
        log "Grafana: http://localhost:3001 (admin/admin123)"
    fi
    
    if [ "$ENABLE_ELASTICSEARCH" = "true" ]; then
        log "Elasticsearch: http://localhost:9200"
        log "Kibana: http://localhost:5601"
    fi
    
    if [ "$ENABLE_ALERTMANAGER" = "true" ]; then
        log "Alertmanager: http://localhost:9093"
    fi
    
    log "Node Exporter: http://localhost:9100"
}

# Main function
main() {
    log "Starting QASD monitoring setup"
    
    # Parse arguments
    parse_arguments "$@"
    
    # Check prerequisites
    if [ "$SKIP_DOCKER" != "true" ]; then
        if ! command -v docker > /dev/null 2>&1; then
            error_exit "Docker is not installed"
        fi
        
        if ! command -v docker-compose > /dev/null 2>&1; then
            error_exit "Docker Compose is not installed"
        fi
    fi
    
    # Setup monitoring
    setup_directories
    setup_prometheus
    setup_grafana
    setup_elasticsearch
    setup_alertmanager
    create_monitoring_compose
    start_monitoring_services
    
    success "Monitoring setup completed successfully!"
    show_monitoring_urls
    
    log "Configuration files are located in: $CONFIG_DIR"
    log "Data files are located in: $DATA_DIR"
    log "Log files are located in: $LOG_DIR"
}

# Execute main function
main "$@"