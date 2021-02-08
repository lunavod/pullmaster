# PullMeister - execute tasks after git pull

Config file example `pullmeister.config.js`
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
    migrate: {
        description: "Run db migrations",
        glob: "app/Database/Migrations/*.php",
        commands: [
            "php ./spark migrate"
        ]
    },
    compileFrontend: {
        description: "Rebuild frontend",
        glob: "frontend/**/*.*",
        commands: [
            ["yarn build", {dir: "./frontend"}]
        ]
    }
})
```

Place config file on your repo's root, then run a command `pullmeister` (or just `pm`).
Script will execute git pull, then match received files with glob patterns from a config file, 
and run matching tasks.

Rebuild your frontend, migrate database, and more!