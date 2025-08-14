#!/bin/bash
# Production Deployment Script for QASD Application
# Automates the complete deployment process with safety checks

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
DOCKERFILE="$PROJECT_DIR/Dockerfile.prod"
BACKUP_DIR="/opt/qasd/backups"
LOG_FILE="/var/log/qasd-deploy.log"

# Default values
ENVIRONMENT="production"
SKIP_TESTS="false"
SKIP_BACKUP="false"
FORCE_DEPLOY="false"
ROLLBACK="false"
VERSION=""
IMAGE_TAG="latest"

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
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}INFO:${NC} $message"
    echo "$message" >> "$LOG_FILE"
}

warn() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${YELLOW}WARN:${NC} $message"
    echo "WARNING: $message" >> "$LOG_FILE"
}

error() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${RED}ERROR:${NC} $message"
    echo "ERROR: $message" >> "$LOG_FILE"
}

success() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${GREEN}SUCCESS:${NC} $message"
    echo "SUCCESS: $message" >> "$LOG_FILE"
}

info() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${CYAN}INFO:${NC} $message"
    echo "INFO: $message" >> "$LOG_FILE"
}

step() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${PURPLE}STEP:${NC} $message"
    echo "STEP: $message" >> "$LOG_FILE"
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

QASD Production Deployment Script

OPTIONS:
    -e, --environment ENV     Target environment (production, staging) [default: production]
    -v, --version VERSION     Application version to deploy
    -t, --tag TAG            Docker image tag [default: latest]
    --skip-tests             Skip running tests before deployment
    --skip-backup            Skip creating backup before deployment
    --force                  Force deployment without confirmations
    --rollback               Rollback to previous version
    -h, --help               Show this help message

EXAMPLES:
    $0                                    # Deploy latest version to production
    $0 -e staging -v 1.2.3               # Deploy version 1.2.3 to staging
    $0 --skip-tests --force               # Force deploy without tests
    $0 --rollback                         # Rollback to previous version

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
            -v|--version)
                VERSION="$2"
                shift 2
                ;;
            -t|--tag)
                IMAGE_TAG="$2"
                shift 2
                ;;
            --skip-tests)
                SKIP_TESTS="true"
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP="true"
                shift
                ;;
            --force)
                FORCE_DEPLOY="true"
                shift
                ;;
            --rollback)
                ROLLBACK="true"
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

# Function to validate environment
validate_environment() {
    step "Validating deployment environment"
    
    case "$ENVIRONMENT" in
        "production"|"staging")
            log "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            error_exit "Invalid environment: $ENVIRONMENT. Must be 'production' or 'staging'"
            ;;
    esac
    
    # Check if required files exist
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        error_exit "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    fi
    
    if [ ! -f "$DOCKERFILE" ]; then
        error_exit "Dockerfile not found: $DOCKERFILE"
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error_exit "Docker is not running or not accessible"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose > /dev/null 2>&1; then
        error_exit "Docker Compose is not installed or not in PATH"
    fi
    
    success "Environment validation completed"
}

# Function to check prerequisites
check_prerequisites() {
    step "Checking deployment prerequisites"
    
    # Check required tools
    local required_tools=("git" "node" "npm" "docker" "docker-compose")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" > /dev/null 2>&1; then
            error_exit "Required tool not found: $tool"
        fi
    done
    
    # Check disk space (minimum 5GB)
    local available_space=$(df "$PROJECT_DIR" | awk 'NR==2 {print $4}')
    local min_space=5242880  # 5GB in KB
    
    if [ "$available_space" -lt "$min_space" ]; then
        error_exit "Insufficient disk space. Available: $(($available_space/1024/1024))GB, Required: 5GB"
    fi
    
    # Check if ports are available
    local ports=("80" "443")
    for port in "${ports[@]}"; do
        if netstat -tuln | grep -q ":$port "; then
            if [ "$FORCE_DEPLOY" != "true" ]; then
                error_exit "Port $port is already in use. Use --force to override."
            else
                warn "Port $port is in use but continuing due to --force flag"
            fi
        fi
    done
    
    success "Prerequisites check completed"
}

