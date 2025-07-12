import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";
import { messageBuilder } from "./message.builder";
describe("Feature: Viewing a personal timeline", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view the 2 messages she published in her timeline", async () => {
      const aliceMessageBuilder = messageBuilder().authoredBy("Alice");
      fixture.givenTheFollowingMessageExist([
        aliceMessageBuilder
          .withId("message-1")
          .withText("My first message")
          .publishedAt(new Date("2023-02-07T16:27:59.000Z"))
          .build(),
        messageBuilder()
          .authoredBy("Bob")
          .withId("message-2")
          .withText("Hi it's Bob")
          .publishedAt(new Date("2023-02-07T16:29:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-3")
          .withText("How are you all ?")
          .publishedAt(new Date("2023-02-07T16:30:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-4")
          .withText("My last message")
          .publishedAt(new Date("2023-02-07T16:30:30.000Z"))
          .build(),
      ]);

      const timeline = await fixture.whenUserSeesTheTimelineOf("Alice");

      fixture.thenUserShouldSee([
        {
          author: "Alice",
          text: "My last message",
          publicationTime: "less than a minute ago",
        },
        {
          author: "Alice",
          text: "How are you all ?",
          publicationTime: "1 minute ago",
        },
        {
          author: "Alice",
          text: "My first message",
          publicationTime: "3 minutes ago",
        },
      ]);
    });
  });
});

//Old test

// describe("publicationTime", () => {
//   it('should return "less than a minute ago" when the publicationDate is inferior to one minute ago', async () => {
//     const now = new Date("2023-02-16T10:57:00Z");
//     const publishedAt = new Date("2023-02-16T10:56:30Z");
//     const text = publicationTime(now, publishedAt);
//
//     expect(text).toEqual("less than a minute ago");
//   });
//   it('should return "1 minute ago" when the publicationDate is exactly to one minute ago', async () => {
//     const now = new Date("2023-02-16T10:57:00Z");
//     const publishedAt = new Date("2023-02-16T10:56:00Z");
//     const text = publicationTime(now, publishedAt);
//
//     expect(text).toEqual("1 minute ago");
//   });
//
//   it('should return "1 minute ago" when the publicationDate is exactly under two minutes ago', async () => {
//     const now = new Date("2023-02-16T10:57:00Z");
//     const publishedAt = new Date("2023-02-16T10:55:01Z");
//     const text = publicationTime(now, publishedAt);
//
//     expect(text).toEqual("1 minute ago");
//   });
//
//   it('should return "2 minutes ago" when the publicationDate is between 2 minutes and 2m59s ago', async () => {
//     const now = new Date("2023-02-16T10:57:00Z");
//     const publishedAt = new Date("2023-02-16T10:55:00Z");
//     const text = publicationTime(now, publishedAt);
//
//     expect(text).toEqual("2 minutes ago");
//   });
//
//   it('should return "X minutes ago" when the publicationDate is between X minutes and Xm59s ago', async () => {
//     const now = new Date("2023-02-16T10:57:00Z");
//     const publishedAt = new Date("2023-02-16T10:52:00Z");
//     const text = publicationTime(now, publishedAt);
//
//     expect(text).toEqual("2 minutes ago");
//   });
// });

// const publicationTime = (now: Date, publishedAt: Date) => {
//   const diff = now.getTime() - publishedAt.getTime();
//   const minutes = diff / 60000;
//   if (minutes > 1) {
//     return "less than a minute ago";
//   } else if (minutes < 2) {
//     return "1 minute ago";
//   } else {
//     return `${minutes} minutes ago`;
//   }
// };
