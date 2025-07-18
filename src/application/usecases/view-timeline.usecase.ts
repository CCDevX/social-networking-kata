import { MessageRepository } from "../message.repository";
import { DateProvider } from "../date-provider";
import { Timeline } from "../../domain/timeline";
import { TimelinePresenter } from "../timeline.presenter";
export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider,
  ) {}
  async handle(
    { user }: { user: string },
    timelinePresenter: TimelinePresenter,
  ): Promise<void> {
    const messageOfUser = await this.messageRepository.getAllOfUser(user);
    messageOfUser.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
    const timeline = new Timeline(messageOfUser);
    timelinePresenter.show(timeline);
  }
}
