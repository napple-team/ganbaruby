import { Status as StatusOrigin, FullUser } from 'twitter-d'

export interface Status extends StatusOrigin {
  text: string;
  user: FullUser;
}
