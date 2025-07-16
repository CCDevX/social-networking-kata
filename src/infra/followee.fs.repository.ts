import {
  Followee,
  FolloweeRepository,
} from "../application/followee.repository";

export class FileSystemFolloweeRepository implements FolloweeRepository {
  getFolloweesOf(user: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  saveFollowee(followee: Followee): Promise<void> {
    return Promise.resolve(undefined);
  }
}
