import { MessageRepository } from "../message.repository";
import {
  EmptyMessageError,
  Message,
  MessageText,
  MessageTooLongError,
} from "../../domain/message";
import { Err, Ok, Result } from "../result";

export type EditMessageCommand = { messageId: string; text: string };

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}
  async handle(
    editMessageCommand: EditMessageCommand,
  ): Promise<Result<void, EmptyMessageError | MessageTooLongError>> {
    const message = await this.messageRepository.getById(
      editMessageCommand.messageId,
    );
    try {
      message.editText(editMessageCommand.text);
    } catch (err) {
      return Err.of(err as EmptyMessageError | MessageTooLongError);
    }

    await this.messageRepository.save(message);

    return Ok.of(undefined);
  }
}
