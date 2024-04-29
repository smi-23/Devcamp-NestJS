export type IssuedCouponReqDto = {
  isValid: boolean;
  validFrom: Date;
  validUntil: Date;
  isUsed: boolean;
  useAt: Date | null;
};
