console.log('Unified Dashboard JS v1.0 Loaded');

// Global state management
let dashboardState = {
    currentSelection: null,
    currentKPIs: [],
    selectedKPI: null,
    socket: null,
    chart: null
};

// DOM Elements - Dashboard
const dashboardSlug = document.getElementById('dashboard-slug')?.textContent.trim();
const user = document.getElementById('user')?.textContent.trim();
const submitBtn = document.getElementById('submit-btn');
const dataInput = document.getElementById('data-input');
const dataBox = document.getElementById('data-box');
const chartType = document.getElementById('chart-type');
const ctx = document.getElementById('myChart')?.getContext('2d');

// DOM Elements - Team Dashboard
const dashboardSelector = document.getElementById('dashboard-selector');
const loadingIndicator = document.getElementById('loading-indicator');
const kpiListContainer = document.getElementById('kpi-list-container');
const kpiList = document.getElementById('kpi-list');
const dashboardContainer = document.getElementById('dashboard-container');
const dashboardContent = document.getElementById('dashboard-content');
const dashboardTitle = document.getElementById('dashboard-title');
const backToListBtn = document.getElementById('back-to-list');
const emptyState = document.getElementById('empty-state');

// Initialize based on page type
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    console.log('Dashboard slug:', dashboardSlug);
    console.log('Dashboard selector:', dashboardSelector);
    
    if (dashboardSlug && ctx) {
        // Individual KPI dashboard
        console.log('Initializing individual KPI dashboard');
        initializeKPIDashboard();
    } else if (dashboardSelector) {
        // Team dashboard selector
        console.log('Initializing team dashboard');
        initializeTeamDashboard();
        
        // Check dropdown options
        const options = dashboardSelector.querySelectorAll('option');
        console.log('Dropdown options count:', options.length);
        options.forEach((option, index) => {
            console.log(`Option ${index}:`, option.value, option.textContent);
        });
    } else {
        console.log('No dashboard type detected');
    }
});

// ========== INDIVIDUAL KPI DASHBOARD FUNCTIONS ==========

function initializeKPIDashboard() {
    console.log('Initializing individual KPI dashboard for:', dashboardSlug);
    
    // Initialize WebSocket if needed
    if (dashboardSlug) {
        initializeWebSocket(dashboardSlug);
    }
    
    // Initialize chart
    if (ctx) {
        drawChart();
    }
    
    // Add submit button event listener
    if (submitBtn && dataInput) {
        submitBtn.addEventListener('click', handleDataSubmission);
    }
}

function initializeWebSocket(slug) {
    // Close existing WebSocket if any
    if (dashboardState.socket && dashboardState.socket.readyState === WebSocket.OPEN) {
        console.log('Closing existing WebSocket connection');
        dashboardState.socket.close();
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    console.log('Using WebSocket protocol:', protocol, 'for slug:', slug);
    
    dashboardState.socket = new WebSocket(`${protocol}//${window.location.host}/ws/${slug}/`);
    
    dashboardState.socket.onopen = function(e) {
        console.log('WebSocket connected successfully for:', slug);
    };
    
    dashboardState.socket.onmessage = function(e) {
        const {sender, message} = JSON.parse(e.data);
        
        // Look for data box in current page or embedded content
        const targetDataBox = dataBox || dashboardContent?.querySelector('#data-box');
        if (targetDataBox) {
            targetDataBox.innerHTML += `<p>${sender}: ${message}</p>`;
        }
        
        // Update chart with new data
        updateChart();
    };
    
    dashboardState.socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
    
    dashboardState.socket.onclose = function(e) {
        console.log('WebSocket closed:', e.code, e.reason);
        if (e.code !== 1000) {
            console.warn('WebSocket closed unexpectedly');
        }
    };
}

function handleDataSubmission() {
    const dataValue = dataInput.value.trim();
    
    if (!dataValue) {
        alert('Please enter a value');
        return;
    }
    
    if (dashboardState.socket && dashboardState.socket.readyState === WebSocket.OPEN) {
        dashboardState.socket.send(JSON.stringify({
            'message': dataValue,
            'sender': user,
        }));
        dataInput.value = ''; // Clear input after sending
    } else {
        console.error('WebSocket is not connected');
        alert('Connection error. Please refresh the page.');
    }
}

// ========== CHART FUNCTIONS ==========

// Function to ensure Chart.js is loaded
const ensureChartJSLoaded = async() => {
    if (typeof Chart !== 'undefined') {
        return true;
    }
    
    console.log('Chart.js not found, attempting to load...');
    
    return new Promise((resolve, reject) => {
        // Check if Chart.js script is already in the DOM
        const existingScript = document.querySelector('script[src*="chart.js"]');
        if (existingScript) {
            // Wait for it to load
            existingScript.onload = () => resolve(true);
            existingScript.onerror = () => reject(false);
            return;
        }
        
        // Create and load Chart.js script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            console.log('Chart.js loaded successfully');
            resolve(true);
        };
        script.onerror = () => {
            console.error('Failed to load Chart.js');
            reject(false);
        };
        document.head.appendChild(script);
    });
};

