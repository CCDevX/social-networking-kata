import { FolloweeRepository } from "../followee.repository";
import { MessageRepository } from "../message.repository";
import { DateProvider } from "../date-provider";
import { Timeline } from "../../domain/timeline";
import { TimelinePresenter } from "../timeline.presenter";
export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository,
  ) {}

  async handle(
    {
      user,
    }: {
      user: string;
    },
    timelinePresenter: TimelinePresenter,
  ): Promise<void> {
    const followees = await this.followeeRepository.getFolloweesOf(user);
    const allUsersToInclude = [user, ...followees];
    const messages = (
      await Promise.all(
        allUsersToInclude.map((user) => {
          return this.messageRepository.getAllOfUser(user);
        }),
      )
    ).flat();

    const timeline = new Timeline(messages);
    timelinePresenter.show(timeline);
  }
}
