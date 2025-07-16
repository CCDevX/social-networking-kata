import { FolloweeRepository } from "../followee.repository";
import { MessageRepository } from "../message.repository";
import { DateProvider } from "../date-provider";
import { Timeline } from "../../domain/timeline";
export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async handle({
    user,
  }: {
    user: string;
  }): Promise<{ author: string; text: string; publicationTime: string }[]> {
    const followees = await this.followeeRepository.getFolloweesOf(user);
    const messages = (
      await Promise.all(
        [user, ...followees].map((user) => {
          return this.messageRepository.getAllOfUser(user);
        }),
      )
    ).flat();

    const timeline = new Timeline(messages, this.dateProvider.getNow()!);
    return timeline.data;
  }
}
