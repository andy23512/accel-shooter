export interface Team {
  id: string;
  name: string;
  color: string;
  avatar?: any;
  members: Member[];
  roles: Role[];
}

interface Role {
  id: number;
  name: string;
  custom: boolean;
  inherited_role?: number;
}

interface Member {
  user: User;
}

interface User {
  id: number;
  username: string;
  email: string;
  color?: string;
  profilePicture: string;
  initials: string;
  role: number;
}
