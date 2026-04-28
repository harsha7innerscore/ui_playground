import React from "react";

const createMockIcon = (name: string) => {
  return ({ size, ...props }: any) => (
    <div data-testid={`icon-${name}`} data-size={size} {...props}>
      {name}
    </div>
  );
};

export const Users = createMockIcon("users");
export const FolderKanban = createMockIcon("folder-kanban");
export const DollarSign = createMockIcon("dollar-sign");
export const CheckCircle = createMockIcon("check-circle");
export const TrendingUp = createMockIcon("trending-up");
export const Activity = createMockIcon("activity");
export const BarChart3 = createMockIcon("bar-chart-3");
export const Settings = createMockIcon("settings");
export const Moon = createMockIcon("moon");
export const Sun = createMockIcon("sun");
