export type LoginResDto = {
  acessToken: string;
  refreshToken: string;
  userInfo: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
};
