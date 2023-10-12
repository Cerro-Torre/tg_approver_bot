'use strict';
window.addEventListener('DOMContentLoaded', function () {
    const SERVER_URL = '';
    const tg = window.Telegram.WebApp;
    let form = document.form,
        vin = form.elements.vin,
        rrc = form.elements.rrc,
        days = form.elements.days,
        sell = form.elements.sell,
        entry = form.elements.entry,
        kv = form.elements.kv,
        format = document.querySelector('.format');

    tg.MainButton.setText('Отправить');
    tg.MainButton.hide();

    // отображение/удаление Main Button
    form.addEventListener('input', (e) => {
        e.preventDefault();
        if (
            vin.value &&
            rrc.value &&
            days.value &&
            sell.value &&
            entry.value &&
            kv.value
        ) {
            tg.MainButton.show();
        } else tg.MainButton.hide();
    });

    // форматирование чисел
    form.addEventListener('input', (e) => {
        let temp = parseInt(e.target.value).toLocaleString('ru-RU');
        format.innerHTML = temp;
    });

    // проверкиа типа данных. если тип поля объекта
    // не число - возвращает true
    function dataTypeisNaN(object) {
        for (let keys in object) {
            if (isNaN(+object[keys])) {
                alert(`Данные должны содержать только цифры`);
                return true;
            }
        }
        return false;
    }

    // отправка данных через тестовую кнопку
    //     form.addEventListener('submit', async (e) => {
    //         e.preventDefault();
    //         console.log('clicked!!!')
    //         const formData = new FormData(form);

    //         const formObj = {};
    //         formData.forEach((value, key) => {
    //             formObj[key] = value;
    //         });

    //         alert(JSON.stringify(formObj));

    //         if (dataTypeisNaN(formObj) === false) {
    //             if (vin.value.length === 4) {
    //                 await fetch('SERVER_URL', {
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                     body: JSON.stringify({
    //                         chatId: tg.initDataUnsafe?.chat?.id,
    //                         userName: tg.initDataUnsafe?.user?.username,
    //                         firstName: tg.initDataUnsafe?.user?.first_name,
    //                         lastName: tg.initDataUnsafe?.user?.last_name,
    //                         userId: tg.initDataUnsafe?.user?.id,
    //                         form: formObj,
    //                     }),
    //                 })
    //                 // .then((body) => {console.log(body)})
    //                     .then((data) => {
    //                         console.log('Message sent:', data);
    //                         alert('Данные отправлены успешно.');
    //                     })
    //                     .catch((error) => {
    //                         console.error('Error:', error);
    //                         alert(`Произошла ошибка, повторите позже.\n${error}`);
    //                     });
    //                 form.reset();
    //                 tg.MainButton.hide();
    //                 format.innerHTML = '';
    //            }
    //             else {
    //                 alert('Поле VIN должно содержать последние 4 цифры номера');
    //                 form.vin.value = '';
    //                 tg.MainButton.hide();
    //                 format.innerHTML = '';
    //             }
    //         } else {
    //             form.reset();
    //             tg.MainButton.hide();
    //             format.innerHTML = '';
    //         }
    //    })

    // отправка данных через Main Button
    Telegram.WebApp.MainButton.onClick(async () => {
        const formData = new FormData(form);

        const formObj = {};
        formData.forEach((value, key) => {
            formObj[key] = value;
        });

        console.log(formObj);

        if (dataTypeisNaN(formObj) === false) {
            if (vin.value.length === 4) {
                await fetch(SERVER_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chatId: tg.initDataUnsafe?.chat?.id,
                        userName: tg.initDataUnsafe?.user?.username,
                        firstName: tg.initDataUnsafe?.user?.first_name,
                        lastName: tg.initDataUnsafe?.user?.last_name,
                        userId: tg.initDataUnsafe?.user?.id,
                        form: formObj,
                    }),
                })
                    .then((data) => {
                        console.log('Message sent:', data);
                        alert('Данные отправлены успешно.');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        alert(`Произошла ошибка, повторите позже.\n${error}`);
                    });
                form.reset();
                tg.MainButton.hide();
                format.innerHTML = '';
            } else {
                alert('Поле VIN должно содержать последние 4 цифры номера');
                form.vin.value = '';
                tg.MainButton.hide();
                format.innerHTML = '';
            }
        } else {
            form.reset();
            tg.MainButton.hide();
            format.innerHTML = '';
        }
    });
});
