import TelegramAPI from 'node-telegram-bot-api';
import config from 'config';

const webAppUrl = config.get('APP_URL');
const bot = new TelegramAPI(config.get('BOT_TOKEN'), { polling: true });

bot.setMyCommands([
    { command: '/start', description: 'старт' },
    { command: '/info', description: 'информация' },
    { command: '/form', description: 'ввести данные' },
]);

// валидация пользователей
const users = config.get('USERS');
const allowedIds = [];

//формируем массив существующих ID из config'a
for (let i = 0; i < users.length; i++) {
    if (Object.values(users[i])[0] !== '') {
        allowedIds.push(+Object.values(users[i])[0]);
    }
}

// узнаем свой ID в tg для получения доступа
bot.on('message', async (msg) => {
    if (msg.text === '/info' || msg.text === '/info@CerroTorreBot') {
        await bot.sendMessage(
            msg.chat.id,
            `you are ${msg.from.first_name}. your ID is ${msg.from.id}. chat ID is ${msg.chat.id}`
        );
    }
})

// команды с проверкой доступа
bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    function checkAccess(array, callback) {
        if (array.includes(msg.from.id)) return callback();
        else
            return bot.sendMessage(
                chatId,
                'you have no permission to use this bot'
            );
    }

    const start = async () => {
        if (text == '/start' || text == '/start@CerroTorreBot') {
            await bot.sendMessage(chatId, 'wellcome');
        }

        if (text == '/form') {
            await bot.sendMessage(chatId, 'заполните форму', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Рабочий лист', web_app: { url: webAppUrl } }],
                    ],
                },
            });
        }
        process.on('uncaughtException', (err) => {
            console.log(err);
        });
    };

    checkAccess(allowedIds, start);
});

// создаем кнопоки "Подтверждено"(confirmedBtn) и "Отклонено"(declinedBtn)
// для обработки повторных нажатий
const confirmedBtn = {
    inline_keyboard: [
        [
            {
                text: 'Подтверждено',
                callback_data: JSON.stringify({
                    status: 'doNthC',
                    senderId: 'none',
                }),
            },
        ],
    ],
};

const declinedBtn = {
    inline_keyboard: [
        [
            {
                text: 'Отклонено',
                callback_data: JSON.stringify({
                    status: 'doNthD',
                    senderId: 'none',
                }),
            },
        ],
    ],
};

// обработка нажатия кнопок "Подтвердить" / "Отклонить"
bot.on('callback_query', async (callbackData) => {
    if (
        JSON.parse(callbackData.data).status === 'confirm' ||
        JSON.parse(callbackData.data).status === 'decline'
    ) {
        // парсим поле data объекта c сервера в js объект
        let { data, message } = callbackData;
        let parsedData = JSON.parse(data);
        console.log(parsedData)

        //текст отправителю без строк "от" и "итог"
        let { text } = message;
        let textForSender = text.split('\n').slice(1, -1).join('\n');

        if (parsedData.status === 'confirm') {
            await bot
                .answerCallbackQuery(callbackData.id, {
                    text: 'Подтверждено',
                    show_alert: true,
                })
                .then(() => {
                    bot.editMessageReplyMarkup(confirmedBtn, {
                        chat_id: callbackData.message.chat.id,
                        message_id: callbackData.message.message_id,
                    }).then(() => {
                        bot.sendMessage(
                            parsedData.senderId,
                            `Ваши данные были подтверждены\n${textForSender}`
                        );
                    });
                });
        } else if (parsedData.status === 'decline') {
            await bot
                .answerCallbackQuery(callbackData.id, {
                    text: 'Отклонено',
                    show_alert: true,
                })
                .then(() => {
                    bot.editMessageReplyMarkup(declinedBtn, {
                        chat_id: callbackData.message.chat.id,
                        message_id: callbackData.message.message_id,
                    }).then(() => {
                        bot.sendMessage(
                            parsedData.senderId,
                            `Ваши данные были отклонены\n${textForSender}`
                        );
                    });
                });
        }
    }
});

// обработка повторного нажатия кнопок
bot.on('callback_query', (query) => {
    if (JSON.parse(query.data).status === 'doNthC') {
        bot.answerCallbackQuery(query.id, {
            text: 'Статус: подтверждено',
            show_alert: true,
        });
    } else if (JSON.parse(query.data).status === 'doNthD') {
        bot.answerCallbackQuery(query.id, {
            text: 'Статус: отклонено',
            show_alert: true,
        });
    }
});
