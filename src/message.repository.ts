import { Message } from "./message";

export interface MessageRepository {
  save(msg: {
    id: string;
    text: string;
    author: string;
    publishedAt: Date | undefined;
  }): Promise<void>;
  getAllOfUser(user: string): Promise<Message[]>;
}
