import { FolloweeRepository } from "../followee.repository";

export type FollowUserCommand = { user: string; userToFollow: string };

export class FollowUserUseCase {
  constructor(private readonly followeeRepository: FolloweeRepository) {}

  async handle(followeeUserCommand: FollowUserCommand) {
    return this.followeeRepository.saveFollowee({
      user: followeeUserCommand.user,
      followee: followeeUserCommand.userToFollow,
    });
  }
}
