import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateAdminUserDto } from './dto/create-admin.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, req: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: any): Promise<{
        message: string;
    }>;
    createAdmin(dto: CreateAdminUserDto, user: any): Promise<{
        message: string;
        admin: {
            id: number;
            email: string;
        };
    }>;
    sendActivation(email: string): Promise<{
        message: string;
    }>;
    activate(token: string): Promise<{
        message: string;
    }>;
    forgot(email: string): Promise<{
        message: string;
    }>;
    reset(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    changePassword(user: any, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    me(user: any): Promise<{
        user: any;
    }>;
}
