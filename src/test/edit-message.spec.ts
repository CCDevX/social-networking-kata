import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";
import { messageBuilder } from "./message.builder";
import { EmptyMessageError, MessageTooLongError } from "../domain/message";

describe("Feature: Editing a message", () => {
  let fixture: MessagingFixture;
  beforeEach(() => (fixture = createMessagingFixture()));
  describe("Rule: The edited text should not be superior to 280 characters ", () => {
    test("Alice can edit her message to a text inferior to 280 characters", async () => {
      const aliceMessageBuilder = messageBuilder()
        .withId("message-id")
        .authoredBy("Alice")
        .withText("Hello Wrld");

      fixture.givenTheFollowingMessageExist([aliceMessageBuilder.build()]);
      await fixture.whenUserEditsMessage({
        messageId: "message-id",
        text: "Hello World",
      });

      await fixture.thenMessageShouldBe(
        aliceMessageBuilder.withText("Hello World").build(),
      );
    });
    test("Alice cannot edit her message to a text superior to 280 characters", async () => {
      const textWithLengthOf281 = "a".repeat(281);
      const originalAliceMessage = messageBuilder()
        .withId("message-id")
        .authoredBy("Alice")
        .withText("Hello World")
        .build();

      fixture.givenTheFollowingMessageExist([originalAliceMessage]);

      await fixture.whenUserEditsMessage({
        messageId: "message-id",
        text: textWithLengthOf281,
      });

      await fixture.thenMessageShouldBe(originalAliceMessage);
      fixture.thenErrorShouldBe(MessageTooLongError);
    });

    test("Alice cannot edit her message to an empty text", async () => {
      const originalAliceMessage = messageBuilder()
        .withId("message-id")
        .authoredBy("Alice")
        .withText("Hello World")
        .build();

      fixture.givenTheFollowingMessageExist([originalAliceMessage]);

      await fixture.whenUserEditsMessage({
        messageId: "message-id",
        text: "",
      });

      await fixture.thenMessageShouldBe(originalAliceMessage);
      fixture.thenErrorShouldBe(EmptyMessageError);
    });

    test("Alice cannot edit her message to contain only whitespace", async () => {
      const originalAliceMessage = messageBuilder()
        .withId("message-id")
        .authoredBy("Alice")
        .withText("Hello World")
        .build();

      fixture.givenTheFollowingMessageExist([originalAliceMessage]);

      await fixture.whenUserEditsMessage({
        messageId: "message-id",
        text: "           ",
      });

      await fixture.thenMessageShouldBe(originalAliceMessage);
      fixture.thenErrorShouldBe(EmptyMessageError);
    });
  });
});
