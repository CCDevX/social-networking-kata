import {
  EmptyMessageError,
  MessageTooLongError,
} from "../post-message.usecase";
import test from "node:test";
import { describe } from "node:test";
import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";
import { messageBuilder } from "./message.builder";

describe("Feature: Posting a message", () => {
  let fixture: MessagingFixture;
  beforeEach(() => (fixture = createMessagingFixture()));
  describe("Rule: A message can contain a maximum of 280 characters", () => {
    test("Scenario: Alice can post a message on her timeline", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00Z"));
      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
      });
      fixture.thenMessageShouldBe(
        messageBuilder()
          .withId("message-id")
          .authoredBy("Alice")
          .withText("Hello World 2")
          .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
          .build(),
      );
    });
    test("Scenario: Alice cannot post a message with more 280 characters", async () => {
      const textWithLengthOf281 = "a".repeat(281);
      fixture.givenNowIs(new Date("2023-01-19T19:00:00Z"));
      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: textWithLengthOf281,
        author: "Alice",
      });
      fixture.thenErrorShouldBe(MessageTooLongError);
    });

    describe("Rule: A message cannot be empty", () => {
      test("Scenario: Alice cannot post a message with empty text", async () => {
        fixture.givenNowIs(new Date("2023-01-19T19:00:00Z"));
        await fixture.whenUserPostsAMessage({
          id: "message-id",
          text: "",
          author: "Alice",
        });
        fixture.thenErrorShouldBe(EmptyMessageError);
      });

      test("Scenario: Alice cannot post a message with only whitespaces", async () => {
        fixture.givenNowIs(new Date("2023-01-19T19:00:00Z"));
        await fixture.whenUserPostsAMessage({
          id: "message-id",
          text: "       ",
          author: "Alice",
        });
        fixture.thenErrorShouldBe(EmptyMessageError);
      });
    });
  });
});