const fetchChartData = async(slug = null) => {
    try {
        const url = slug ? `/stats/${slug}/chart/` : window.location.href + 'chart/';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Chart data received:', data);
        return data;
    } catch (error) {
        console.error('Error fetching chart data:', error);
        throw error;
    }
}

const drawChart = async(slug = null, canvasContext = null) => {
    try {
        // Ensure Chart.js is loaded
        await ensureChartJSLoaded();
    } catch (error) {
        console.error('Cannot draw chart: Chart.js failed to load');
        return;
    }
    
    // Use provided context or fall back to global ctx
    const chartCtx = canvasContext || ctx;
    
    if (!chartCtx) {
        console.warn('Chart context not found');
        return;
    }
    
    try {
        const data = await fetchChartData(slug);
        const {chartData, chartLabels} = data;
        
        // Get the chart type value from the DOM element or embedded content
        let currentChartType = 'bar';
        if (chartType) {
            currentChartType = chartType.textContent.trim();
        } else if (canvasContext) {
            // Look for chart type in the embedded dashboard content
            const embeddedChartType = dashboardContent?.querySelector('#chart-type');
            if (embeddedChartType) {
                currentChartType = embeddedChartType.textContent.trim();
            }
        }
        
        // Destroy existing chart if it exists
        if (dashboardState.chart) {
            dashboardState.chart.destroy();
        }
        
        dashboardState.chart = new Chart(chartCtx, {
            type: currentChartType,
            data: {
                labels: chartLabels,
                datasets: [{
                    label: getDatasetLabel(currentChartType),
                    data: chartData,
                    backgroundColor: getColors(chartData.length),
                    borderWidth: 1
                }]
            },
            options: getChartOptions(currentChartType)
        });
    } catch (error) {
        console.error('Error drawing chart:', error);
    }
}

const updateChart = async() => {
    if (dashboardState.chart) {
        try {
            const data = await fetchChartData();
            const {chartData, chartLabels} = data;
            
            dashboardState.chart.data.labels = chartLabels;
            dashboardState.chart.data.datasets[0].data = chartData;
            dashboardState.chart.update();
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }
}

// Helper functions for different chart types
const getDatasetLabel = (type) => {
    const labels = {
        'pie': '% of contribution',
        'bar': 'Contribution Amount',
        'line': 'Contribution Trend',
        'doughnut': '% of contribution',
        'radar': 'Performance Metrics',
        'polarArea': 'Data Distribution'
    };
    return labels[type] || 'Data';
}

// Function to get colors based on chart type and data length
const getColors = (dataLength) => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return colors.slice(0, dataLength);
}

