module.exports = ({
    runMigrations: {
        description: "Применение миграций базы данных",
        glob: "app/**/Events.*",
        commands: [
            "php ./spark migrate"
        ]
    },
    compileFrontend: {
        description: "Пересборка фронтенда",
        glob: "frontend/**/*.*",
        commands: [
            "cd frontend && yarn build"
        ]
    }
})