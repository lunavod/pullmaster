# PullMeister - выполнение задач после git pull

Пример конфиг файла `pullmeister.config.js`
```js
module.exports = ({
    test: {
        description: "Test command",
        glob: "*.*",
        commands: [
            ["pwd", {dir: "../"}],
            "echo Done"
        ]
    },
    compileFrontend: {
        description: "Пересборка фронтенда",
        glob: "frontend/**/*.*",
        commands: [
            ["yarn build", {dir: "./frontend"}]
        ]
    }
})
```

После размещения конфиг файла в корне проекта, при вызове команды `pullmaster` скрипт выполнит `git pull`,
после чего проверит измененные файлы на соответствие глобам из конфига, и выполнит команды из подошедших задач.