# Function to run tests
run_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        warn "Skipping tests as requested"
        return 0
    fi
    
    step "Running test suite"
    
    cd "$PROJECT_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing dependencies..."
        npm ci
    fi
    
    # Run linting
    log "Running linting checks..."
    npm run lint || error_exit "Linting failed"
    
    # Run unit tests
    log "Running unit tests..."
    npm run test:ci || error_exit "Unit tests failed"
    
    # Run build test
    log "Testing production build..."
    npm run build || error_exit "Production build failed"
    
    success "All tests passed"
}

# Function to create backup
create_backup() {
    if [ "$SKIP_BACKUP" = "true" ]; then
        warn "Skipping backup as requested"
        return 0
    fi
    
    step "Creating backup before deployment"
    
    local backup_timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="qasd_backup_${backup_timestamp}"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup current deployment
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        log "Backing up current deployment..."
        
        # Export current containers
        docker-compose -f "$DOCKER_COMPOSE_FILE" config > "$backup_path.yml"
        
        # Backup volumes
        docker run --rm -v qasd_data:/data -v "$backup_path":/backup alpine tar czf /backup/volumes.tar.gz -C /data .
        
        # Backup environment files
        cp "$PROJECT_DIR/.env.production" "$backup_path.env" 2>/dev/null || true
        
        # Create backup metadata
        cat > "$backup_path.meta" << EOF
Backup Created: $(date)
Environment: $ENVIRONMENT
Version: $(git describe --tags --always 2>/dev/null || echo "unknown")
Commit: $(git rev-parse HEAD 2>/dev/null || echo "unknown")
EOF
        
        success "Backup created: $backup_name"
        echo "$backup_name" > "$BACKUP_DIR/latest_backup"
    else
        log "No running deployment found, skipping backup"
    fi
}

# Function to build Docker image
build_image() {
    step "Building Docker image"
    
    cd "$PROJECT_DIR"
    
    # Set build arguments
    local build_args=()
    build_args+=("--build-arg" "NODE_ENV=$ENVIRONMENT")
    
    if [ -n "$VERSION" ]; then
        build_args+=("--build-arg" "APP_VERSION=$VERSION")
    fi
    
    # Build the image
    log "Building image with tag: qasd:$IMAGE_TAG"
    docker build -f "$DOCKERFILE" -t "qasd:$IMAGE_TAG" "${build_args[@]}" . || error_exit "Docker build failed"
    
    # Tag for environment
    docker tag "qasd:$IMAGE_TAG" "qasd:$ENVIRONMENT-$IMAGE_TAG"
    
    success "Docker image built successfully"
}

# Function to deploy application
deploy_application() {
    step "Deploying application"
    
    cd "$PROJECT_DIR"
    
    # Set environment variables for deployment
    export COMPOSE_PROJECT_NAME="qasd_$ENVIRONMENT"
    export IMAGE_TAG="$IMAGE_TAG"
    export ENVIRONMENT="$ENVIRONMENT"
    
    # Stop existing deployment gracefully
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        log "Stopping existing deployment..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down --timeout 30
    fi
    
    # Start new deployment
    log "Starting new deployment..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d || error_exit "Deployment failed"
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    local max_wait=300  # 5 minutes
    local wait_time=0
    
    while [ $wait_time -lt $max_wait ]; do
        if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "healthy\|Up"; then
            break
        fi
        sleep 10
        wait_time=$((wait_time + 10))
        log "Waiting for services... ($wait_time/$max_wait seconds)"
    done
    
    if [ $wait_time -ge $max_wait ]; then
        error_exit "Services failed to become healthy within $max_wait seconds"
    fi
    
    success "Application deployed successfully"
}

# Function to run health checks
run_health_checks() {
    step "Running post-deployment health checks"
    
    local health_url="http://localhost/health"
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"
        
        if curl -s -f "$health_url" > /dev/null 2>&1; then
            success "Health check passed"
            
            # Get health status
            local health_response=$(curl -s "$health_url")
            log "Health status: $health_response"
            return 0
        fi
        
        sleep 10
        attempt=$((attempt + 1))
    done
    
    error_exit "Health checks failed after $max_attempts attempts"
}

