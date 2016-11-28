# Цель

Более тесная интеграция Vue с Sails. History API роутинг без перезагрузки с пререндерингом на сервере.

# Рассуждение

1. Мы используем клиентскую шаблонизацию и клиентский роутер,
   поэтому чтобы избежать дублирования кода, мы не будем использовать
   контроллеры, шаблонизацию и роутер sails для страниц приложения,
   а будем использовать их только для API. Но отказываясь от контроллеров,
   мы также отказываемся от постраничных политик и responses. Также,
   используя клиентский роутер, мы теряем возможность указывать статус коды.
2. Чтобы сохранить статус коды и постраничные политики, нужно полноценное SSR,
   с переносом соответствующей логики в клиетский код и возможностью определить
   результат на этапе SSR. Это также предоставит возможности для SEO
   (что потребует механизма управления head в рантайме) и кеширования HTML.
3. Поскольку html может отдаваться с разных адресов, ссылки на ассеты
   должны быть либо абсолютные, либо генерироваться в процессе рендеринга.

# Дополнительные функции

1. ES6 features.
2. ES6 modules. Потенциально снижает размер бандла. Делают некомфортной работу
   с sourcemaps из-за переименования переменных.
2. SFC (single file components). Упрощает работу со стилями и шаблонами,
   позволяет использовать облегченный рантайм (меньше размер файла,
   выше производительность), позволяет использовать готовые компоненты.
   Затрудняет сборку (нужно вытаскивать css из js).
3. Hot-reload. Упрощает разработку, позволяя обновлять шаблоны и стили
   без перезагрузки страницы. Требует SFC. Усложняет код сервера (нужно
   подключать middleware). В сложных ситуациях может вести себя некорректно.

# Потенциальные проблемы в существующей реализации

- Пустой пароль не захешируется
  - @REFERNCE: Passport::hashPassword
- Из-за одноименного поля для пароля и хеша, обновление паспорта может спровоцировать двойное хеширование пароля
  - @REFERNCE: Passport::beforeUpdate
- Отсутствует next у вызовов passport.authenticate, что может привести к сложноотлаживаемым проблемам
- Сессионная кука sails.sid не просрачивается, поэтому от пляски с remember-me смысла нет
- methodOverride включен, что делает API, возвращающие массивы, небезопасными

# Изменения

+ Изменил usernameField на значение по умолчанию (login -> username)
+ Изменил имя конфига, значение key и имя поля в паспорте для RememberMeStrategy
  + Имя конфига: rememberme -> rememberMe
  + Значение key: token -> app.remember-me
  + Значение поля в паспорте: rememberme -> remember-me
+ Разобрал сервис паспорта на части
  + Логика проверки паспортов: статичные методы модели Passport
  + Инициализация паспорта и стратегий, сериализация и десериализация: bootstrap
  + Логика действий при логине/логауте: AuthController и rememberMe
+ При разлогине уничножаются не все паспорта remember-me, а только текущий (из соответствующей куки)
+ Убрал tryAgain (не актуально для API сервера)
+ Установил длительность сессионной куки sails.sid в один день
- Просроченные паспорта remember-me не считаются валидными

# Уроки

- Поскольку рендерер готов не сразу, нужно создавать его в bootstrap.js
- Для Hot-reload нужно подключать middleware в http.js
- Code splitting и SSR не очень дружат

# Chores

- Причесать responses под один формат
  - ok(data, { actions, context });
  - badRequest(message, data, { actions, error, context });
  - serverError(message, data, { actions, error, context });
  - forbidden(message, data, { actions, error, context });
  - notFound(message, data, { actions, error, context });
- Логирование
- Роли

# Не реализовано

- Регистрация
- Логин и по email и по username
- Другие стратегии логина (через провайдеров)

---

## Features
- Status codes
- Shared roles and politics between Sails и Vue
- Relative links instead of html-base
  - Separate `/app-one` and `/app-two` should be handled correctly, including cross links and history stack.

## Dev experience
- Bower support (bundle or wiredep-like mechanism)
- Sourcemaps
- Hot-reload

## Production
- CSS extraction
- Minification

## Postponed
- CORS
- Internationalization
- SEO (description, canonical, meta)
- HTML caching
- Streaming SSR
- Asset caching
