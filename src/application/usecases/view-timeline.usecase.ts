import { MessageRepository } from "../message.repository";
import { DateProvider } from "../date-provider";
import { Timeline } from "../../domain/timeline";
export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider,
  ) {}
  async handle({ user }: { user: string }): Promise<
    {
      author: string;
      text: string;
      publicationTime: string;
    }[]
  > {
    const messageOfUser = await this.messageRepository.getAllOfUser(user);
    messageOfUser.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
    const timeline = new Timeline(messageOfUser, this.dateProvider.getNow()!);
    return timeline.data;
  }
}
