#!/bin/bash
# Docker Entrypoint Script for QASD Application
# Handles container initialization, configuration, and startup

set -e

# Configuration
APP_DIR="/usr/share/nginx/html"
NGINX_CONF_DIR="/etc/nginx"
LOG_DIR="/var/log/nginx"
SSL_DIR="/etc/ssl/certs"
PID_FILE="/var/run/nginx.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Error handling
error_exit() {
    error "$1"
    exit 1
}

# Function to wait for dependencies
wait_for_service() {
    local host="$1"
    local port="$2"
    local service_name="$3"
    local timeout="${4:-30}"
    
    log "Waiting for $service_name at $host:$port..."
    
    local count=0
    while ! nc -z "$host" "$port" 2>/dev/null; do
        if [ $count -ge $timeout ]; then
            error_exit "Timeout waiting for $service_name at $host:$port"
        fi
        count=$((count + 1))
        sleep 1
    done
    
    success "$service_name is available at $host:$port"
}

# Function to setup directories
setup_directories() {
    log "Setting up required directories..."
    
    # Create log directory if it doesn't exist
    mkdir -p "$LOG_DIR"
    
    # Create SSL directory if it doesn't exist
    mkdir -p "$SSL_DIR"
    
    # Set proper permissions
    chmod 755 "$LOG_DIR"
    chmod 755 "$SSL_DIR"
    
    # Create nginx cache directories
    mkdir -p /var/cache/nginx/client_temp
    mkdir -p /var/cache/nginx/proxy_temp
    mkdir -p /var/cache/nginx/fastcgi_temp
    mkdir -p /var/cache/nginx/uwsgi_temp
    mkdir -p /var/cache/nginx/scgi_temp
    
    success "Directories setup completed"
}

# Function to setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    local cert_file="$SSL_DIR/qasd.crt"
    local key_file="$SSL_DIR/qasd.key"
    
    # Check if SSL certificates are provided via environment or volume
    if [ -n "${SSL_CERT:-}" ] && [ -n "${SSL_KEY:-}" ]; then
        log "Using SSL certificates from environment variables"
        echo "$SSL_CERT" > "$cert_file"
        echo "$SSL_KEY" > "$key_file"
        chmod 644 "$cert_file"
        chmod 600 "$key_file"
    elif [ -f "$cert_file" ] && [ -f "$key_file" ]; then
        log "Using existing SSL certificates"
    else
        warn "No SSL certificates found, generating self-signed certificate"
        
        # Generate self-signed certificate for development/testing
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$key_file" \
            -out "$cert_file" \
            -subj "/C=US/ST=State/L=City/O=QASD/CN=localhost" \
            2>/dev/null
        
        chmod 644 "$cert_file"
        chmod 600 "$key_file"
        
        warn "Self-signed certificate generated. Replace with proper certificate in production."
    fi
    
    success "SSL setup completed"
}

# Function to configure nginx
configure_nginx() {
    log "Configuring nginx..."
    
    # Copy custom nginx configuration if provided
    if [ -f "/app/config/nginx.prod.conf" ]; then
        log "Using custom nginx configuration"
        cp /app/config/nginx.prod.conf "$NGINX_CONF_DIR/nginx.conf"
    fi
    
    if [ -f "/app/config/nginx-default.conf" ]; then
        log "Using custom default site configuration"
        cp /app/config/nginx-default.conf "$NGINX_CONF_DIR/conf.d/default.conf"
    fi
    
    if [ -f "/app/config/security-headers.conf" ]; then
        log "Using custom security headers configuration"
        cp /app/config/security-headers.conf "$NGINX_CONF_DIR/conf.d/security-headers.conf"
    fi
    
    # Test nginx configuration
    if nginx -t 2>/dev/null; then
        success "nginx configuration is valid"
    else
        error_exit "nginx configuration is invalid"
    fi
}

