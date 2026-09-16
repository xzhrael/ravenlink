export type UserRole = "USER" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface AdminPlatformStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  superAdminCount: number;
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  avgClicksPerUser: number;
  avgLinksPerUser: number;
  topPerformingUsers: Array<{
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    linkCount: number;
    totalClicks: number;
    status: string;
    role: string;
  }>;
  recentActivity: Array<{
    type: "USER_REGISTERED" | "LINK_CREATED" | "USER_DELETED_BY_ADMIN" | "USER_SELF_DELETED";
    id: string;
    title: string;
    subtitle: string;
    targetName?: string | null;
    actorName?: string | null;
    timestamp: Date;
  }>;
}

export type AdminActivityType =
  | "USER_REGISTERED"
  | "LINK_CREATED"
  | "USER_DELETED_BY_ADMIN"
  | "USER_SELF_DELETED";

export interface AdminRecentActivityItem {
  type: AdminActivityType;
  id: string;
  title: string;
  subtitle: string;
  targetName?: string | null;
  actorName?: string | null;
  timestamp: Date;
}

export interface AdminUserListItem {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  image: string | null;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    links: number;
  };
  totalClicks: number;
}

export interface AdminUserDetail {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  bio: string | null;
  image: string | null;
  role: string;
  status: string;
  themeBackground: string;
  themeAccent: string;
  themeTextColor: string;
  themeButtonColor: string;
  themeButtonTextColor: string;
  themeCardStyle: string;
  themeFont: string;
  createdAt: Date;
  updatedAt: Date;
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon: string | null;
    subtitle: string | null;
    customThumbnail: string | null;
    isActive: boolean;
    clicks: number;
    position: number;
    category: string;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export interface AdminThemeOverrideInput {
  themeBackground: string;
  themeButtonColor: string;
  themeButtonTextColor: string;
  themeAccent: string;
  themeTextColor: string;
  themeCardStyle: string;
  themeFont: string;
}

export interface AdminCreateUserInput {
  name: string;
  email: string;
  username: string;
  password?: string;
  role: "USER" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  bio?: string;
}

export interface AdminUpdateUserInput {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  role?: "USER" | "SUPER_ADMIN";
  status?: "ACTIVE" | "SUSPENDED";
  bio?: string;
  image?: string;
}

