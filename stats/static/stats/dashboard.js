console.log('hello world')
const dashboardSlug = document.getElementById('dashboard-slug').textContent.trim()
const user = document.getElementById('user').textContent.trim()
const submitBtn =document.getElementById('submit-btn')
const dataInput = document.getElementById('data-input')
const dataBox = document.getElementById('data-box')
const socket = new WebSocket(`ws://${window.location.host}/ws/${dashboardSlug}/`);

socket.onopen = function(e) {
    console.log('WebSocket connected successfully');
};

socket.onmessage = function(e) {
    const {sender, message} = JSON.parse(e.data)
    dataBox.innerHTML += `<p>${sender}: ${message}</p>`
    
    // Update chart with new data
    updateChart();
};

socket.onerror = function(error) {
    console.error('WebSocket error:', error);
};

socket.onclose = function(e) {
    console.log('WebSocket closed:', e.code, e.reason);
    if (e.code !== 1000) {
        console.warn('WebSocket closed unexpectedly');
    }
};

submitBtn.addEventListener('click', () => {
    const dataValue = dataInput.value.trim();
    
    if (!dataValue) {
        alert('Please enter a value');
        return;
    }
    
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            'message': dataValue,
            'sender': user,
        }));
        dataInput.value = ''; // Clear input after sending
    } else {
        console.error('WebSocket is not connected');
        alert('Connection error. Please refresh the page.');
    }
})

const ctx = document.getElementById('myChart').getContext('2d')
let chart;

const fetchChartData = async() => {
    try {
        const response = await fetch(window.location.href + 'chart/')
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json()
        console.log('Chart data received:', data)
        return data
    } catch (error) {
        console.error('Error fetching chart data:', error);
        throw error;
    }
}

const drawChart = async() => {
    try {
        const data = await fetchChartData()
        const {chartData, chartLabels} = data

        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: '% of contribution',
                    data: chartData,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Data Contributions by User'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error drawing chart:', error);
    }
}

const updateChart = async() => {
    if (chart) {
        try {
            const data = await fetchChartData()
            const {chartData, chartLabels} = data
            
            chart.data.labels = chartLabels;
            chart.data.datasets[0].data = chartData;
            chart.update();
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }
}

drawChart()