# Function to setup environment-specific configuration
setup_environment() {
    log "Setting up environment configuration..."
    
    # Set default environment if not specified
    export NODE_ENV="${NODE_ENV:-production}"
    export REACT_APP_ENV="${REACT_APP_ENV:-production}"
    
    log "Environment: $NODE_ENV"
    
    # Configure based on environment
    case "$NODE_ENV" in
        "production")
            log "Configuring for production environment"
            # Production-specific configurations
            export REACT_APP_API_URL="${REACT_APP_API_URL:-https://api.qasd.com}"
            export REACT_APP_ENABLE_ANALYTICS="${REACT_APP_ENABLE_ANALYTICS:-true}"
            export REACT_APP_LOG_LEVEL="${REACT_APP_LOG_LEVEL:-error}"
            ;;
        "staging")
            log "Configuring for staging environment"
            # Staging-specific configurations
            export REACT_APP_API_URL="${REACT_APP_API_URL:-https://staging-api.qasd.com}"
            export REACT_APP_ENABLE_ANALYTICS="${REACT_APP_ENABLE_ANALYTICS:-false}"
            export REACT_APP_LOG_LEVEL="${REACT_APP_LOG_LEVEL:-warn}"
            ;;
        "development")
            log "Configuring for development environment"
            # Development-specific configurations
            export REACT_APP_API_URL="${REACT_APP_API_URL:-http://localhost:3001}"
            export REACT_APP_ENABLE_ANALYTICS="${REACT_APP_ENABLE_ANALYTICS:-false}"
            export REACT_APP_LOG_LEVEL="${REACT_APP_LOG_LEVEL:-debug}"
            ;;
        *)
            warn "Unknown environment: $NODE_ENV, using production defaults"
            ;;
    esac
    
    success "Environment configuration completed"
}

# Function to setup application configuration
setup_application() {
    log "Setting up application configuration..."
    
    # Create runtime configuration file
    local config_file="$APP_DIR/config.js"
    
    cat > "$config_file" << EOF
// Runtime configuration for QASD Application
// Generated by docker-entrypoint.sh at $(date)

window.QASD_CONFIG = {
    apiUrl: '${REACT_APP_API_URL:-/api}',
    environment: '${NODE_ENV:-production}',
    version: '${APP_VERSION:-1.0.0}',
    buildTime: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
    features: {
        analytics: ${REACT_APP_ENABLE_ANALYTICS:-true},
        monitoring: ${REACT_APP_ENABLE_MONITORING:-true},
        offlineMode: ${REACT_APP_ENABLE_OFFLINE:-true},
        darkMode: ${REACT_APP_ENABLE_DARK_MODE:-true},
        rtlSupport: ${REACT_APP_ENABLE_RTL:-true}
    },
    logging: {
        level: '${REACT_APP_LOG_LEVEL:-error}',
        enableConsole: ${REACT_APP_ENABLE_CONSOLE_LOGS:-false}
    },
    security: {
        enableCSP: ${REACT_APP_ENABLE_CSP:-true},
        enableHSTS: ${REACT_APP_ENABLE_HSTS:-true}
    }
};
EOF
    
    # Set proper permissions
    chmod 644 "$config_file"
    
    success "Application configuration created at $config_file"
}

# Function to setup health check endpoint
setup_health_check() {
    log "Setting up health check endpoint..."
    
    local health_file="$APP_DIR/health"
    
    cat > "$health_file" << EOF
{
    "status": "healthy",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "${APP_VERSION:-1.0.0}",
    "environment": "${NODE_ENV:-production}",
    "uptime": "$(uptime -p 2>/dev/null || echo 'unknown')",
    "nginx": "running"
}
EOF
    
    chmod 644 "$health_file"
    
    success "Health check endpoint created"
}

# Function to setup monitoring
setup_monitoring() {
    log "Setting up monitoring configuration..."
    
    # Create monitoring configuration if enabled
    if [ "${ENABLE_MONITORING:-true}" = "true" ]; then
        local monitoring_config="$APP_DIR/monitoring.js"
        
        cat > "$monitoring_config" << EOF
// Monitoring configuration
window.MONITORING_CONFIG = {
    enabled: true,
    endpoint: '${MONITORING_ENDPOINT:-/api/monitoring}',
    interval: ${MONITORING_INTERVAL:-30000},
    metrics: {
        performance: true,
        errors: true,
        userActions: ${MONITOR_USER_ACTIONS:-false}
    }
};
EOF
        
        chmod 644 "$monitoring_config"
        log "Monitoring configuration created"
    else
        log "Monitoring disabled"
    fi
}

