import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;

export type RoleApi = {
  _id: string;
  roleType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  displayRoleName: string;
};

export type UserApi = {
  usr_id: string;
  _id: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  isActive: boolean;
  role: RoleApi | null;
  displayRoleName: string;
};

export type Permission = {
  _id: string;
  name: string;
  key?: string;
  module?: string;
  menu?: string | null;
  subMenu?: string | null;
  action?: string;
  label?: string;
  description?: string;
};

export type PermissionOverride = {
  _id: string;
  userId: string;
  grantedPermissions: Permission[];
  revokedPermissions: Permission[];
  createdAt: string;
  updatedAt: string;
};

export type UserWithPermissionsApi = {
  _id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
  role: {
    _id: string;
    name: string;
    displayRoleName?: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  isActive: boolean;
  usr_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  permissions: Permission[];
  permissionOverride: PermissionOverride | null;
};

export type PostApi = {
  _id: string;
  title: string;
  subTitle?: string;
  description?: string;
  link: string;
  image?: string;
  platform: "linkedin" | "instagram" | "facebook" | "twitter" | "other";
  status: "published" | "unpublished";
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type TeamApi = {
  _id: string;
  name: string;
  designation: string;
  sectorsCovered: string[];
  image: string;
  socialMedia: {
    platform: "linkedin" | "twitter" | "instagram" | "facebook";
    url: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FormFieldType = "text" | "email" | "tel" | "url" | "textarea" | "number" | "select" | "radio" | "checkbox" | "date" | "time" | "file";

export type FormConfigApi = {
  _id: string;
  label: string;
  name: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FailedRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig & { _retry?: boolean };
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) reject(error);
    else resolve(api(config));
  });
  failedQueue = [];
};

// 🔑 REFRESH CALL (raw axios + skip flag)
const refreshAccessToken = () => {
  return axios.post(
    "http://localhost:3000/api/auth/refresh-token",
    {},
    {
      withCredentials: true,
      headers: {
        "x-skip-auth-refresh": "true",
      },
    },
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    // 🚫 NEVER intercept refresh or logout
    if (
      originalRequest.headers?.["x-skip-auth-refresh"] ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    // Only handle 401 ONCE
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // ⛔ Prevent infinite loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Queue while refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;

    try {
      await refreshAccessToken();
      processQueue();
      return api(originalRequest); // retry original request
    } catch (refreshError) {
      processQueue(refreshError);
      // ❌ DO NOT redirect here
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const login = async (identifier: string) => {
  const response = await api.post("/auth/request-otp", { identifier });
  return response.data;
};

export const verifyOTP = async (otp: string) => {
  const response = await api.post("/auth/verify-otp", { otp });
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const fetchMe = async () => {
  const res = await api.get("/auth/me", {
    headers: { "x-loading-bar": "off" },
  });
  return res.data;
};

export const fetchUsers = async () => {
  const includeInactiveUser = true;
  const res = await api.get("/users", { params: { includeInactiveUser } });
  return res.data.data.map((user: UserApi) => ({
    id: user._id,
    usrId: user.usr_id || "-",
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role?.displayRoleName ?? "-",
    roleId: user.role?._id ?? "",
    designation: user.designation,
    isActive: user.isActive,
  }));
};

export const fetchAllRoles = async () => {
  const includeInactiveRoleType = true;
  const res = await api.get("/roles", { params: { includeInactiveRoleType } });
  return res.data.data.map((role: any) => ({
    id: role._id,
    roleUID: role.role_id,
    roleName: role.displayRoleName,
    description: role.description || "-",
    isActive: role.isActive,
  }));
};

export const fetchActiveRoles = async () => {
  const res = await api.get("/roles");
  return res.data.data;
};

export const fetchRoleTypeById = async (id: string) => {
  const res = await api.get(`/roles/${id}`);
  const { role, permissions } = res.data.data;
  return {
    id: role._id,
    roleUID: role.role_id,
    roleName: role.displayRoleName,
    description: role.description || "-",
    isActive: role.isActive,
    permissions: permissions || [],
    createdAt: role.createdAt,
  };
};

export const fetchDefaultRolePermissions = async (roleId: string) => {
  const data = await fetchRoleTypeById(roleId);
  return data.permissions;
};

export const fetchAllPermissions = async () => {
  const res = await api.get("/permissions");
  return res.data.data;
};

export const createRoleTypeWithPermissions = async (data: any) => {
  const res = await api.post("/roles", data);
  return res.data;
};

export const updateRoleTypeWithPermissions = async (id: string, data: any) => {
  const res = await api.patch(`/roles/${id}`, data);
  return res.data;
};

export const changeStatusOfRoleType = async (id: string, isActive: boolean) => {
  const res = await api.patch(`/roles/${id}/status`, { isActive });
  return res.data;
};

export const changeStatusOfUser = async (id: string, isActive: boolean) => {
  const res = await api.patch(`/users/${id}/status`, { isActive });
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await api.post("/users", data);
  return res.data;
};

export const updateUser = async (id: string, data: any) => {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
};

export const fetchUserWithPermissionById = async (id: string): Promise<UserWithPermissionsApi> => {
  const res = await api.get(`/users/${id}`);
  return res.data.data;
};

// --- Website / Posts ---

export const fetchPosts = async (params?: {
  page?: number;
  limit?: number;
  platform?: string;
  search?: string;
  status?: string;
}) => {
  const res = await api.get("/admin/website/posts", { params });
  return res.data.data; // contains { posts, pagination }
};

export const fetchPostById = async (id: string) => {
  const res = await api.get(`/admin/website/posts/${id}`);
  return res.data.data.post;
};

export const createPost = async (data: FormData) => {
  const res = await api.post("/admin/website/posts", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updatePost = async (id: string, data: FormData) => {
  const res = await api.patch(`/admin/website/posts/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deletePost = async (id: string) => {
  const res = await api.delete(`/admin/website/posts/${id}`);
  return res.data;
};

export const togglePostStatus = async (id: string, status: string) => {
  const res = await api.patch(`/admin/website/posts/${id}/status`, { status });
  return res.data;
};

// --- Website / Team ---

export const fetchTeamMembers = async () => {
  const res = await api.get("/admin/website/teams");
  return res.data.data;
};

export const fetchTeamMemberById = async (id: string) => {
  const res = await api.get(`/admin/website/teams/${id}`);
  return res.data.data;
};

export const createTeamMember = async (data: FormData) => {
  const res = await api.post("/admin/website/teams", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateTeamMember = async (id: string, data: FormData) => {
  const res = await api.patch(`/admin/website/teams/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteTeamMember = async (id: string) => {
  const res = await api.delete(`/admin/website/teams/${id}`);
  return res.data;
};

export const toggleTeamMemberStatus = async (id: string, isActive: boolean) => {
  const res = await api.patch(`/admin/website/teams/${id}/toggle-status`, { isActive });
  return res.data;
};

// --- Website / Contact (Form Config) ---

export const fetchFormConfigs = async () => {
  const res = await api.get("/admin/website/contacts/config");
  // Backend returns { data: { configs, pagination } }
  return res.data.data.configs;
};

export const createFormConfig = async (data: Partial<FormConfigApi>) => {
  const res = await api.post("/admin/website/contacts/config", data);
  return res.data.data;
};

export const updateFormConfig = async (id: string, data: Partial<FormConfigApi>) => {
  const res = await api.patch(`/admin/website/contacts/config/${id}`, data);
  return res.data.data;
};

export const deleteFormConfig = async (id: string) => {
  const res = await api.delete(`/admin/website/contacts/config/${id}`);
  return res.data.data;
};

export const toggleFormConfigStatus = async (id: string, isActive: boolean) => {
  const res = await api.patch(`/admin/website/contacts/config/${id}/status`, { isActive });
  return res.data.data;
};

export type InquiryApi = {
  _id: string;
  responses: Record<string, any>;
  status: "unread" | "read";
  createdAt: string;
  updatedAt: string;
};

export const reorderFormConfigs = async (orderedIds: string[]) => {
  const res = await api.patch("/admin/website/contacts/config/reorder", { orderedIds });
  return res.data.data;
};

// --- Website / Contact (Inquiries) ---

export const fetchInquiries = async (params?: { page?: number; limit?: number }) => {
  const res = await api.get("/admin/website/contacts/inquiries", { params });
  return res.data; // { data, pagination, status, message }
};

export const fetchInquiryById = async (id: string) => {
  const res = await api.get(`/admin/website/contacts/inquiries/${id}`);
  return res.data.data;
};

export const updateInquiryStatus = async (id: string, status: "unread" | "read") => {
  const res = await api.patch(`/admin/website/contacts/inquiries/${id}/status`, { status });
  return res.data.data;
};

export const deleteInquiry = async (id: string) => {
  const res = await api.delete(`/admin/website/contacts/inquiries/${id}`);
  return res.data.data;
};

// --- Dashboard Overview ---

export type DashboardStats = {
  totalUsers: number;
  totalRoles: number;
  totalPosts: number;
  pendingInquiries: number;
  totalTeam: number;
  totalConfigs: number;
};

export type DashboardOverviewResponse = {
  stats: DashboardStats;
  recentActivity: {
    action: string;
    detail: string;
    time: string;
    module: "admin" | "website" | "accounts" | "task" | "leave";
    color: string;
    bg: string;
  }[];
};

export const fetchDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
  const res = await api.get("/dashboard/overview");
  return res.data.data;
};

export interface AdminOverviewResponse {
  recentActivity: {
    user: string;
    action: string;
    detail: string;
    time: string;
    color: string;
  }[];
  alerts: {
    permissionMismatch: number;
    dormantAccounts: number;
  };
}

export const fetchAdminOverview = async (): Promise<AdminOverviewResponse> => {
  const res = await api.get("/dashboard/admin-overview");
  return res.data.data;
};

