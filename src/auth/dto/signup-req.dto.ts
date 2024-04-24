import { UserRole } from '../entities';

export type SignupReqDto = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
};
