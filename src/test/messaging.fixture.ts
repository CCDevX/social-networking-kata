import { StubDateProvider } from "../infra/stub-date-provider";
import { InMemoryMessageRepository } from "../infra/message.inmemory.repository";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "../application/usecases/post-message.usecase";
import { Message } from "../domain/message";
import { ViewTimelineUseCase } from "../application/usecases/view-timeline.usecase";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "../application/usecases/edit-message.usecase";

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider,
  );
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider,
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  let timeline: {
    author: string;
    text: string;
    publicationTime: string;
  }[];
  let throwError: Error;
  return {
    givenNowIs(date: Date) {
      dateProvider.now = date;
    },
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand);
      } catch (err) {
        throwError = err as Error;
      }
    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      try {
        await editMessageUseCase.handle(editMessageCommand);
      } catch (err) {
        throwError = err as Error;
      }
    },
    thenErrorShouldBe(expectedError: new () => Error) {
      expect(throwError).toBeInstanceOf(expectedError);
    },
    givenTheFollowingMessageExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },

    async whenUserSeesTheTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
      return timeline;
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[],
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const message = await messageRepository.getById(expectedMessage.id);
      expect(message).toEqual(expectedMessage);
    },
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
