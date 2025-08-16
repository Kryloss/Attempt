export interface User {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
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
