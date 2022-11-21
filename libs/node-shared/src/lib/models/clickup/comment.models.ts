export interface Comment {
  id: string;
  comment: {
    text: string;
    type?: string;
    frame?: { id: string; service: string; url: string; src: string };
    bookmark?: { service: string; url: string };
  }[];
  comment_text: string;
  user: User;
  resolved: boolean;
  assignee: User;
  assigned_by: User;
  reactions: any[];
  date: string;
}

interface User {
  id: number;
  username: string;
  initials: string;
  email: string;
  color: string;
  profilePicture: string;
}
