import {
  Followee,
  FolloweeRepository,
} from "../application/followee.repository";

export class InMemoryFolloweeRepository implements FolloweeRepository {
  followeeByUser = new Map<string, string[]>();
  saveFollowee(followee: Followee): Promise<void> {
    this.addFollowee(followee);
    return Promise.resolve();
  }

  givenExistingFollowees(followees: Followee[]) {
    followees.forEach((f) => this.addFollowee(f));
  }

  async getFolloweesOf(user: string): Promise<string[]> {
    return Promise.resolve(this.followeeByUser.get(user) ?? []);
  }

  private addFollowee(followee: Followee) {
    const existingFollowees = this.followeeByUser.get(followee.user) ?? [];
    existingFollowees.push(followee.followee);
    this.followeeByUser.set(followee.user, existingFollowees);
  }
}
