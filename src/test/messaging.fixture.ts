import { StubDateProvider } from "../stub-date-provider";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";
import { Message } from "../message";
import { ViewTimelineUseCase } from "../view-timeline.usecase";

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
        // @ts-ignore
        throwError = err;
      }
    },
    thenErrorShouldBe(expectedError: new () => Error) {
      expect(throwError).toBeInstanceOf(expectedError);
    },
    givenTheFollowingMessageExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },

    async whenUserSeesTheTimelineOf(user: string) {
      return await viewTimelineUseCase.handle({ user });
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[],
    ) {
      expect(timeline!).toEqual(expectedTimeline);
    },
    async whenUserEditsMessage(editMessageCommand: {
      messageId: string;
      text: string;
    }) {},
    thenMessageShouldBe(expectedMessage: Message) {
      expect(expectedMessage).toEqual(
        messageRepository.getMessageById(expectedMessage.id),
      );
    },
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
