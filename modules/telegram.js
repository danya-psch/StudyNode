const config = require('../config');

const User = require("../models/user");
const Course = require("../models/course");

const TelegramBotApi = require('telegram-bot-api');

const telegramBotApi = new TelegramBotApi({
    token: config.bot_token,
    updates: {
        enabled: true  // do message pull
    }
});

telegramBotApi.on('message', onMessage);

function onMessage(message) {
    processRequest(message)
        .catch(err => telegramBotApi.sendMessage({
            chat_id: message.chat.id,
            text: `Something went wrong. Try again later. Error: ${err.toString()}`,
        }));
}

async function processRequest(message) {
    if (message.text === '/start') {
        return User.getByTelegramName(message.from.username)
            .then(user => {
                if (typeof user !== 'undefined' && user !== null) {
                    
                    User.updateWithoutHashing(user._id,
                        new User
                        (
                            user.name,
                            user.lastName,
                            user.password,
                            user.courses,
                            user.role,
                            user.date,
                            user.telegram,
                            message.chat.id,
                            user.avaUrl,
                            user.dateOfBirth,
                            user.facebookName,
                            user.facebookId
                        )
                    )
                    

                    return telegramBotApi.sendMessage({
                        chat_id: message.chat.id,
                        text: `Hello, ${message.from.username}! Now you are subscribed to my notifications`,
                    });
                } else {
                    return telegramBotApi.sendMessage({
                        chat_id: message.chat.id,
                        text: `User with Telegram username ${message.from.username} is not registered on StudyNode.`,
                    });
                }
            });
    } else {
        return User.getByTelegramName(message.from.username)
        .then(user => {
            if (user.telegram_chat_id !== null && typeof user.telegram_chat_id !== 'undefined' && user.telegram_chat_id !== "" && user.telegram_chat_id !== 0) {
                switch (message.text) {
                    case "/myMarks": {
                        let myMessage = "";
                        for (const course of user.courses) {
                            myMessage += `courseName: ${course.courseName}:\n`;
                            for (const node of course.nodes) {
                                myMessage += `   ${node.name}: ${node.balls}\n`;
                            }
                            myMessage += "\n";
                        }

                        return telegramBotApi.sendMessage({
                            chat_id: message.chat.id,
                            text: myMessage,
                        });
                        break;
                    }
                    case "/myCourses": {
                        console.log("myCourses");
                        console.log(user);
                        if (user.role === "Utilizer") {
                            return telegramBotApi.sendMessage({
                                chat_id: message.chat.id,
                                text: "You are not a teacher",
                            });
                        } else {
                            return Course.getMy(user._id)
                            .then(courses => {
                                let myMessage = "";
                                for (const course of courses) {
                                    myMessage += `courseName: ${course.name}:\n`;
                                    myMessage += `   rootName: ${course.root.task.name}\n\n`;
                                    myMessage += `   nodes: {\n`;
                                    for (const node of course.graph) {
                                        myMessage += `      ${node.task.name},\n`;
                                    }
                                    myMessage += `   }\n`;
                                }
                                if (myMessage.length === 0) myMessage += "You have no courses";

                                return telegramBotApi.sendMessage({
                                    chat_id: message.chat.id,
                                    text: myMessage,
                                });
                            });
                        }
                        break;
                    }
                    case "/help": {
                        return telegramBotApi.sendMessage({
                            chat_id: message.chat.id,
                            text: "/start - subscribe to my notifications\n/myCourses - view my courses(if you are a teacher)\n/myMarks - view my grades",
                        });
                    }
                    default:
                        return telegramBotApi.sendMessage({
                            chat_id: message.chat.id,
                            text: "There is nothing for you",
                        });
                }
            } else {
                return telegramBotApi.sendMessage({
                    chat_id: message.chat.id,
                    text: "There is nothing for you",
                });
            }
        });
    }
    return telegramBotApi.sendMessage({
        chat_id: message.chat.id,
        text: "There is nothing for you",
    });
}

async function sendNotifications(chatId, text) {
    telegramBotApi.sendMessage({
        chat_id: chatId,
        text: text,
    });

}

module.exports = {
    sendNotifications
}
