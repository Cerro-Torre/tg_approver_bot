import TelegramAPI from 'node-telegram-bot-api';
import express, { json } from 'express';
import cors from 'cors';
import config from 'config';

const bot = new TelegramAPI(config.get('BOT_TOKEN'), { polling: false });

const app = express();

app.use(json());
app.use(cors());

const users = config.get('USERS');
let approverId;

// находим "APPROVER: true" среди USERS в config'e и записываем ID этого юзера в approverId
for (let i = 0; i < users.length; i++) {
    if (Object.values(users[i])[1]) {
        approverId = Object.values(users[i])[0];
    }
}

const convertToLocale = function (str) {
    return parseInt(str).toLocaleString('ru-RU');
};

app.post('/', (req, res) => {
    const appData = req.body;
    console.log(appData)
    const userId = appData.userId,
        userName = appData.userName,
        firstName = appData.firstName,
        lastName = appData.lastName,
        vin = appData.form.vin,
        rrc = appData.form.rrc,
        days = appData.form.days,
        sell = appData.form.sell,
        entry = appData.form.entry,
        kv = appData.form.kv,
        confirmAndDeclineBtns = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Подтвердить',
                            callback_data: JSON.stringify({
                                status: 'confirm',
                                senderId: userId,
                            }),
                        },
                    ],

                    [
                        {
                            text: 'Отклонить',
                            callback_data: JSON.stringify({
                                status: 'decline',
                                senderId: userId,
                            }),
                        },
                    ],
                ],
            },
        };
    let result = parseInt(sell) - parseInt(entry) + parseInt(kv);

    // отправка апруверу данных из формы для подтверждения
    bot.sendMessage(
      approverId,
  `от: ${firstName} ${lastName} (${userName})
  VIN: ${vin}
  РРЦ: ${convertToLocale(rrc)}
  Дней на складе: ${convertToLocale(days)}
  Продажа: ${convertToLocale(sell)}
  Вход: ${convertToLocale(entry)}
  КВ ОФУ: ${convertToLocale(kv)}
  Итого: ${convertToLocale(result)}`,
      confirmAndDeclineBtns //инлайн кнопки
    );

    res.json({ message: 'Data received' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
