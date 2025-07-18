import {
  Followee,
  FolloweeRepository,
} from "../application/followee.repository";
import path from "path";
import fs from "fs";

export class FileSystemFolloweeRepository implements FolloweeRepository {
  constructor(
    private readonly filePath = path.join(__dirname, "followee.json"),
  ) {}

  async getFolloweesOf(user: string): Promise<string[]> {
    const followees = await this.getFollowees();
    return followees[user] ?? [];
  }

  async saveFollowee(followee: Followee): Promise<void> {
    const followees = await this.getFollowees();
    const actualUserFollowees = followees[followee.user] ?? [];
    actualUserFollowees.push(followee.followee);
    followees[followee.user] = actualUserFollowees;
    return fs.promises.writeFile(this.filePath, JSON.stringify(followees));
  }

  private async getFollowees() {
    const data = await fs.promises.readFile(this.filePath);
    return JSON.parse(data.toString()) as {
      [user: string]: string[];
    };
  }
}
