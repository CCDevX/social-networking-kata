import {
    DateProvider,
    Message,
    MessageRepository,
    PostMessageCommand,
    PostMessageUseCase
} from "../post-message.usecase";

describe("Feature: Posting a message", () => {
    describe('Rule: A message can contain a maximum of 280 characters', ()=>{
        test("Scenario: Alice can post a message on her timeline", () =>{
            givenNowIs(new Date('2023-01-19T19:00:00Z'));
            whenUserPostsAMessage({
                id:"message-id",
                text:'Hello World',
                author:"Alice"
            });
            thenPostedMessageShouldBe({
                id:"message-id",
                text:'Hello World',
                author:"Alice",
                publishedAt:new Date('2023-01-19T19:00:00Z')
            })
        })
    })
})



let message:Message
let now: Date;

class InMemoryMessageRepository implements MessageRepository{
    save(msg: Message): void {
        message = msg
    }
}

class StubDateProvider implements DateProvider{
    now:Date;
    getNow():Date{
        return this.now;
    }
}

const messageRepository = new InMemoryMessageRepository();
const dateProvider = new StubDateProvider();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);

function givenNowIs(date:Date){
    dateProvider.now = date;
}
function whenUserPostsAMessage(postMessageCommand:PostMessageCommand){
    postMessageUseCase.handle(postMessageCommand);
}
function thenPostedMessageShouldBe(expectedMessage:Message){
    expect(expectedMessage).toEqual(message);
}