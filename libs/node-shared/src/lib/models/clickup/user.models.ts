export interface User {
  id: number;
  username: string;
  color: string;
  email: string;
  initials: string;
  profilePicture?: (null | string)[];
}
