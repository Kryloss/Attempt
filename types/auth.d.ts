export interface User {
    _id: string;
    id?: string; // Alternative ID field for compatibility
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    guest?: boolean; // Optional flag to indicate guest user
}

export interface AuthFormData {
    username?: string;
    email?: string;
    password: string;
    confirmPassword?: string;
    emailOrUsername?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
}

export interface AuthError {
    error: string;
}
