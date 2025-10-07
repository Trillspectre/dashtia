(function(){
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};

    const chartModule = {
        async ensureChartJSLoaded() {
            if (typeof Chart !== 'undefined') return true;
            const existingScript = document.querySelector('script[src*="chart.js"]');
            if (existingScript) {
                return new Promise((resolve, reject) => {
                    existingScript.onload = () => resolve(true);
                    existingScript.onerror = () => reject(false);
                });
            }
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                script.onload = () => resolve(true);
                script.onerror = () => reject(false);
                document.head.appendChild(script);
            });
        },

        async fetchChartData(slug = null) {
            try {
                const url = slug ? `/stats/${slug}/chart/` : window.location.href + 'chart/';
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching chart data:', error);
                throw error;
            }
        },

        async drawChart(slug = null, canvasContext = null) {
            try {
                await chartModule.ensureChartJSLoaded();
            } catch (error) {
                console.error('Cannot draw chart: Chart.js failed to load');
                return;
            }
            const chartCtx = canvasContext || document.getElementById('myChart')?.getContext('2d');
            if (!chartCtx) return;
            try {
                const data = await chartModule.fetchChartData(slug);
                const {chartData, chartLabels} = data;
                let currentChartType = 'bar';
                const chartTypeEl = document.getElementById('chart-type');
                if (chartTypeEl) currentChartType = chartTypeEl.textContent.trim();

                if (window.UnifiedDashboardModules && window.UnifiedDashboardModules._state && window.UnifiedDashboardModules._state.chartInstance) {
                    try { window.UnifiedDashboardModules._state.chartInstance.destroy(); } catch(e){}
                }

                const ChartCtor = window.Chart;
                if (!ChartCtor) return;

                const chartInstance = new ChartCtor(chartCtx, {
                    type: currentChartType,
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: chartModule.getDatasetLabel(currentChartType),
                            data: chartData,
                            backgroundColor: chartModule.getColors(chartData.length),
                            borderWidth: 1
                        }]
                    },
                    options: chartModule.getChartOptions(currentChartType)
                });

                window.UnifiedDashboardModules._state = window.UnifiedDashboardModules._state || {};
                window.UnifiedDashboardModules._state.chartInstance = chartInstance;

            } catch (error) {
                console.error('Error drawing chart:', error);
            }
        },

        async updateChart() {
            const state = window.UnifiedDashboardModules._state || {};
            const chart = state.chartInstance;
            if (!chart) return;
            try {
                const data = await chartModule.fetchChartData();
                const {chartData, chartLabels} = data;
                chart.data.labels = chartLabels;
                chart.data.datasets[0].data = chartData;
                chart.update();
            } catch (error) {
                console.error('Error updating chart:', error);
            }
        },

        getDatasetLabel(type) {
            const labels = {
                'pie': '% of contribution',
                'bar': 'Contribution Amount',
                'line': 'Contribution Trend',
                'doughnut': '% of contribution',
                'radar': 'Performance Metrics',
                'polarArea': 'Data Distribution'
            };
            return labels[type] || 'Data';
        },

        getColors(dataLength) {
            const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
            return colors.slice(0, dataLength);
        },

        getChartOptions(type) {
            const chartType = type && typeof type === 'string' ? type : 'bar';
            const baseOptions = {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Data Contributions by User (${chartType.toUpperCase()})` }
                }
            };
            if (chartType === 'bar') baseOptions.scales = { y: { beginAtZero: true } };
            if (chartType === 'line') {
                baseOptions.scales = { y: { beginAtZero: true } };
                baseOptions.elements = { line: { tension: 0.1 } };
            }
            return baseOptions;
        }
    };

    window.UnifiedDashboardModules.chart = chartModule;
})();
