import React from 'react';
import ReactECharts from 'echarts-for-react';

// Sample timestamps (in milliseconds or ISO strings)
const timestamps = [
  '2025-05-19T14:30:00Z',
  '2025-05-20T10:15:00Z',
  '2025-05-21T09:00:00Z',
  '2025-05-22T16:45:00Z',
  '2025-05-23T11:30:00Z',
  '2025-05-24T08:00:00Z',
  '2025-05-25T17:20:00Z'
];

// Sample data for each series
const barData = [120, 200, 150, 80, 70, 110, 130];
const lineData = [100, 180, 130, 90, 60, 120, 140];

// Format for day/time: "Tue, 2:30 PM"
const formatTimestamp = (ts) => {
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const MixedChartWithTime = () => {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Bar Data', 'Line Data'] },
    xAxis: {
      type: 'category',
      data: timestamps,
      axisLabel: {
        formatter: function (value) {
          return formatTimestamp(value);
        },
        rotate: 45 // Optional: rotate labels if they overlap
      }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Bar Data',
        type: 'bar',
        data: barData,
        itemStyle: { color: '#3498db' }
      },
      {
        name: 'Line Data',
        type: 'line',
        data: lineData,
        smooth: true,
        lineStyle: { color: '#e74c3c' }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: 400 }} />;
};

export default MixedChartWithTime;