// Function to get chart-specific options
const getChartOptions = (type) => {
    // Ensure type is a string and provide fallback
    const chartType = type && typeof type === 'string' ? type : 'bar';
    
    const baseOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { 
                display: true, 
                text: `Data Contributions by User (${chartType.toUpperCase()})`
            }
        }
    };

    // Add specific options for different chart types
    if (chartType === 'bar') {
        baseOptions.scales = {
            y: { beginAtZero: true }
        };
    }
    
    if (chartType === 'line') {
        baseOptions.scales = {
            y: { beginAtZero: true }
        };
        baseOptions.elements = {
            line: { tension: 0.1 }
        };
    }

    return baseOptions;
}

// ========== TEAM DASHBOARD FUNCTIONS ==========

function initializeTeamDashboard() {
    console.log('Initializing team dashboard');
    
    // Dashboard selector change event
    if (dashboardSelector) {
        console.log('Dashboard selector found, adding event listener');
        dashboardSelector.addEventListener('change', handleDashboardSelection);
    } else {
        console.error('Dashboard selector not found!');
    }
    
    // Back to list button
    if (backToListBtn) {
        backToListBtn.addEventListener('click', showKPIList);
    }
}

// Handle dashboard selection change
async function handleDashboardSelection(event) {
    console.log('Dashboard selection changed!', event.target.value);
    const selection = event.target.value;
    
    if (!selection) {
        console.log('No selection, showing empty state');
        showEmptyState();
        return;
    }
    
    console.log('Loading KPIs for selection:', selection);
    dashboardState.currentSelection = selection;
    await loadKPIsForSelection(selection);
}

// Load KPIs for selected dashboard
async function loadKPIsForSelection(selection) {
    showLoading();
    
    try {
        console.log('Fetching KPIs for selection:', selection);
        const response = await fetch(`/stats/api/team-kpis/?selection=${encodeURIComponent(selection)}`);
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.success) {
            dashboardState.currentKPIs = data.kpis;
            renderKPIList(data.kpis, data.selection_type);
            showKPIList();
        } else {
            throw new Error(data.error || 'Failed to load KPIs');
        }
    } catch (error) {
        console.error('Error loading KPIs:', error);
        showError(`Failed to load KPIs: ${error.message}`);
    }
}

