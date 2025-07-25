import * as path from "path";
import * as fs from "fs";
import { MessageRepository } from "../application/message.repository";
import { Message } from "../domain/message";

export class FileSystemMessageRepository implements MessageRepository {
  constructor(
    private readonly filePath = path.join(__dirname, "message.json"),
  ) {}

  async save(message: Message): Promise<void> {
    const messages = await this.getMessages();
    const existingMessageIndex = messages.findIndex(
      (msg) => msg.id === message.id,
    );
    if (existingMessageIndex === -1) {
      messages.push(message);
    } else {
      messages[existingMessageIndex] = message;
    }
    return fs.promises.writeFile(
      this.filePath,
      JSON.stringify(messages.map((m) => m.data)),
    );
  }
  private async getMessages(): Promise<Message[]> {
    const data = await fs.promises.readFile(this.filePath);
    const messages = JSON.parse(data.toString()) as {
      id: string;
      author: string;
      text: string;
      publishedAt: string;
    }[];

    if (!messages) {
      return [];
    }

    return messages.map((m) =>
      Message.fromData({
        id: m.id,
        author: m.author,
        text: m.text,
        publishedAt: new Date(m.publishedAt),
      }),
    );
  }

  async getAllOfUser(user: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter((m) => m.author === user);
  }

  async getById(messageId: string): Promise<Message> {
    const allMessages = await this.getMessages();
    return allMessages.filter((m) => m.id === messageId)[0]!;
  }
}
