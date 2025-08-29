// src/components/NutritionPieChart.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4ade80", "#60a5fa", "#facc15"];
// green = protein, blue = carbs, yellow = fat

export default function NutritionPieChart({ protein, carbs, fat }) {
  const data = [
    { name: "Protein", value: protein, color: COLORS[0] },
    { name: "Carbs", value: carbs, color: COLORS[1] },
    { name: "Fat", value: fat, color: COLORS[2] },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom label with arrow line
  const renderLabel = ({ value, cx, cy, midAngle, outerRadius, index }) => {
    if (total === 0) return null;
    const RADIAN = Math.PI / 180;

    const startX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const startY = cy + outerRadius * Math.sin(-midAngle * RADIAN);

    const endX = cx + (outerRadius + 30) * Math.cos(-midAngle * RADIAN);
    const endY = cy + (outerRadius + 30) * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={data[index].color}
          strokeWidth={2}
        />
        <text
          x={endX}
          y={endY}
          fill={data[index].color}
          textAnchor={endX > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={14}
          fontWeight={700}
        >
          {`${((value / total) * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  // Custom legend with black-bordered squares
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center mt-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center mx-2">
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                marginRight: 6,
                backgroundColor: data[index].color,
                border: "1.5px solid black",
              }}
            />
            <span style={{ color: "#111827", fontWeight: 600 }}>
              {entry.value} {/* removed g */}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-800 mb-2 text-center">
        Macronutrient Breakdown
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              labelLine={false}
              label={renderLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) =>
                total > 0
                  ? [`${value} gm (${((value / total) * 100).toFixed(1)}%)`, name]
                  : [`${value} gm (0%)`, name]
              }
            />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}