// Render KPI list
function renderKPIList(kpis, selectionType) {
    if (!kpiList) {
        console.warn('KPI list container not found');
        return;
    }
    
    kpiList.innerHTML = '';
    
    if (kpis.length === 0) {
        kpiList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle"></i>
                    <strong>No KPIs found</strong>
                    <p class="mb-0">This ${selectionType} doesn't have any KPIs yet.</p>
                </div>
            </div>
        `;
        return;
    }
    
    kpis.forEach(kpi => {
        const kpiCard = createKPICard(kpi);
        kpiList.appendChild(kpiCard);
    });
}

// Create KPI card element
function createKPICard(kpi) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-3';
    
    const chartTypeIcon = getChartTypeIcon(kpi.chart_type);
    
    col.innerHTML = `
        <div class="card h-100 kpi-card" data-kpi-slug="${kpi.slug}" style="cursor: pointer;">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">${kpi.name}</h6>
                    <span class="badge bg-primary">${chartTypeIcon} ${kpi.chart_type}</span>
                </div>
                <p class="text-muted small mb-2">
                    <i class="fas fa-user"></i>
                    Created by: ${kpi.owner}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="fas fa-chart-bar"></i>
                        ${kpi.data_count} data points
                    </small>
                    <button class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add click event to the card
    col.querySelector('.kpi-card').addEventListener('click', () => {
        loadKPIDashboard(kpi);
    });
    
    return col;
}

// Get chart type icon
function getChartTypeIcon(chartType) {
    const icons = {
        'pie': 'fas fa-chart-pie',
        'bar': 'fas fa-chart-bar',
        'line': 'fas fa-chart-line',
        'doughnut': 'fas fa-chart-pie',
        'radar': 'fas fa-chart-area',
        'polarArea': 'fas fa-chart-area'
    };
    
    return `<i class="${icons[chartType] || 'fas fa-chart-bar'}"></i>`;
}

// Load KPI dashboard
async function loadKPIDashboard(kpi) {
    dashboardState.selectedKPI = kpi;
    showLoading();
    
    try {
        // Load the dashboard content via iframe or fetch
        const response = await fetch(`/stats/${kpi.slug}/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // Extract main content from the response
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Try to find the main dashboard content
        const mainContent = tempDiv.querySelector('.container') || tempDiv.querySelector('main') || tempDiv;
        
        if (dashboardTitle) {
            dashboardTitle.innerHTML = `
                <i class="fas fa-chart-line"></i>
                ${kpi.name}
                <small class="text-muted">(${kpi.chart_type})</small>
            `;
        }
        
        if (dashboardContent) {
            dashboardContent.innerHTML = mainContent.innerHTML;
        }
        
        // Re-initialize any scripts needed for the dashboard
        initializeDashboardScripts(kpi.slug);
        
        showDashboard();
        
    } catch (error) {
        console.error('Error loading KPI dashboard:', error);
        showError('Failed to load KPI dashboard. Please try again.');
    }
}

// Initialize dashboard scripts (for chart rendering, etc.)
function initializeDashboardScripts(slug) {
    console.log('Initializing dashboard scripts for slug:', slug);
    
    // If the dashboard has Chart.js, we might need to reinitialize it
    const canvasElement = dashboardContent?.querySelector('canvas[id="myChart"]');
    if (canvasElement) {
        console.log('Chart canvas found, reinitializing charts for slug:', slug);
        // Get the context and redraw chart
        const newCtx = canvasElement.getContext('2d');
        if (newCtx) {
            console.log('New chart context found, drawing chart');
            // Use setTimeout to ensure DOM is fully ready
            setTimeout(() => {
                drawChart(slug, newCtx).catch(error => {
                    console.error('Failed to draw chart:', error);
                });
            }, 100);
        } else {
            console.error('Failed to get canvas context');
        }
    } else {
        console.log('No chart canvas found in embedded dashboard');
    }
    
    // Initialize WebSocket connections for the embedded dashboard
    if (slug) {
        initializeWebSocket(slug);
    }
}

// ========== UI STATE MANAGEMENT ==========

function showLoading() {
    hideAllContainers();
    if (loadingIndicator) {
        loadingIndicator.classList.remove('d-none');
    }
}

function showKPIList() {
    hideAllContainers();
    if (kpiListContainer) {
        kpiListContainer.classList.remove('d-none');
    }
}

function showDashboard() {
    hideAllContainers();
    if (dashboardContainer) {
        dashboardContainer.classList.remove('d-none');
    }
}

function showEmptyState() {
    hideAllContainers();
    if (emptyState) {
        emptyState.classList.remove('d-none');
    }
}

function hideAllContainers() {
    const containers = [loadingIndicator, kpiListContainer, dashboardContainer, emptyState];
    containers.forEach(container => {
        if (container) {
            container.classList.add('d-none');
        }
    });
}

function showError(message) {
    hideAllContainers();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger text-center';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <strong>Error:</strong> ${message}
        <button class="btn btn-link" onclick="showEmptyState()">
            <i class="fas fa-redo"></i>
            Try Again
        </button>
    `;
    
    // Insert error after the selection card
    const container = document.querySelector('.container .col-md-12');
    if (container) {
        const selectionCard = container.querySelector('.card');
        if (selectionCard) {
            selectionCard.insertAdjacentElement('afterend', errorDiv);
        }
    }
}

// ========== UTILITY FUNCTIONS ==========

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== GLOBAL EXPORTS ==========

// Export functions for external use and backward compatibility
window.UnifiedDashboard = {
    loadKPIsForSelection,
    showKPIList,
    showDashboard,
    showEmptyState,
    drawChart,
    updateChart,
    initializeWebSocket
};

// Backward compatibility
window.TeamDashboard = window.UnifiedDashboard;