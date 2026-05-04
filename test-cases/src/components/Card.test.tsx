import { render, screen, fireEvent } from "@testing-library/react";
import { Card, MetricCard, UserCard, ProjectCard } from "./Card";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Users: ({ size, ...props }: any) => (
    <div data-testid="icon-users" data-size={size} {...props} />
  ),
  CheckCircle: ({ size, ...props }: any) => (
    <div data-testid="icon-check-circle" data-size={size} {...props} />
  ),
}));

describe("Card Component", () => {
  describe("Base Card (P1)", () => {
    test("renders children correctly", () => {
      render(
        <Card>
          <div>Test Content</div>
        </Card>,
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    test("applies hover class when hover prop is true", () => {
      const { container } = render(
        <Card hover={true}>
          <div>Content</div>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("card-hover");
    });

    test("does not apply hover class when hover prop is false", () => {
      const { container } = render(
        <Card hover={false}>
          <div>Content</div>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass("card-hover");
    });

    test("applies clickable class when onClick provided", () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <Card onClick={mockOnClick}>
          <div>Content</div>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("card-clickable");
    });

    test("triggers onClick when clicked", () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <Card onClick={mockOnClick}>
          <div>Content</div>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test("applies custom className", () => {
      const { container } = render(
        <Card className="custom-class">
          <div>Content</div>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("MetricCard Component (P1)", () => {
    const mockMetric = {
      title: "Total Users",
      value: "2,847",
      change: {
        value: "+12.5%",
        type: "increase" as const,
      },
      iconColor: "#3b82f6",
    };

    test("renders title and value correctly", () => {
      render(<MetricCard title={mockMetric.title} value={mockMetric.value} />);

      expect(screen.getByText("Total Users")).toBeInTheDocument();
      expect(screen.getByText("2,847")).toBeInTheDocument();
    });

    test("renders icon with correct color when provided", () => {
      // Import the actual icon for testing
      const MockIcon = () => <div data-testid="icon-users" />;

      render(
        <MetricCard
          title={mockMetric.title}
          value={mockMetric.value}
          icon={MockIcon as any}
          iconColor={mockMetric.iconColor}
        />,
      );

      const icon = screen.getByTestId("icon-users");
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveStyle({ color: "#3b82f6" });
    });

    test("does not render icon when not provided", () => {
      render(<MetricCard title={mockMetric.title} value={mockMetric.value} />);

      expect(screen.queryByTestId("icon-users")).not.toBeInTheDocument();
    });

    test("renders change indicator with correct styling", () => {
      render(
        <MetricCard
          title={mockMetric.title}
          value={mockMetric.value}
          change={mockMetric.change}
        />,
      );

      const changeElement = screen.getByText("+12.5%");
      expect(changeElement).toBeInTheDocument();
      expect(changeElement).toHaveClass("metric-change-increase");
    });

    test("does not render change indicator when not provided", () => {
      render(<MetricCard title={mockMetric.title} value={mockMetric.value} />);

      expect(screen.queryByText("+12.5%")).not.toBeInTheDocument();
    });

    test("triggers onClick when clicked", () => {
      const mockOnClick = jest.fn();

      render(
        <MetricCard
          title={mockMetric.title}
          value={mockMetric.value}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByText("Total Users").closest(".card");
      if (card) {
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      }
    });

    test("shows increase styling for positive changes", () => {
      render(
        <MetricCard
          title="Revenue"
          value="$94,567"
          change={{ value: "+8.2%", type: "increase" }}
        />,
      );

      const changeElement = screen.getByText("+8.2%");
      expect(changeElement).toHaveClass("metric-change-increase");
    });

    test("shows decrease styling for negative changes", () => {
      render(
        <MetricCard
          title="Tasks"
          value="1,264"
          change={{ value: "-2.1%", type: "decrease" }}
        />,
      );

      const changeElement = screen.getByText("-2.1%");
      expect(changeElement).toHaveClass("metric-change-decrease");
    });

    test("shows neutral styling for neutral changes", () => {
      render(
        <MetricCard
          title="Projects"
          value="24"
          change={{ value: "0%", type: "neutral" }}
        />,
      );

      const changeElement = screen.getByText("0%");
      expect(changeElement).toHaveClass("metric-change-neutral");
    });

    test("handles numeric values", () => {
      render(<MetricCard title="Count" value={1234} />);

      expect(screen.getByText("1234")).toBeInTheDocument();
    });
  });

  describe("UserCard Component", () => {
    const mockUser = {
      id: "1",
      name: "Alex Chen",
      email: "alex.chen@company.com",
      role: "Administrator",
      status: "active" as const,
    };

    test("renders user information correctly", () => {
      render(<UserCard user={mockUser} />);

      expect(screen.getByText("Alex Chen")).toBeInTheDocument();
      expect(screen.getByText("alex.chen@company.com")).toBeInTheDocument();
      expect(screen.getByText("Administrator")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
    });

    test("renders avatar placeholder when no avatar provided", () => {
      render(<UserCard user={mockUser} />);

      const placeholder = screen.getByText("AC");
      expect(placeholder).toBeInTheDocument();
    });

    test("renders avatar image when avatar provided", () => {
      const userWithAvatar = {
        ...mockUser,
        avatar: "https://example.com/avatar.jpg",
      };

      render(<UserCard user={userWithAvatar} />);

      const img = screen.getByRole("img", { name: "Alex Chen" });
      expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    test("renders edit button when onEdit provided", () => {
      const mockOnEdit = jest.fn();
      render(<UserCard user={mockUser} onEdit={mockOnEdit} />);

      const editButton = screen.getByText("Edit");
      expect(editButton).toBeInTheDocument();

      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith("1");
    });

    test("renders delete button when onDelete provided", () => {
      const mockOnDelete = jest.fn();
      render(<UserCard user={mockUser} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByText("Remove");
      expect(deleteButton).toBeInTheDocument();

      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith("1");
    });

    test("applies correct status styling", () => {
      const { rerender } = render(
        <UserCard user={{ ...mockUser, status: "active" }} />,
      );
      expect(screen.getByText("active")).toHaveClass("user-status-active");

      rerender(<UserCard user={{ ...mockUser, status: "inactive" }} />);
      expect(screen.getByText("inactive")).toHaveClass("user-status-inactive");

      rerender(<UserCard user={{ ...mockUser, status: "pending" }} />);
      expect(screen.getByText("pending")).toHaveClass("user-status-pending");
    });
  });

  describe("ProjectCard Component", () => {
    const mockProject = {
      id: "1",
      name: "E-commerce Platform",
      description: "Building a modern e-commerce platform",
      progress: 85,
      status: "active" as const,
      team: [
        { name: "Alex Chen" },
        { name: "Sarah Williams" },
        { name: "Michael Rodriguez" },
        { name: "Emily Johnson" },
      ],
      dueDate: "2024-05-15T00:00:00Z",
    };

    test("renders project information correctly", () => {
      render(<ProjectCard project={mockProject} />);

      expect(screen.getByText("E-commerce Platform")).toBeInTheDocument();
      expect(
        screen.getByText("Building a modern e-commerce platform"),
      ).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
    });

    test("renders due date when provided", () => {
      render(<ProjectCard project={mockProject} />);

      const dueDate = new Date(mockProject.dueDate!).toLocaleDateString();
      expect(screen.getByText(`Due: ${dueDate}`)).toBeInTheDocument();
    });

    test("does not render due date when not provided", () => {
      const { dueDate, ...projectWithoutDue } = mockProject;

      render(<ProjectCard project={projectWithoutDue} />);

      expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
    });

    test("renders team avatars correctly", () => {
      render(<ProjectCard project={mockProject} />);

      // Should show first 3 team members as placeholders
      expect(screen.getByText("AC")).toBeInTheDocument(); // Alex Chen
      expect(screen.getByText("SW")).toBeInTheDocument(); // Sarah Williams
      expect(screen.getByText("MR")).toBeInTheDocument(); // Michael Rodriguez

      // Should show +1 for remaining member
      expect(screen.getByText("+1")).toBeInTheDocument();
    });

    test("triggers onClick when clicked", () => {
      const mockOnClick = jest.fn();
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);

      const card = screen.getByText("E-commerce Platform").closest(".card");
      if (card) {
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledWith("1");
      }
    });

    test("applies correct status colors", () => {
      const { rerender } = render(
        <ProjectCard project={{ ...mockProject, status: "active" }} />,
      );
      let statusElement = screen.getByText("active");
      expect(statusElement).toHaveStyle({ backgroundColor: "#10b981" });

      rerender(
        <ProjectCard project={{ ...mockProject, status: "completed" }} />,
      );
      statusElement = screen.getByText("completed");
      expect(statusElement).toHaveStyle({ backgroundColor: "#3b82f6" });

      rerender(<ProjectCard project={{ ...mockProject, status: "on-hold" }} />);
      statusElement = screen.getByText("on hold");
      expect(statusElement).toHaveStyle({ backgroundColor: "#f59e0b" });

      rerender(
        <ProjectCard project={{ ...mockProject, status: "planning" }} />,
      );
      statusElement = screen.getByText("planning");
      expect(statusElement).toHaveStyle({ backgroundColor: "#8b5cf6" });
    });

    test("renders progress bar with correct width", () => {
      render(<ProjectCard project={mockProject} />);

      const progressFill = document.querySelector(
        ".progress-fill",
      ) as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "85%" });
    });

    test("handles team with avatars", () => {
      const projectWithAvatars = {
        ...mockProject,
        team: [
          { name: "Alex Chen", avatar: "https://example.com/alex.jpg" },
          { name: "Sarah Williams", avatar: "https://example.com/sarah.jpg" },
        ],
      };

      render(<ProjectCard project={projectWithAvatars} />);

      const avatars = screen.getAllByRole("img");
      expect(avatars).toHaveLength(2);
      expect(avatars[0]).toHaveAttribute("src", "https://example.com/alex.jpg");
      expect(avatars[1]).toHaveAttribute(
        "src",
        "https://example.com/sarah.jpg",
      );
    });
  });
});
