import { Repository } from 'typeorm';
import { Profile } from '../profile/entity/profile.entity';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly profileRepo;
    constructor(profileRepo: Repository<Profile>);
    validate(payload: {
        sub: string;
        role?: string;
    }): Promise<{
        id: number;
        role: string;
        fullName: string;
        email: string;
    }>;
}
export {};
