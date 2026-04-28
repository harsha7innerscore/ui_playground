import React from "react";

export const ResponsiveContainer = ({ children }: any) => (
  <div data-testid="responsive-container">{children}</div>
);

export const LineChart = ({ children, data }: any) => (
  <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
    {children}
  </div>
);

export const BarChart = ({ children, data }: any) => (
  <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
    {children}
  </div>
);

export const PieChart = ({ children }: any) => (
  <div data-testid="pie-chart">{children}</div>
);

export const Line = ({ dataKey, stroke, strokeWidth }: any) => (
  <div
    data-testid="line"
    data-key={dataKey}
    data-stroke={stroke}
    data-stroke-width={strokeWidth}
  />
);

export const Bar = ({ dataKey, fill, radius }: any) => (
  <div
    data-testid="bar"
    data-key={dataKey}
    data-fill={fill}
    data-radius={JSON.stringify(radius)}
  />
);

export const Pie = ({ children, data, dataKey }: any) => (
  <div
    data-testid="pie"
    data-key={dataKey}
    data-pie-data={JSON.stringify(data)}
  >
    {children}
  </div>
);

export const Cell = ({ fill }: any) => (
  <div data-testid="cell" data-fill={fill} />
);

export const XAxis = ({ dataKey }: any) => (
  <div data-testid="x-axis" data-key={dataKey} />
);

export const YAxis = () => <div data-testid="y-axis" />;

export const CartesianGrid = ({ strokeDasharray }: any) => (
  <div data-testid="cartesian-grid" data-stroke-dasharray={strokeDasharray} />
);

export const Tooltip = ({ contentStyle, formatter }: any) => (
  <div
    data-testid="tooltip"
    data-content-style={JSON.stringify(contentStyle)}
    data-has-formatter={!!formatter}
  />
);
