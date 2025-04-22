export interface User {
    user_id: number;
    name: string;
    email: string;
    created_at: Date;
  }

  export interface UserReponse{
    id?: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
  }

  export interface UserCreate {
    id?: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password2: string;
  }
  