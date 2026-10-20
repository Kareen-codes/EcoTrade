import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ScreapItemsAnalytics({ scrapItems }) {
    const categories = ['Metals', 'Plastics', 'Electronics', 'Paper and Cardboard', 'Furniture'];
    const statuses = ['Received', 'Processed', 'Ready for Recycling', 'Ready for Auction'];

    // Calculate statistics
    const totalValue = scrapItems.reduce((acc, item) => acc + item.estimatedPrice, 0);
    const totalQuantity = scrapItems.reduce((acc, item) => acc + item.quantity, 0);

    // Calculate category distribution
    const categoryDistribution = categories.map(category => {
        return scrapItems.filter(item => item.category === category).length;
    });

    // Calculate status distribution
    const statusDistribution = statuses.map(status => {
        return scrapItems.filter(item => item.status === status).length;
    });

    // Category chart data
    const categoryChartData = {
        labels: categories.map(cat => {
            const emoji = {
                'Metals': '🔩 Metals',
                'Plastics': '♻️ Plastics',
                'Electronics': '💻 Electronics',
                'Paper and Cardboard': '📄 Paper and Cardboard',
                'Furniture': '🪑 Furniture'
            };
            return emoji[cat] || cat;
        }),
        datasets: [{
            label: 'Number of Materials',
            data: categoryDistribution,
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(239, 68, 68, 0.8)',
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 2,
            borderRadius: 8,
        }],
    };

    // Status chart data
    const statusChartData = {
        labels: ['📥 Received', '⚙️ Processed', '♻️ Ready for Recycling', '🔨 Ready for Auction'],
        datasets: [{
            label: 'Number of Materials',
            data: statusDistribution,
            backgroundColor: [
                'rgba(156, 163, 175, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
            ],
            borderColor: [
                'rgba(156, 163, 175, 1)',
                'rgba(251, 191, 36, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(34, 197, 94, 1)',
            ],
            borderWidth: 2,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 12,
                    font: { size: 11 }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 10 } }
            },
            x: {
                ticks: { font: { size: 10 } }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 12,
                    font: { size: 11 }
                }
            },
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-90 mb-1">Total Materials</div>
                    <div className="text-3xl font-bold">{scrapItems.length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-90 mb-1">Total Value</div>
                    <div className="text-2xl font-bold">{totalValue.toLocaleString()} SYP</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-90 mb-1">Total Quantity</div>
                    <div className="text-2xl font-bold">{totalQuantity.toFixed(1)} tons</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category Distribution */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Distribution by Category</h3>
                    <Bar data={categoryChartData} options={chartOptions} />
                </div>

                {/* Status Distribution */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Distribution by Status</h3>
                    <Doughnut data={statusChartData} options={doughnutOptions} />
                </div>
            </div>
        </div>
    );
}
