import { InMemoryFolloweeRepository } from "../infra/followee.inmemory.repository";
import {
  FollowUserCommand,
  FollowUserUseCase,
} from "../application/usecases/follow-user.usecase";

export const createFollowingFixture = () => {
  const followeeRepository = new InMemoryFolloweeRepository();
  const followUserUseCase = new FollowUserUseCase(followeeRepository);

  return {
    givenUserFollowees({
      user,
      followees,
    }: {
      user: string;
      followees: string[];
    }) {
      followeeRepository.givenExistingFollowees(
        followees.map((f) => ({ user, followee: f })),
      );
    },
    async whenUserFollows(followCommand: FollowUserCommand) {
      await followUserUseCase.handle(followCommand);
    },
    async thenUserFolloweesAre(userFollowee: {
      user: string;
      followees: string[];
    }) {
      const actualFollowee = await followeeRepository.getFolloweesOf(
        userFollowee.user,
      );
      expect(actualFollowee).toEqual(userFollowee.followees);
    },
    followeeRepository,
  };
};

export type FollowingFixture = ReturnType<typeof createFollowingFixture>;
