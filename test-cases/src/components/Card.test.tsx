import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card, MetricCard } from "./Card";
import { Users } from "lucide-react";

jest.mock("lucide-react");

describe("Card", () => {
  describe("Basic rendering", () => {
    it("renders children correctly", () => {
      render(<Card>Test content</Card>);
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>,
      );
      const card = container.querySelector(".custom-class");
      expect(card).toBeInTheDocument();
    });

    it("applies card-hover class by default", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector(".card-hover");
      expect(card).toBeInTheDocument();
    });

    it("does not apply card-hover when hover={false}", () => {
      const { container } = render(<Card hover={false}>Content</Card>);
      const card = container.querySelector(".card-hover");
      expect(card).not.toBeInTheDocument();
    });
  });

  describe("Click handling", () => {
    it("applies card-clickable class when onClick provided", () => {
      const { container } = render(<Card onClick={() => {}}>Content</Card>);
      const card = container.querySelector(".card-clickable");
      expect(card).toBeInTheDocument();
    });

    it("calls onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Click me</Card>);

      await user.click(screen.getByText("Click me"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when not provided", async () => {
      const user = userEvent.setup();
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector(".card");

      // Should not throw error when clicking without onClick
      if (card) {
        await user.click(card);
      }
      // No assertion needed - just ensure no error is thrown
    });
  });
});

describe("MetricCard", () => {
  const defaultProps = {
    title: "Test Metric",
    value: "1,234",
  };

  describe("Basic rendering", () => {
    it("renders title prop", () => {
      render(<MetricCard {...defaultProps} />);
      expect(screen.getByText("Test Metric")).toBeInTheDocument();
    });

    it("renders value prop as string", () => {
      render(<MetricCard {...defaultProps} value="1,234" />);
      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("renders value prop as number", () => {
      render(<MetricCard {...defaultProps} value={1234} />);
      expect(screen.getByText("1234")).toBeInTheDocument();
    });
  });

  describe("Change indicator", () => {
    it("renders change indicator when change prop provided", () => {
      const change = { value: "+12.5%", type: "increase" as const };
      render(<MetricCard {...defaultProps} change={change} />);
      expect(screen.getByText("+12.5%")).toBeInTheDocument();
    });

    it("applies metric-change-increase class for increase type", () => {
      const change = { value: "+12.5%", type: "increase" as const };
      const { container } = render(
        <MetricCard {...defaultProps} change={change} />,
      );
      const changeElement = container.querySelector(".metric-change-increase");
      expect(changeElement).toBeInTheDocument();
    });

    it("applies metric-change-decrease class for decrease type", () => {
      const change = { value: "-2.1%", type: "decrease" as const };
      const { container } = render(
        <MetricCard {...defaultProps} change={change} />,
      );
      const changeElement = container.querySelector(".metric-change-decrease");
      expect(changeElement).toBeInTheDocument();
    });

    it("applies metric-change-neutral class for neutral type", () => {
      const change = { value: "0%", type: "neutral" as const };
      const { container } = render(
        <MetricCard {...defaultProps} change={change} />,
      );
      const changeElement = container.querySelector(".metric-change-neutral");
      expect(changeElement).toBeInTheDocument();
    });

    it("does not render change when change prop omitted", () => {
      const { container } = render(<MetricCard {...defaultProps} />);
      const changeElement = container.querySelector(".metric-change");
      expect(changeElement).not.toBeInTheDocument();
    });
  });

  describe("Icon rendering", () => {
    it("renders icon when icon prop provided", () => {
      render(<MetricCard {...defaultProps} icon={Users} />);
      expect(screen.getByTestId("icon-users")).toBeInTheDocument();
    });

    it("applies iconColor style to icon container", () => {
      const { container } = render(
        <MetricCard {...defaultProps} icon={Users} iconColor="#3b82f6" />,
      );
      const iconContainer = container.querySelector(".metric-icon");
      expect(iconContainer).toHaveStyle({ color: "#3b82f6" });
    });

    it("does not render icon when icon prop omitted", () => {
      render(<MetricCard {...defaultProps} />);
      expect(screen.queryByTestId("icon-users")).not.toBeInTheDocument();
    });
  });

  describe("Click handling", () => {
    it("calls onClick when card clicked", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<MetricCard {...defaultProps} onClick={handleClick} />);

      await user.click(screen.getByText("Test Metric"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Snapshot tests", () => {
    it("matches snapshot with all props", () => {
      const change = { value: "+12.5%", type: "increase" as const };
      const { container } = render(
        <MetricCard
          title="Total Users"
          value="2,847"
          change={change}
          icon={Users}
          iconColor="#3b82f6"
          onClick={() => {}}
        />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("matches snapshot with minimal props", () => {
      const { container } = render(
        <MetricCard title="Simple Metric" value="100" />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
