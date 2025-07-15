import { Message } from "../domain/message";

export interface MessageRepository {
  save(msg: Message): Promise<void>;
  getAllOfUser(user: string): Promise<Message[]>;
  getById(messageId: string): Promise<Message>;
}
