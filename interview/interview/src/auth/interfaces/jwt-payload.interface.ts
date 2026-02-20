// This ensures that payload.sub is treated as a number across your auth logic
export interface JwtPayload {
  sub: number;
}