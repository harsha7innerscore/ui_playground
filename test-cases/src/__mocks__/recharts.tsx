export const ResponsiveContainer = ({ children }: any) => (
  <div data-testid="responsive-container">{children}</div>
);
export const LineChart = ({ children, data }: any) => (
  <div data-testid="line-chart" data-data={JSON.stringify(data)}>
    {children}
  </div>
);
export const BarChart = ({ children, data }: any) => (
  <div data-testid="bar-chart" data-data={JSON.stringify(data)}>
    {children}
  </div>
);
export const PieChart = ({ children }: any) => (
  <div data-testid="pie-chart">{children}</div>
);
export const XAxis = ({ dataKey }: any) => (
  <div data-testid="x-axis" data-key={dataKey} />
);
export const YAxis = () => <div data-testid="y-axis" />;
export const CartesianGrid = () => <div data-testid="cartesian-grid" />;
export const Tooltip = ({ formatter }: any) => (
  <div
    data-testid="tooltip"
    data-formatter={formatter ? "custom" : "default"}
  />
);
export const Line = ({ dataKey, stroke }: any) => (
  <div data-testid="line" data-key={dataKey} data-stroke={stroke} />
);
export const Bar = ({ dataKey, fill }: any) => (
  <div data-testid="bar" data-key={dataKey} data-fill={fill} />
);
export const Pie = ({ data, dataKey, label, children }: any) => (
  <div
    data-testid="pie"
    data-data={JSON.stringify(data)}
    data-key={dataKey}
    data-label={label ? "custom" : "none"}
  >
    {children}
  </div>
);
export const Cell = ({ fill }: any) => (
  <div data-testid="cell" data-fill={fill} />
);
