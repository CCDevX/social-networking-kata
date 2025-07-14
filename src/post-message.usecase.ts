import { MessageRepository } from "./message.repository";
import { MessageText } from "./message";

export type PostMessageCommand = { id: string; text: string; author: string };

export interface DateProvider {
  getNow(): Date | undefined;
}

export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider,
  ) {}
  async handle(postMessageCommand: PostMessageCommand) {
    const messageText = MessageText.of(postMessageCommand.text);
    await this.messageRepository.save({
      id: postMessageCommand.id,
      text: messageText,
      author: postMessageCommand.author,
      publishedAt: this.dateProvider.getNow()!,
    });
  }
}
