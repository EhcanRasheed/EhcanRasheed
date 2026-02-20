import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
constructor() { super({ usernameField: 'email' }); }
async validate(): Promise<any> { return true; }
}