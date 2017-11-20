import { IDeleteFriendsArguments, IGetFriendArguments } from '../../models/api';
import { IFriend, IAddFriendsArguments } from '../../models';
export interface IFriendManager {
  getAllFriends(userId: string): Promise<IFriend[]>;
  getFriend(args: IGetFriendArguments): Promise<IFriend>;
  createFriends(args: IAddFriendsArguments): Promise<IFriend[]>;
  updateFriends(args: IFriend[]): Promise<IFriend[]>;
  deleteFriends(args: IDeleteFriendsArguments): Promise<void>;
  searchByText(userId: string, searchComponents: string[]): Promise<IFriend[]>;
}