# Function to wait for external dependencies
wait_for_dependencies() {
    log "Checking external dependencies..."
    
    # Wait for database if specified
    if [ -n "${DB_HOST:-}" ] && [ -n "${DB_PORT:-}" ]; then
        wait_for_service "$DB_HOST" "$DB_PORT" "Database" 60
    fi
    
    # Wait for Redis if specified
    if [ -n "${REDIS_HOST:-}" ] && [ -n "${REDIS_PORT:-}" ]; then
        wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis" 30
    fi
    
    # Wait for API server if specified
    if [ -n "${API_HOST:-}" ] && [ -n "${API_PORT:-}" ]; then
        wait_for_service "$API_HOST" "$API_PORT" "API Server" 60
    fi
    
    success "All dependencies are available"
}

# Function to perform pre-flight checks
preflight_checks() {
    log "Performing pre-flight checks..."
    
    # Check if application files exist
    if [ ! -f "$APP_DIR/index.html" ]; then
        error_exit "Application files not found in $APP_DIR"
    fi
    
    # Check nginx binary
    if ! command -v nginx &> /dev/null; then
        error_exit "nginx binary not found"
    fi
    
    # Check required tools
    for tool in curl openssl nc; do
        if ! command -v "$tool" &> /dev/null; then
            warn "$tool not found - some features may not work"
        fi
    done
    
    success "Pre-flight checks completed"
}

# Function to start nginx
start_nginx() {
    log "Starting nginx..."
    
    # Remove any existing PID file
    rm -f "$PID_FILE"
    
    # Start nginx in foreground mode
    exec nginx -g "daemon off;"
}

# Function to handle shutdown
shutdown() {
    log "Received shutdown signal, stopping nginx gracefully..."
    
    if [ -f "$PID_FILE" ]; then
        local nginx_pid=$(cat "$PID_FILE")
        if kill -0 "$nginx_pid" 2>/dev/null; then
            log "Sending QUIT signal to nginx (PID: $nginx_pid)"
            kill -QUIT "$nginx_pid"
            
            # Wait for graceful shutdown
            local count=0
            while kill -0 "$nginx_pid" 2>/dev/null && [ $count -lt 30 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            if kill -0 "$nginx_pid" 2>/dev/null; then
                warn "Nginx did not stop gracefully, forcing shutdown"
                kill -TERM "$nginx_pid"
            fi
        fi
    fi
    
    success "Shutdown completed"
    exit 0
}

# Function to display startup banner
show_banner() {
    cat << 'EOF'

 ██████╗  █████╗ ███████╗██████╗ 
██╔═══██╗██╔══██╗██╔════╝██╔══██╗
██║   ██║███████║███████╗██║  ██║
██║▄▄ ██║██╔══██║╚════██║██║  ██║
╚██████╔╝██║  ██║███████║██████╔╝
 ╚══▀▀═╝ ╚═╝  ╚═╝╚══════╝╚═════╝ 

Quality Assurance System Dashboard
Production Container Starting...

EOF
    
    log "QASD Application Container v${APP_VERSION:-1.0.0}"
    log "Environment: ${NODE_ENV:-production}"
    log "Build Time: $(date)"
    echo
}

# Main execution function
main() {
    # Show startup banner
    show_banner
    
    # Setup signal handlers
    trap shutdown SIGTERM SIGINT SIGQUIT
    
    # Perform initialization steps
    preflight_checks
    setup_directories
    setup_ssl
    setup_environment
    configure_nginx
    setup_application
    setup_health_check
    setup_monitoring
    
    # Wait for dependencies if needed
    if [ "${WAIT_FOR_DEPENDENCIES:-false}" = "true" ]; then
        wait_for_dependencies
    fi
    
    success "Container initialization completed successfully"
    log "Starting QASD application..."
    
    # Start the main application
    start_nginx
}

# Execute main function with all arguments
main "$@"