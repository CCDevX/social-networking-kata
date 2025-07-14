import { MessageRepository } from "./message.repository";
import { DateProvider } from "./post-message.usecase";
const ONE_MINUTE_IN_MS = 60000;
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
    const now = this.dateProvider.getNow();

    return messageOfUser.map((msg) => {
      return {
        author: msg.author,
        text: msg.text,
        publicationTime: this.publicationTime(msg.publishedAt!),
      };
    });
  }

  private publicationTime = (publishedAt: Date) => {
    const now = this.dateProvider.getNow();
    const diff = now!.getTime() - publishedAt.getTime();
    const minutes = Math.floor(diff / ONE_MINUTE_IN_MS);
    if (minutes < 1) {
      return "less than a minute ago";
    } else if (minutes < 2) {
      return "1 minute ago";
    } else {
      return `${minutes} minutes ago`;
    }
  };
}
