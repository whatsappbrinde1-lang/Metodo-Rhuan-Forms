
export interface UserData {
  name: string;
  age: string;
  weight: string;
  height: string;
  goal: string;
  activityLevel: string;
  dietPreference: string;
}

export enum PlanType {
  BASIC = 'BASIC',
  PRO = 'PRO',
  AI_SPECIAL = 'AI_SPECIAL'
}

export interface PricingTier {
  id: PlanType;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}
