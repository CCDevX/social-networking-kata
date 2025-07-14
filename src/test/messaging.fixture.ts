import { StubDateProvider } from "../stub-date-provider";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";
import { Message } from "../message";
import { ViewTimelineUseCase } from "../view-timeline.usecase";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "../edit-message.usecase";

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
