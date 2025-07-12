import * as path from "path";
import * as fs from "fs";
import { MessageRepository } from "./message.repository";
import { Message } from "./message";

export class FileSystemMessageRepository implements MessageRepository {
  constructor() {}
  private readonly path = path.join(__dirname, "message.json");

  async save(msg: {
    id: string;
    text: string;
    author: string;
    publishedAt: Date;
  }): Promise<void> {
    const messages = await this.getMessages();
    messages.push(msg);
    return fs.promises.writeFile(this.path, JSON.stringify(messages));
  }

  private async getMessages(): Promise<Message[]> {
    const data = await fs.promises.readFile(this.path);
    const messages = JSON.parse(data.toString()) as {
      id: string;
      author: string;
      text: string;
      publishedAt: string;
    }[];

    return messages.map((m) => ({
      id: m.id,
      author: m.author,
      text: m.text,
      publishedAt: new Date(m.publishedAt),
    }));
  }

  async getAllOfUser(user: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter((m) => m.author === user);
  }
}
