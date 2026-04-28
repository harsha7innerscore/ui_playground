import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { mockMetrics, chartData, mockActivity } from "../data/mockData";

// Mock the recharts and lucide-react modules
jest.mock("recharts");
jest.mock("lucide-react");

describe("AnalyticsDashboard", () => {
  beforeEach(() => {
    // Clear console mocks before each test
    jest.clearAllMocks();
  });

  describe("Header and Title", () => {
    it('renders dashboard title "Analytics Dashboard"', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    });

    it("renders dashboard subtitle", () => {
      render(<AnalyticsDashboard />);
      expect(
        screen.getByText("Monitor your business performance and key metrics"),
      ).toBeInTheDocument();
    });
  });

  describe("Time Range Selector", () => {
    it("renders 4 time range selector buttons", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("7 Days")).toBeInTheDocument();
      expect(screen.getByText("30 Days")).toBeInTheDocument();
      expect(screen.getByText("90 Days")).toBeInTheDocument();
      expect(screen.getByText("1 Year")).toBeInTheDocument();
    });

    it('marks "30 Days" button as active by default', () => {
      render(<AnalyticsDashboard />);
      const thirtyDaysButton = screen.getByText("30 Days");
      expect(thirtyDaysButton).toHaveClass("active");
    });

    it("updates active button when time range clicked", async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard />);

      const sevenDaysButton = screen.getByText("7 Days");
      const thirtyDaysButton = screen.getByText("30 Days");

      // Initially 30 Days is active
      expect(thirtyDaysButton).toHaveClass("active");
      expect(sevenDaysButton).not.toHaveClass("active");

      // Click 7 Days button
      await user.click(sevenDaysButton);

      // Now 7 Days should be active
      expect(sevenDaysButton).toHaveClass("active");
      expect(thirtyDaysButton).not.toHaveClass("active");
    });

    it("time range state updates for all options (7d, 30d, 90d, 1y)", async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard />);

      const buttons = {
        "7 Days": "7d",
        "30 Days": "30d",
        "90 Days": "90d",
        "1 Year": "1y",
      };

      for (const [label, _value] of Object.entries(buttons)) {
        const button = screen.getByText(label);
        await user.click(button);
        expect(button).toHaveClass("active");
      }
    });
  });

  describe("Metric Cards", () => {
    it("renders 4 MetricCard components", () => {
      const { container } = render(<AnalyticsDashboard />);
      const metricCards = container.querySelectorAll(".metric-card");
      expect(metricCards).toHaveLength(4);
    });

    it('renders "Total Users" metric with value "2,847"', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("Total Users")).toBeInTheDocument();
      expect(screen.getByText("2,847")).toBeInTheDocument();
    });

    it('renders "Active Projects" metric with value "24"', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("Active Projects")).toBeInTheDocument();
      expect(screen.getByText("24")).toBeInTheDocument();
    });

    it('renders "Revenue" metric with value "$94,567"', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("$94,567")).toBeInTheDocument();
    });

    it('renders "Tasks Completed" metric with value "1,264"', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("Tasks Completed")).toBeInTheDocument();
      expect(screen.getByText("1,264")).toBeInTheDocument();
    });

    it("passes correct metric data to MetricCards", () => {
      render(<AnalyticsDashboard />);

      // Verify all metrics from mockData are rendered
      mockMetrics.forEach((metric) => {
        expect(screen.getByText(metric.title)).toBeInTheDocument();
        expect(screen.getByText(metric.value.toString())).toBeInTheDocument();
      });
    });

    it("passes correct icon to each MetricCard via iconMap", () => {
      render(<AnalyticsDashboard />);

      // Icons are mocked, so we check for the mock icon test IDs
      // Note: Some icons appear multiple times (in both metrics and charts)
      expect(screen.getByTestId("icon-users")).toBeInTheDocument();
      expect(
        screen.getAllByTestId("icon-folder-kanban").length,
      ).toBeGreaterThan(0);
      expect(screen.getAllByTestId("icon-dollar-sign").length).toBeGreaterThan(
        0,
      );
      expect(screen.getByTestId("icon-check-circle")).toBeInTheDocument();
    });

    it("renders increase change indicator for Total Users", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("+12.5%")).toBeInTheDocument();
    });

    it("renders decrease change indicator for Tasks Completed", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("-2.1%")).toBeInTheDocument();
    });

    it("calls handleMetricClick with correct title when metric clicked", async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, "log");

      render(<AnalyticsDashboard />);

      const totalUsersMetric = screen.getByText("Total Users");
      await user.click(totalUsersMetric);

      expect(consoleSpy).toHaveBeenCalledWith("Clicked on Total Users metric");
    });
  });

  describe("Charts Section", () => {
    it("renders User Growth chart with LineChart component", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("renders Monthly Revenue chart with BarChart component", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("renders Project Status chart with PieChart component", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    });

    it("passes correct data to User Growth LineChart", () => {
      render(<AnalyticsDashboard />);
      const lineChart = screen.getByTestId("line-chart");
      const chartData = lineChart.getAttribute("data-chart-data");
      expect(chartData).toBeTruthy();

      if (chartData) {
        const parsedData = JSON.parse(chartData);
        expect(parsedData).toHaveLength(6); // 6 months of data
        expect(parsedData[0]).toHaveProperty("month");
        expect(parsedData[0]).toHaveProperty("users");
      }
    });

    it("passes correct data to Monthly Revenue BarChart", () => {
      render(<AnalyticsDashboard />);
      const barChart = screen.getByTestId("bar-chart");
      const chartData = barChart.getAttribute("data-chart-data");
      expect(chartData).toBeTruthy();

      if (chartData) {
        const parsedData = JSON.parse(chartData);
        expect(parsedData).toHaveLength(6); // 6 months of data
        expect(parsedData[0]).toHaveProperty("month");
        expect(parsedData[0]).toHaveProperty("revenue");
      }
    });

    it("passes correct data to Project Status PieChart", () => {
      render(<AnalyticsDashboard />);
      const pie = screen.getByTestId("pie");
      const pieData = pie.getAttribute("data-pie-data");
      expect(pieData).toBeTruthy();

      if (pieData) {
        const parsedData = JSON.parse(pieData);
        expect(parsedData).toHaveLength(4); // 4 project statuses
        expect(parsedData[0]).toHaveProperty("name");
        expect(parsedData[0]).toHaveProperty("value");
        expect(parsedData[0]).toHaveProperty("color");
      }
    });

    it("renders chart titles correctly", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText("User Growth")).toBeInTheDocument();
      expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
      expect(screen.getByText("Project Status")).toBeInTheDocument();
      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    });

    it("renders chart icons (TrendingUp, DollarSign, etc)", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId("icon-trending-up")).toBeInTheDocument();
      // DollarSign and FolderKanban appear in both metrics and charts, so use getAllBy
      expect(screen.getAllByTestId("icon-dollar-sign").length).toBeGreaterThan(
        0,
      );
      expect(
        screen.getAllByTestId("icon-folder-kanban").length,
      ).toBeGreaterThan(0);
      expect(screen.getByTestId("icon-activity")).toBeInTheDocument();
    });

    it("PieChart cells have correct colors from chartData", () => {
      render(<AnalyticsDashboard />);
      const cells = screen.getAllByTestId("cell");

      // Verify we have cells rendered
      expect(cells.length).toBeGreaterThan(0);

      // Check that cells have fill colors matching chartData
      const expectedColors = chartData.projectStatus.map(
        (status) => status.color,
      );
      cells.forEach((cell) => {
        const fill = cell.getAttribute("data-fill");
        expect(expectedColors).toContain(fill);
      });
    });
  });

  describe("Recent Activity", () => {
    it("renders 5 activity items from mockActivity", () => {
      const { container } = render(<AnalyticsDashboard />);
      const activityItems = container.querySelectorAll(".activity-item");
      expect(activityItems).toHaveLength(5);
    });

    it("displays activity title and description correctly", () => {
      render(<AnalyticsDashboard />);

      // Check first activity item from mockActivity
      const firstActivity = mockActivity[0];
      expect(screen.getByText(firstActivity.title)).toBeInTheDocument();
      expect(screen.getByText(firstActivity.description)).toBeInTheDocument();
    });

    it("formats activity timestamp as date and time", () => {
      render(<AnalyticsDashboard />);
      const { container } = render(<AnalyticsDashboard />);
      const timestamps = container.querySelectorAll(".activity-time");

      // Should have 5 timestamps
      expect(timestamps).toHaveLength(5);

      // Each timestamp should contain formatted date and time
      timestamps.forEach((timestamp) => {
        const text = timestamp.textContent || "";
        expect(text).toMatch(/at/);
        // Should have date and time parts
        expect(text.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Responsive Container", () => {
    it("renders charts within ResponsiveContainer components", () => {
      render(<AnalyticsDashboard />);
      const responsiveContainers = screen.getAllByTestId(
        "responsive-container",
      );

      // Should have 3 chart containers (LineChart, BarChart, PieChart)
      expect(responsiveContainers).toHaveLength(3);
    });
  });

  describe("CSS Classes and Layout", () => {
    it("applies correct CSS classes to dashboard elements", () => {
      const { container } = render(<AnalyticsDashboard />);

      expect(container.querySelector(".dashboard")).toBeInTheDocument();
      expect(container.querySelector(".dashboard-header")).toBeInTheDocument();
      expect(container.querySelector(".dashboard-title")).toBeInTheDocument();
      expect(
        container.querySelector(".dashboard-subtitle"),
      ).toBeInTheDocument();
      expect(container.querySelector(".metrics-grid")).toBeInTheDocument();
      expect(container.querySelector(".charts-grid")).toBeInTheDocument();
      expect(
        container.querySelector(".time-range-selector"),
      ).toBeInTheDocument();
    });

    it("renders chart containers with correct classes", () => {
      const { container } = render(<AnalyticsDashboard />);
      const chartCards = container.querySelectorAll(".chart-card");

      // Should have 4 chart cards (User Growth, Revenue, Project Status, Activity)
      expect(chartCards.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Edge Cases", () => {
    it("handles multiple rapid clicks on time range buttons", async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard />);

      const buttons = ["7 Days", "30 Days", "90 Days", "1 Year"];

      // Rapidly click all buttons
      for (const label of buttons) {
        await user.click(screen.getByText(label));
      }

      // Last clicked should be active
      expect(screen.getByText("1 Year")).toHaveClass("active");
    });

    it("clicking already selected time range keeps it active", async () => {
      const user = userEvent.setup();
      render(<AnalyticsDashboard />);

      const thirtyDaysButton = screen.getByText("30 Days");

      // Click the already active button
      await user.click(thirtyDaysButton);

      // Should remain active
      expect(thirtyDaysButton).toHaveClass("active");
    });
  });

  describe("Chart Components", () => {
    it("renders all chart child components for LineChart", () => {
      render(<AnalyticsDashboard />);

      // All LineChart children should be rendered
      // CartesianGrid appears in multiple charts, so use getAllBy
      expect(screen.getAllByTestId("cartesian-grid").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("x-axis").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("y-axis").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("tooltip").length).toBeGreaterThan(0);
      expect(screen.getByTestId("line")).toBeInTheDocument();
    });

    it("renders all chart child components for BarChart", () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId("bar")).toBeInTheDocument();
    });

    it("LineChart has correct dataKey for Line component", () => {
      render(<AnalyticsDashboard />);
      const line = screen.getByTestId("line");
      expect(line.getAttribute("data-key")).toBe("users");
    });

    it("BarChart has correct dataKey for Bar component", () => {
      render(<AnalyticsDashboard />);
      const bar = screen.getByTestId("bar");
      expect(bar.getAttribute("data-key")).toBe("revenue");
    });
  });

  describe("Integration with mockData", () => {
    it("renders data from imported mockMetrics", () => {
      render(<AnalyticsDashboard />);

      // All mockMetrics should be rendered
      expect(mockMetrics).toHaveLength(4);
      mockMetrics.forEach((metric) => {
        expect(screen.getByText(metric.title)).toBeInTheDocument();
      });
    });

    it("renders data from imported chartData", () => {
      render(<AnalyticsDashboard />);

      // Verify chart data is used
      const lineChart = screen.getByTestId("line-chart");
      const lineChartData = lineChart.getAttribute("data-chart-data");

      if (lineChartData) {
        const parsedData = JSON.parse(lineChartData);
        expect(parsedData).toEqual(chartData.userGrowth);
      }
    });

    it("renders data from imported mockActivity", () => {
      render(<AnalyticsDashboard />);

      // First 5 activity items should be rendered
      const displayedActivities = mockActivity.slice(0, 5);
      displayedActivities.forEach((activity) => {
        expect(screen.getByText(activity.title)).toBeInTheDocument();
      });
    });
  });

  describe("Snapshot tests", () => {
    it("matches snapshot for complete dashboard", () => {
      const { container } = render(<AnalyticsDashboard />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
