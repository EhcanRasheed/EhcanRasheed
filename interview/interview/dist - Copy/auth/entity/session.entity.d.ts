import { Profile } from '../../profile/entity/profile.entity';
export declare class Session {
    id: string;
    user: Profile;
    refreshToken?: string | null;
    accessToken: string;
    isActive: boolean;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}
