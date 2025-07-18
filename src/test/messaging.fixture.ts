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
import { DefaultTimelinePresenter } from "../apps/timeline.default.presenter";
import { TimelinePresenter } from "../application/timeline.presenter";
import { Timeline } from "../domain/timeline";

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
  const defaultTimelinePresenter: DefaultTimelinePresenter =
    new DefaultTimelinePresenter(dateProvider);
  const timelinePresenter: TimelinePresenter = {
    show(theTimeline: Timeline) {
      timeline = defaultTimelinePresenter.show(theTimeline);
    },
  };
  return {
    givenNowIs(date: Date) {
      dateProvider.now = date;
    },
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      const result = await postMessageUseCase.handle(postMessageCommand);
      if (result.isErr()) {
        throwError = result.error;
      }
    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isErr()) {
        throwError = result.error;
      }
    },
    thenErrorShouldBe(expectedError: new () => Error) {
      expect(throwError).toBeInstanceOf(expectedError);
    },
    givenTheFollowingMessageExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },

    async whenUserSeesTheTimelineOf(user: string) {
      await viewTimelineUseCase.handle({ user }, timelinePresenter);
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
    messageRepository,
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
