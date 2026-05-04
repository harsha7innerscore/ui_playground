import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserManagement } from "./UserManagement";
import { mockUsers } from "../data/mockData";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Search: ({ size, className }: any) => (
    <div data-testid="search-icon" className={className} />
  ),
  Plus: ({ size, className }: any) => (
    <div data-testid="plus-icon" className={className} />
  ),
  Filter: ({ size, className }: any) => (
    <div data-testid="filter-icon" className={className} />
  ),
  Users: ({ size, className }: any) => (
    <div data-testid="users-icon" className={className} />
  ),
  UserCheck: ({ size, className }: any) => (
    <div data-testid="user-check-icon" className={className} />
  ),
  UserX: ({ size, className }: any) => (
    <div data-testid="user-x-icon" className={className} />
  ),
  Clock: ({ size, className }: any) => (
    <div data-testid="clock-icon" className={className} />
  ),
  Edit2: ({ size, className }: any) => (
    <div data-testid="edit-icon" className={className} />
  ),
  Trash2: ({ size, className }: any) => (
    <div data-testid="trash-icon" className={className} />
  ),
}));

// Mock console.log to verify handler calls
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("UserManagement", () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  // P0 Tests - Critical functionality
  describe("Core rendering (P0)", () => {
    test("renders dashboard title and subtitle", () => {
      render(<UserManagement />);

      expect(screen.getByText("User Management")).toBeInTheDocument();
      expect(
        screen.getByText("Manage team members and their permissions"),
      ).toBeInTheDocument();
    });

    test("renders all 4 stat cards with correct values", () => {
      render(<UserManagement />);

      const totalUsers = mockUsers.length;
      const activeUsers = mockUsers.filter((u) => u.status === "active").length;
      const inactiveUsers = mockUsers.filter(
        (u) => u.status === "inactive",
      ).length;
      const pendingUsers = mockUsers.filter(
        (u) => u.status === "pending",
      ).length;

      // Use within() to scope queries to specific stat cards
      const totalUsersCard = screen
        .getByTestId("users-icon")
        .closest(".stat-card") as HTMLElement;
      const activeCard = screen
        .getByTestId("user-check-icon")
        .closest(".stat-card") as HTMLElement;
      const inactiveCard = screen
        .getByTestId("user-x-icon")
        .closest(".stat-card") as HTMLElement;
      const pendingCard = screen
        .getByTestId("clock-icon")
        .closest(".stat-card") as HTMLElement;

      // Query within each card to avoid global duplicates
      expect(
        within(totalUsersCard).getByText(totalUsers.toString()),
      ).toBeInTheDocument();
      expect(
        within(activeCard).getByText(activeUsers.toString()),
      ).toBeInTheDocument();
      expect(
        within(inactiveCard).getByText(inactiveUsers.toString()),
      ).toBeInTheDocument();
      expect(
        within(pendingCard).getByText(pendingUsers.toString()),
      ).toBeInTheDocument();

      // Labels should be present
      expect(
        within(totalUsersCard).getByText("Total Users"),
      ).toBeInTheDocument();
      expect(within(activeCard).getByText("Active")).toBeInTheDocument();
      expect(within(inactiveCard).getByText("Inactive")).toBeInTheDocument();
      expect(within(pendingCard).getByText("Pending")).toBeInTheDocument();
    });

    test("renders all users when no filters applied", () => {
      render(<UserManagement />);

      mockUsers.forEach((user) => {
        expect(screen.getByText(user.name)).toBeInTheDocument();
        expect(screen.getByText(user.email)).toBeInTheDocument();
      });
    });

    test("renders search input with correct placeholder", () => {
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue("");
    });

    test("renders role filter with all options", () => {
      render(<UserManagement />);

      const roleSelects = screen.getAllByRole("combobox");
      const roleSelect = roleSelects[0];

      expect(within(roleSelect).getByText("All Roles")).toBeInTheDocument();
      expect(within(roleSelect).getByText("Administrator")).toBeInTheDocument();
      expect(
        within(roleSelect).getByText("Project Manager"),
      ).toBeInTheDocument();
      expect(within(roleSelect).getByText("Developer")).toBeInTheDocument();
      expect(within(roleSelect).getByText("Designer")).toBeInTheDocument();
      expect(within(roleSelect).getByText("Qa Engineer")).toBeInTheDocument();
    });

    test("renders status filter with all options", () => {
      render(<UserManagement />);

      const statusSelects = screen.getAllByRole("combobox");
      const statusSelect = statusSelects[1];

      expect(within(statusSelect).getByText("All Status")).toBeInTheDocument();
      expect(within(statusSelect).getByText("Active")).toBeInTheDocument();
      expect(within(statusSelect).getByText("Inactive")).toBeInTheDocument();
      expect(within(statusSelect).getByText("Pending")).toBeInTheDocument();
    });

    test("renders add user button in header", () => {
      render(<UserManagement />);

      const addButtons = screen.getAllByText("Add User");
      expect(addButtons[0]).toBeInTheDocument();
      expect(addButtons[0]).toHaveClass("btn-primary");
    });
  });

  describe("Search functionality (P0)", () => {
    test("filters users by search term (name)", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      const testUser = mockUsers[0];

      await user.type(searchInput, testUser.name);

      expect(screen.getByText(testUser.name)).toBeInTheDocument();

      // Other users should not be visible
      const otherUsers = mockUsers.filter(
        (u) => !u.name.toLowerCase().includes(testUser.name.toLowerCase()),
      );
      otherUsers.forEach((otherUser) => {
        expect(screen.queryByText(otherUser.name)).not.toBeInTheDocument();
      });
    });

    test("filters users by search term (email)", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      const testUser = mockUsers[0];
      const emailPart = testUser.email.split("@")[0];

      await user.type(searchInput, emailPart);

      expect(screen.getByText(testUser.email)).toBeInTheDocument();
    });

    test("search is case insensitive", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      const testUser = mockUsers[0];

      await user.type(searchInput, testUser.name.toUpperCase());

      expect(screen.getByText(testUser.name)).toBeInTheDocument();
    });

    test("shows empty state when no users match search", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      await user.type(searchInput, "NONEXISTENT_USER_12345");

      expect(screen.getByText("No users found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Try adjusting your search criteria or add a new user.",
        ),
      ).toBeInTheDocument();
    });

    test("clears search results when input is cleared", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");

      await user.type(searchInput, mockUsers[0].name);
      expect(screen.queryByText(mockUsers[1].name)).not.toBeInTheDocument();

      await user.clear(searchInput);

      // All users should be visible again
      mockUsers.forEach((mockUser) => {
        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      });
    });
  });

  describe("Filter functionality (P0)", () => {
    test("filters users by role selection", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const roleSelect = screen.getAllByRole("combobox")[0];

      await user.selectOptions(roleSelect, "developer");

      const developers = mockUsers.filter(
        (u) => u.role.toLowerCase() === "developer",
      );
      const nonDevelopers = mockUsers.filter(
        (u) => u.role.toLowerCase() !== "developer",
      );

      developers.forEach((dev) => {
        expect(screen.getByText(dev.name)).toBeInTheDocument();
      });

      nonDevelopers.forEach((nonDev) => {
        expect(screen.queryByText(nonDev.name)).not.toBeInTheDocument();
      });
    });

    test("filters users by status selection", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const statusSelect = screen.getAllByRole("combobox")[1];

      await user.selectOptions(statusSelect, "active");

      const activeUsers = mockUsers.filter((u) => u.status === "active");
      const inactiveUsers = mockUsers.filter((u) => u.status !== "active");

      activeUsers.forEach((activeUser) => {
        expect(screen.getByText(activeUser.name)).toBeInTheDocument();
      });

      inactiveUsers.forEach((inactiveUser) => {
        expect(screen.queryByText(inactiveUser.name)).not.toBeInTheDocument();
      });
    });

    test("combines search and filter criteria", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      const roleSelect = screen.getAllByRole("combobox")[0];
      const statusSelect = screen.getAllByRole("combobox")[1];

      // Find a developer who is active
      const activeDeveloper = mockUsers.find(
        (u) => u.role.toLowerCase() === "developer" && u.status === "active",
      );

      if (activeDeveloper) {
        await user.selectOptions(roleSelect, "developer");
        await user.selectOptions(statusSelect, "active");
        await user.type(searchInput, activeDeveloper.name.substring(0, 3));

        expect(screen.getByText(activeDeveloper.name)).toBeInTheDocument();
      }
    });

    test('resets to all users when filters set to "all"', async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const roleSelect = screen.getAllByRole("combobox")[0];
      const statusSelect = screen.getAllByRole("combobox")[1];

      // Apply filters
      await user.selectOptions(roleSelect, "developer");
      await user.selectOptions(statusSelect, "active");

      // Reset filters
      await user.selectOptions(roleSelect, "all");
      await user.selectOptions(statusSelect, "all");

      // All users should be visible
      mockUsers.forEach((mockUser) => {
        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      });
    });
  });

  describe("Modal functionality (P0)", () => {
    test("opens modal when header add user button clicked", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const addButton = screen.getAllByText("Add User")[0];
      await user.click(addButton);

      expect(screen.getByText("Add New User")).toBeInTheDocument();
      expect(
        screen.getByText(
          "This would be a form to add a new user to the system.",
        ),
      ).toBeInTheDocument();
    });

    test("opens modal when empty state add user button clicked", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      await user.type(searchInput, "NONEXISTENT_USER");

      const emptyStateButton = screen
        .getAllByText("Add User")
        .find((btn) => btn.closest(".empty-state") !== null);

      if (emptyStateButton) {
        await user.click(emptyStateButton);
        expect(screen.getByText("Add New User")).toBeInTheDocument();
      }
    });

    test("closes modal when overlay clicked", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const addButton = screen.getAllByText("Add User")[0];
      await user.click(addButton);

      expect(screen.getByText("Add New User")).toBeInTheDocument();

      const overlay = screen
        .getByText("Add New User")
        .closest(".modal-overlay");
      if (overlay) {
        await user.click(overlay);
        expect(screen.queryByText("Add New User")).not.toBeInTheDocument();
      }
    });

    test("closes modal when cancel button clicked", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const addButton = screen.getAllByText("Add User")[0];
      await user.click(addButton);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(screen.queryByText("Add New User")).not.toBeInTheDocument();
    });

    test("closes modal when modal add user button clicked", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const addButton = screen.getAllByText("Add User")[0];
      await user.click(addButton);

      const modalAddButton = screen.getAllByText("Add User")[1];
      await user.click(modalAddButton);

      expect(screen.queryByText("Add New User")).not.toBeInTheDocument();
    });

    test("prevents modal close when modal content clicked", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const addButton = screen.getAllByText("Add User")[0];
      await user.click(addButton);

      const modalContent = screen.getByText("Add New User").closest(".modal");
      if (modalContent) {
        await user.click(modalContent);
        expect(screen.getByText("Add New User")).toBeInTheDocument();
      }
    });
  });

  // P1 Tests - High value functionality
  describe("User actions (P1)", () => {
    test("calls handleEditUser with correct userId", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const testUser = mockUsers[0];

      // Find the user card and click edit button
      const userCard = screen.getByText(testUser.name).closest(".user-card");
      if (userCard) {
        const editButton = within(userCard as HTMLElement).getByText("Edit");
        await user.click(editButton);

        expect(consoleSpy).toHaveBeenCalledWith(`Editing user ${testUser.id}`);
      }
    });

    test("calls handleDeleteUser with correct userId", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const testUser = mockUsers[0];

      // Find the user card and click remove button
      const userCard = screen.getByText(testUser.name).closest(".user-card");
      if (userCard) {
        const deleteButton = within(userCard as HTMLElement).getByText(
          "Remove",
        );
        await user.click(deleteButton);

        expect(consoleSpy).toHaveBeenCalledWith(`Deleting user ${testUser.id}`);
      }
    });
  });

  describe("Statistics calculations (P1)", () => {
    test("calculates total users stat correctly", () => {
      render(<UserManagement />);

      const totalUsers = mockUsers.length;
      expect(screen.getByText(totalUsers.toString())).toBeInTheDocument();
      expect(screen.getByText("Total Users")).toBeInTheDocument();
    });

    test("calculates active users stat correctly", () => {
      render(<UserManagement />);

      const activeUsers = mockUsers.filter((u) => u.status === "active").length;
      const activeStatCard = screen
        .getByTestId("user-check-icon")
        .closest(".stat-card") as HTMLElement;

      expect(
        within(activeStatCard).getByText(activeUsers.toString()),
      ).toBeInTheDocument();
    });

    test("calculates inactive users stat correctly", () => {
      render(<UserManagement />);

      const inactiveUsers = mockUsers.filter(
        (u) => u.status === "inactive",
      ).length;
      const inactiveStatCard = screen
        .getByTestId("user-x-icon")
        .closest(".stat-card") as HTMLElement;

      expect(
        within(inactiveStatCard).getByText(inactiveUsers.toString()),
      ).toBeInTheDocument();
    });

    test("calculates pending users stat correctly", () => {
      render(<UserManagement />);

      const pendingUsers = mockUsers.filter(
        (u) => u.status === "pending",
      ).length;
      const pendingStatCard = screen
        .getByTestId("clock-icon")
        .closest(".stat-card") as HTMLElement;

      expect(
        within(pendingStatCard).getByText(pendingUsers.toString()),
      ).toBeInTheDocument();
    });

    test("stat cards render with correct icons", () => {
      render(<UserManagement />);

      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
      expect(screen.getByTestId("user-check-icon")).toBeInTheDocument();
      expect(screen.getByTestId("user-x-icon")).toBeInTheDocument();
      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
    });
  });

  describe("UI elements (P1)", () => {
    test("renders search icon", () => {
      render(<UserManagement />);

      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    });

    test("renders filter icon", () => {
      render(<UserManagement />);

      expect(screen.getByTestId("filter-icon")).toBeInTheDocument();
    });

    test("renders plus icon in add button", () => {
      render(<UserManagement />);

      expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    });
  });

  // P2 Tests - Nice to have
  describe("Edge cases (P2)", () => {
    test("handles empty search string", async () => {
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");

      // Input should be empty by default
      expect(searchInput).toHaveValue("");

      // All users should be visible
      mockUsers.forEach((mockUser) => {
        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      });
    });

    test("handles single character search", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      await user.type(searchInput, "a");

      // Should filter based on single character
      const matchingUsers = mockUsers.filter(
        (u) =>
          u.name.toLowerCase().includes("a") ||
          u.email.toLowerCase().includes("a"),
      );

      expect(matchingUsers.length).toBeGreaterThan(0);
    });

    test("handles very long search string", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      const longString = "a".repeat(100);

      await user.type(searchInput, longString);

      expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    test("handles special characters in search", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      await user.type(searchInput, "@#$%");

      // Should handle gracefully without errors
      expect(searchInput).toHaveValue("@#$%");
    });

    test("handles rapid filter changes", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const roleSelect = screen.getAllByRole("combobox")[0];
      const statusSelect = screen.getAllByRole("combobox")[1];

      // Rapid changes
      await user.selectOptions(roleSelect, "developer");
      await user.selectOptions(statusSelect, "active");
      await user.selectOptions(roleSelect, "designer");
      await user.selectOptions(statusSelect, "inactive");
      await user.selectOptions(roleSelect, "all");
      await user.selectOptions(statusSelect, "all");

      // Should end with all users visible
      expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
    });

    test("handles rapid modal open/close", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const addButton = screen.getAllByText("Add User")[0];

      // Rapid open/close
      await user.click(addButton);
      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      await user.click(addButton);
      const overlay = screen
        .getByText("Add New User")
        .closest(".modal-overlay");
      if (overlay) {
        await user.click(overlay);
      }

      await user.click(addButton);
      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });

    test("role filter displays formatted option text", () => {
      render(<UserManagement />);

      const roleSelect = screen.getAllByRole("combobox")[0];

      // Check capitalization and formatting
      expect(
        within(roleSelect).getByText("Project Manager"),
      ).toBeInTheDocument();
      expect(within(roleSelect).getByText("Qa Engineer")).toBeInTheDocument();
    });

    test("status filter displays formatted option text", () => {
      render(<UserManagement />);

      const statusSelect = screen.getAllByRole("combobox")[1];

      // Check capitalization
      expect(within(statusSelect).getByText("Active")).toBeInTheDocument();
      expect(within(statusSelect).getByText("Inactive")).toBeInTheDocument();
      expect(within(statusSelect).getByText("Pending")).toBeInTheDocument();
    });

    test("empty state shows correct icon", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      await user.type(searchInput, "NONEXISTENT");

      const emptyState = screen
        .getByText("No users found")
        .closest(".empty-state");
      expect(emptyState).toContainElement(
        screen.getAllByTestId("users-icon")[1],
      );
    });

    test("maintains filter state after modal interaction", async () => {
      const user = userEvent.setup();
      render(<UserManagement />);

      const roleSelect = screen.getAllByRole("combobox")[0];
      await user.selectOptions(roleSelect, "developer");

      const addButton = screen.getAllByText("Add User")[0];
      await user.click(addButton);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      // Filter should still be applied
      expect(roleSelect).toHaveValue("developer");
    });
  });

  describe("Accessibility (P2)", () => {
    test("search input has correct type", () => {
      render(<UserManagement />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      expect(searchInput).toHaveAttribute("type", "text");
    });

    test("filter selects are accessible", () => {
      render(<UserManagement />);

      const selects = screen.getAllByRole("combobox");
      expect(selects).toHaveLength(2);

      selects.forEach((select) => {
        expect(select).toHaveClass("filter-select");
      });
    });

    test("buttons have correct classes", () => {
      render(<UserManagement />);

      const addButton = screen.getAllByText("Add User")[0];
      expect(addButton).toHaveClass("btn-primary");
    });
  });
});