# Function to rollback deployment
rollback_deployment() {
    step "Rolling back to previous deployment"
    
    if [ ! -f "$BACKUP_DIR/latest_backup" ]; then
        error_exit "No backup found for rollback"
    fi
    
    local backup_name=$(cat "$BACKUP_DIR/latest_backup")
    local backup_path="$BACKUP_DIR/$backup_name"
    
    if [ ! -f "$backup_path.yml" ]; then
        error_exit "Backup configuration not found: $backup_path.yml"
    fi
    
    log "Rolling back to backup: $backup_name"
    
    # Stop current deployment
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --timeout 30
    
    # Restore from backup
    docker-compose -f "$backup_path.yml" up -d || error_exit "Rollback failed"
    
    success "Rollback completed successfully"
}

# Function to cleanup old resources
cleanup_resources() {
    step "Cleaning up old resources"
    
    # Remove unused Docker images
    log "Removing unused Docker images..."
    docker image prune -f
    
    # Remove old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        log "Cleaning up old backups..."
        find "$BACKUP_DIR" -name "qasd_backup_*" -type f | sort -r | tail -n +6 | xargs rm -f
    fi
    
    success "Cleanup completed"
}

# Function to send deployment notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Send notification via webhook if configured
    if [ -n "${WEBHOOK_URL:-}" ]; then
        local payload=$(cat << EOF
{
    "text": "QASD Deployment $status",
    "attachments": [
        {
            "color": "$([ "$status" = "SUCCESS" ] && echo "good" || echo "danger")",
            "fields": [
                {
                    "title": "Environment",
                    "value": "$ENVIRONMENT",
                    "short": true
                },
                {
                    "title": "Version",
                    "value": "${VERSION:-$IMAGE_TAG}",
                    "short": true
                },
                {
                    "title": "Message",
                    "value": "$message",
                    "short": false
                }
            ]
        }
    ]
}
EOF
        )
        
        curl -X POST -H 'Content-type: application/json' --data "$payload" "$WEBHOOK_URL" || true
    fi
}

# Function to show deployment summary
show_summary() {
    local status="$1"
    
    echo
    echo "======================================"
    echo "       DEPLOYMENT SUMMARY"
    echo "======================================"
    echo "Status: $status"
    echo "Environment: $ENVIRONMENT"
    echo "Version: ${VERSION:-$IMAGE_TAG}"
    echo "Timestamp: $(date)"
    echo "Log File: $LOG_FILE"
    echo "======================================"
    echo
}

# Main deployment function
main() {
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Start logging
    log "Starting QASD deployment process"
    log "Arguments: $*"
    
    # Parse command line arguments
    parse_arguments "$@"
    
    # Handle rollback
    if [ "$ROLLBACK" = "true" ]; then
        rollback_deployment
        show_summary "ROLLBACK SUCCESS"
        send_notification "ROLLBACK SUCCESS" "Successfully rolled back to previous version"
        return 0
    fi
    
    # Confirmation prompt
    if [ "$FORCE_DEPLOY" != "true" ]; then
        echo
        echo "You are about to deploy QASD to $ENVIRONMENT environment"
        echo "Version: ${VERSION:-$IMAGE_TAG}"
        echo "Skip Tests: $SKIP_TESTS"
        echo "Skip Backup: $SKIP_BACKUP"
        echo
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Deployment cancelled by user"
            exit 0
        fi
    fi
    
    # Execute deployment steps
    validate_environment
    check_prerequisites
    run_tests
    create_backup
    build_image
    deploy_application
    run_health_checks
    cleanup_resources
    
    success "Deployment completed successfully!"
    show_summary "SUCCESS"
    send_notification "SUCCESS" "Deployment completed successfully"
    
    # Show access information
    echo
    info "Application is now available at:"
    info "  HTTP:  http://localhost"
    info "  HTTPS: https://localhost"
    info "  Health: http://localhost/health"
    echo
}

# Trap errors and cleanup
trap 'error "Deployment failed with error on line $LINENO"; show_summary "FAILED"; send_notification "FAILED" "Deployment failed with error"; exit 1' ERR

# Execute main function
main "$@"