export interface AuthLoginDtoInput {
  userName: string;
  password: string;
}

export interface UserCreateDtoInput {
  firstName: string;
  lastName: string;
  document: string;
  address: string;
  phoneNumber?: string;
  email: string;
  photo?: string;
  cityId?: number;
  userName: string;
  password: string;
  passwordConfirm: string;
}
