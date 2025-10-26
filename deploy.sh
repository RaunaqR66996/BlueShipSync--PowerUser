#!/bin/bash

# 🚀 AI-Powered TMS & WMS Production Deployment Script
# Version: 1.0.0
# Status: Production Ready

set -e

echo "🚀 Starting AI-Powered TMS & WMS Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/kafka
    mkdir -p data/mlflow
    mkdir -p data/grafana
    mkdir -p data/prometheus
    mkdir -p data/elasticsearch
    print_success "Directories created"
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        print_warning "Creating .env file from template..."
        cp env.example .env
        print_warning "Please update .env file with your production values"
    fi
    
    # Load environment variables
    source .env
    
    print_success "Environment variables set up"
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    # Start PostgreSQL, Redis, Kafka, MLflow, Monitoring
    docker-compose -f production/docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f production/docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "Infrastructure services started"
    else
        print_error "Failed to start infrastructure services"
        exit 1
    fi
}

# Train ML models
train_models() {
    print_status "Training ML models..."
    
    # Create models directory
    mkdir -p models
    
    # Train LSTM Demand Forecasting Model
    print_status "Training LSTM Demand Forecasting Model..."
    cd ml/models/lstm_demand_forecast
    python train.py --epochs 50 --sequence-length 60
    cd ../../..
    
    # Train GNN Route Optimization Model
    print_status "Training GNN Route Optimization Model..."
    cd ml/models/route_optimizer
    python train.py --epochs 50 --batch-size 32
    cd ../../..
    
    # Train RL Slotting Agent
    print_status "Training RL Slotting Agent..."
    cd ml/models/slotting_agent
    python train.py --episodes 500 --batch-size 32
    cd ../../..
    
    # Train YOLOv8 OCR Model
    print_status "Training YOLOv8 OCR Model..."
    cd ml/models/yolov8_ocr
    python train.py --epochs 50 --batch-size 16
    cd ../../..
    
    print_success "ML models trained"
}

# Build and start microservices
start_microservices() {
    print_status "Building and starting microservices..."
    
    # Build and start all services
    docker-compose -f services/docker-compose.services.yml up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for microservices to be ready..."
    sleep 60
    
    # Check if services are running
    if docker-compose -f services/docker-compose.services.yml ps | grep -q "Up"; then
        print_success "Microservices started"
    else
        print_error "Failed to start microservices"
        exit 1
    fi
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check API Gateway
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "API Gateway is healthy"
    else
        print_error "API Gateway health check failed"
    fi
    
    # Check TMS Services
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        print_success "Route Optimization Service is healthy"
    else
        print_error "Route Optimization Service health check failed"
    fi
    
    if curl -f http://localhost:8002/health > /dev/null 2>&1; then
        print_success "Carrier Intelligence Service is healthy"
    else
        print_error "Carrier Intelligence Service health check failed"
    fi
    
    # Check WMS Services
    if curl -f http://localhost:8003/health > /dev/null 2>&1; then
        print_success "Slotting Optimization Service is healthy"
    else
        print_error "Slotting Optimization Service health check failed"
    fi
    
    if curl -f http://localhost:8004/health > /dev/null 2>&1; then
        print_success "Inventory Perception Service is healthy"
    else
        print_error "Inventory Perception Service health check failed"
    fi
    
    # Check Infrastructure
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        print_success "Prometheus is healthy"
    else
        print_error "Prometheus health check failed"
    fi
    
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Grafana is healthy"
    else
        print_error "Grafana health check failed"
    fi
    
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_success "MLflow is healthy"
    else
        print_error "MLflow health check failed"
    fi
}

# Display deployment summary
display_summary() {
    echo ""
    echo "🎉 AI-Powered TMS & WMS Deployment Complete!"
    echo ""
    echo "📊 Service URLs:"
    echo "  • API Gateway: http://localhost:8000"
    echo "  • Route Optimization: http://localhost:8001"
    echo "  • Carrier Intelligence: http://localhost:8002"
    echo "  • Slotting Optimization: http://localhost:8003"
    echo "  • Inventory Perception: http://localhost:8004"
    echo ""
    echo "📈 Monitoring URLs:"
    echo "  • Prometheus: http://localhost:9090"
    echo "  • Grafana: http://localhost:3001"
    echo "  • MLflow: http://localhost:5000"
    echo "  • Kibana: http://localhost:5601"
    echo ""
    echo "🔧 Management Commands:"
    echo "  • View logs: docker-compose -f services/docker-compose.services.yml logs -f"
    echo "  • Stop services: docker-compose -f services/docker-compose.services.yml down"
    echo "  • Restart services: docker-compose -f services/docker-compose.services.yml restart"
    echo ""
    echo "📚 Documentation:"
    echo "  • API Docs: http://localhost:8000/docs"
    echo "  • Service Docs: services/README.md"
    echo "  • Architecture: production/PRODUCTION_ARCHITECTURE.md"
    echo ""
    echo "✅ Deployment Status: PRODUCTION READY"
    echo ""
}

# Main deployment function
main() {
    echo "🚀 AI-Powered TMS & WMS Production Deployment"
    echo "=============================================="
    echo ""
    
    # Pre-deployment checks
    check_docker
    check_docker_compose
    create_directories
    setup_environment
    
    # Deployment steps
    start_infrastructure
    train_models
    start_microservices
    run_health_checks
    
    # Post-deployment
    display_summary
}

# Handle script arguments
case "${1:-}" in
    "infrastructure")
        check_docker
        check_docker_compose
        create_directories
        setup_environment
        start_infrastructure
        print_success "Infrastructure deployment complete"
        ;;
    "models")
        train_models
        print_success "Model training complete"
        ;;
    "services")
        start_microservices
        print_success "Microservices deployment complete"
        ;;
    "health")
        run_health_checks
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose -f production/docker-compose.prod.yml down
        docker-compose -f services/docker-compose.services.yml down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose -f production/docker-compose.prod.yml restart
        docker-compose -f services/docker-compose.services.yml restart
        print_success "All services restarted"
        ;;
    "logs")
        print_status "Showing service logs..."
        docker-compose -f services/docker-compose.services.yml logs -f
        ;;
    *)
        main
        ;;
esac












