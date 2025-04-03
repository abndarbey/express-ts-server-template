export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  organizationId?: string;
}

export interface UpdateUserInput {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
}

export interface UserFilter {
  id?: string;
  email?: string;
  organizationId?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}
