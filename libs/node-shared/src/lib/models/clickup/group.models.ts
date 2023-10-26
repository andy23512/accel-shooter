import { User } from './user.models';

export interface Group {
  id: string;
  team_id: string;
  userid: number;
  name: string;
  handle: string;
  date_created: string;
  initials: string;
  members: User[];
  avatar: Avatar;
}

interface Avatar {
  attachment_id?: any;
  color?: any;
  source?: any;
  icon?: any;
}
