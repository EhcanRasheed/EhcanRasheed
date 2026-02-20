export declare class Profile {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    passwordHash: string;
    isActive: boolean;
    activationToken: string | null;
    resetToken: string | null;
    resetTokenExpiry: Date | null;
}
