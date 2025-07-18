import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";
import { createFollowingFixture, FollowingFixture } from "./following.fixture";
import { messageBuilder } from "./message.builder";
import { ViewWallUseCase } from "../application/usecases/view-wall.usecase";
import { InMemoryMessageRepository } from "../infra/message.inmemory.repository";
import { InMemoryFolloweeRepository } from "../infra/followee.inmemory.repository";
import { StubDateProvider } from "../infra/stub-date-provider";
import { MessageRepository } from "../application/message.repository";
import { FolloweeRepository } from "../application/followee.repository";
import { DefaultTimelinePresenter } from "../apps/timeline.default.presenter";
import { TimelinePresenter } from "../application/timeline.presenter";
import { Timeline } from "../domain/timeline";

describe("Feature : Viewing user wall", () => {
  let fixture: Fixture;
  let messagingFixture: MessagingFixture;
  let followingFixture: FollowingFixture;
  beforeEach(() => {
    messagingFixture = createMessagingFixture();
    followingFixture = createFollowingFixture();
    fixture = createFixture({
      messageRepository: messagingFixture.messageRepository,
      followeeRepository: followingFixture.followeeRepository,
    });
  });

  describe("Rule : The wall should show the messages of the user and the messages of the users he follows in the reverse chronological order", () => {
    test("Charlie has subscribe to Alice timeline and thus can view a aggregated list of all subscription", async () => {
      fixture.givenNowIs(new Date("2023-02-09T15:15:30.000Z"));
      messagingFixture.givenTheFollowingMessageExist([
        messageBuilder()
          .authoredBy("Alice")
          .withId("m1")
          .withText("I love the weather today")
          .publishedAt(new Date("2023-02-09T15:00:30.000Z"))
          .build(),
        messageBuilder()
          .authoredBy("Bob")
          .withId("m2")
          .withText("Damn! We lost!")
          .publishedAt(new Date("2023-02-09T15:01:00.000Z"))
          .build(),
        messageBuilder()
          .authoredBy("Charlie")
          .withId("m3")
          .withText("I'm in New York today! Anyone wants to have a coffee?")
          .publishedAt(new Date("2023-02-09T15:15:00.000Z"))
          .build(),
      ]);

      followingFixture.givenUserFollowees({
        user: "Charlie",
        followees: ["Alice"],
      });
      await fixture.whenUserSeesTheWallOf("Charlie");

      fixture.thenUserShouldSee([
        {
          author: "Charlie",
          text: "I'm in New York today! Anyone wants to have a coffee?",
          publicationTime: "less than a minute ago",
        },
        {
          author: "Alice",
          text: "I love the weather today",
          publicationTime: "15 minutes ago",
        },
      ]);
    });
  });
});

const createFixture = ({
  messageRepository,
  followeeRepository,
}: {
  messageRepository: MessageRepository;
  followeeRepository: FolloweeRepository;
}) => {
  let wall: { author: string; text: string; publicationTime: string }[];
  const dateProvider = new StubDateProvider();
  const viewWallUseCase = new ViewWallUseCase(
    messageRepository,
    followeeRepository,
  );
  const defaultTimelinePresenter: DefaultTimelinePresenter =
    new DefaultTimelinePresenter(dateProvider);
  const timelinePresenter: TimelinePresenter = {
    show(theWall: Timeline) {
      wall = defaultTimelinePresenter.show(theWall);
    },
  };
  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserSeesTheWallOf(user: string) {
      await viewWallUseCase.handle({ user }, timelinePresenter);
    },
    thenUserShouldSee: (
      expectedWall: { author: string; text: string; publicationTime: string }[],
    ) => {
      expect(wall).toEqual(expectedWall);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
