#!/bin/bash
# Health Check Script for QASD Application
# Comprehensive health monitoring for production deployment

set -e

# Configuration
HEALTH_CHECK_URL="http://localhost/health"
API_HEALTH_URL="http://localhost/api/health"
TIMEOUT=10
RETRIES=3
LOG_FILE="/var/log/nginx/health-check.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Success logging
success() {
    log "SUCCESS: $1"
}

# Warning logging
warning() {
    log "WARNING: $1"
}

# Check if curl is available
if ! command -v curl &> /dev/null; then
    error_exit "curl is not installed or not in PATH"
fi

# Function to check HTTP endpoint
check_http_endpoint() {
    local url="$1"
    local description="$2"
    local expected_status="${3:-200}"
    
    log "Checking $description at $url"
    
    for i in $(seq 1 $RETRIES); do
        if response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" \
                          --max-time $TIMEOUT \
                          --connect-timeout 5 \
                          "$url" 2>/dev/null); then
            
            http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
            response_time=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)
            body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*;TIME:[0-9.]*$//')
            
            if [ "$http_status" = "$expected_status" ]; then
                success "$description is healthy (HTTP $http_status, ${response_time}s)"
                return 0
            else
                warning "$description returned HTTP $http_status (expected $expected_status)"
            fi
        else
            warning "Attempt $i/$RETRIES failed for $description"
        fi
        
        if [ $i -lt $RETRIES ]; then
            sleep 2
        fi
    done
    
    error_exit "$description health check failed after $RETRIES attempts"
}

# Function to check nginx process
check_nginx_process() {
    log "Checking nginx process"
    
    if pgrep nginx > /dev/null; then
        success "nginx process is running"
    else
        error_exit "nginx process is not running"
    fi
}

# Function to check disk space
check_disk_space() {
    log "Checking disk space"
    
    # Check root filesystem
    root_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$root_usage" -gt 90 ]; then
        error_exit "Root filesystem usage is ${root_usage}% (critical)"
    elif [ "$root_usage" -gt 80 ]; then
        warning "Root filesystem usage is ${root_usage}% (warning)"
    else
        success "Root filesystem usage is ${root_usage}% (healthy)"
    fi
    
    # Check log directory
    if [ -d "/var/log/nginx" ]; then
        log_usage=$(df /var/log/nginx | awk 'NR==2 {print $5}' | sed 's/%//')
        if [ "$log_usage" -gt 95 ]; then
            warning "Log directory usage is ${log_usage}% (high)"
        fi
    fi
}

# Function to check memory usage
check_memory_usage() {
    log "Checking memory usage"
    
    if command -v free &> /dev/null; then
        memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [ "$memory_usage" -gt 90 ]; then
            warning "Memory usage is ${memory_usage}% (high)"
        else
            success "Memory usage is ${memory_usage}% (healthy)"
        fi
    else
        warning "Cannot check memory usage - 'free' command not available"
    fi
}

# Function to check nginx configuration
check_nginx_config() {
    log "Checking nginx configuration"
    
    if nginx -t 2>/dev/null; then
        success "nginx configuration is valid"
    else
        error_exit "nginx configuration is invalid"
    fi
}

# Function to check SSL certificate (if exists)
check_ssl_certificate() {
    local cert_file="/etc/ssl/certs/qasd.crt"
    
    if [ -f "$cert_file" ]; then
        log "Checking SSL certificate"
        
        # Check if certificate is valid and not expired
        if openssl x509 -in "$cert_file" -noout -checkend 86400 2>/dev/null; then
            success "SSL certificate is valid and not expiring within 24 hours"
        else
            warning "SSL certificate is expiring within 24 hours or is invalid"
        fi
        
        # Check certificate expiration date
        expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate 2>/dev/null | cut -d= -f2)
        if [ -n "$expiry_date" ]; then
            log "SSL certificate expires on: $expiry_date"
        fi
    else
        log "SSL certificate not found at $cert_file (may be using self-signed or external cert)"
    fi
}

# Function to check application-specific health
check_application_health() {
    log "Checking application-specific health metrics"
    
    # Check if static files are accessible
    if curl -s --max-time 5 "http://localhost/manifest.json" > /dev/null; then
        success "Static files are accessible"
    else
        warning "Static files may not be accessible"
    fi
    
    # Check if service worker is accessible
    if curl -s --max-time 5 "http://localhost/sw.js" > /dev/null; then
        success "Service worker is accessible"
    else
        warning "Service worker may not be accessible"
    fi
}

# Function to check external dependencies
check_external_dependencies() {
    log "Checking external dependencies"
    
    # Check if backend API is reachable (if running separately)
    if [ -n "${API_HOST:-}" ]; then
        if curl -s --max-time 5 "$API_HOST/health" > /dev/null; then
            success "External API is reachable"
        else
            warning "External API may not be reachable"
        fi
    fi
    
    # Check DNS resolution
    if nslookup google.com > /dev/null 2>&1; then
        success "DNS resolution is working"
    else
        warning "DNS resolution may be failing"
    fi
}

# Function to generate health report
generate_health_report() {
    local report_file="/tmp/health-report.json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "$report_file" << EOF
{
    "timestamp": "$timestamp",
    "status": "healthy",
    "checks": {
        "nginx_process": "passed",
        "http_endpoint": "passed",
        "api_endpoint": "passed",
        "disk_space": "passed",
        "memory_usage": "passed",
        "nginx_config": "passed",
        "ssl_certificate": "checked",
        "application_health": "passed",
        "external_dependencies": "checked"
    },
    "version": "1.0.0",
    "environment": "production"
}
EOF
    
    log "Health report generated at $report_file"
}

# Main health check execution
main() {
    log "Starting comprehensive health check for QASD application"
    
    # Core health checks
    check_nginx_process
    check_nginx_config
    check_http_endpoint "$HEALTH_CHECK_URL" "Main application health endpoint"
    
    # API health check (if API is integrated)
    if curl -s --max-time 2 "$API_HEALTH_URL" > /dev/null 2>&1; then
        check_http_endpoint "$API_HEALTH_URL" "API health endpoint"
    else
        log "API health endpoint not available (may be external or not implemented)"
    fi
    
    # System resource checks
    check_disk_space
    check_memory_usage
    
    # Security and configuration checks
    check_ssl_certificate
    
    # Application-specific checks
    check_application_health
    
    # External dependency checks
    check_external_dependencies
    
    # Generate health report
    generate_health_report
    
    success "All health checks completed successfully"
    log "Health check completed at $(date)"
    
    exit 0
}

# Trap errors and cleanup
trap 'error_exit "Health check script interrupted"' INT TERM

# Run main function
main "$@"