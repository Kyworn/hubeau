import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TrendsChart = ({ data, limit, reference }) => {
    // Prepare data: sort by date ascending
    const chartData = [...data]
        .sort((a, b) => new Date(a.date_prelevement) - new Date(b.date_prelevement))
        .map(item => ({
            date: new Date(item.date_prelevement).getTime(), // Use timestamp for unique X values
            displayDate: new Date(item.date_prelevement).toLocaleDateString(),
            value: item.resultat_numerique,
            unit: item.libelle_unite
        }));

    // Parse limit/reference for reference line
    let refValue = null;
    if (limit) {
        const match = limit.match(/(\d+(\.\d+)?)/);
        if (match) refValue = parseFloat(match[0]);
    } else if (reference) {
        // Try to find a max value
        const match = reference.match(/<=?(\d+(\.\d+)?)/);
        if (match) refValue = parseFloat(match[1]);
    }

    return (
        <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        domain={['auto', 'auto']}
                        type="number"
                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
                        scale="time"
                    />
                    <YAxis />
                    <Tooltip
                        isAnimationActive={false}
                        labelFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
                        cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
                    />
                    {refValue !== null && (
                        <ReferenceLine y={refValue} label="Limite" stroke="red" strokeDasharray="3 3" />
                    )}
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 6, strokeWidth: 2 }}
                        activeDot={{ r: 9 }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendsChart;
