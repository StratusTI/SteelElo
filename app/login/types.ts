export type LoginState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<'email' | 'password', string[]>>;
};

export const loginInitialState: LoginState = { success: false };
