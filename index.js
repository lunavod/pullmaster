#!/usr/bin/env node
const fs = require("fs")
const { spawn } = require("child_process")
const spawnArgs = require("spawn-args")
const micromatch = require("micromatch")
const gitlog = require("gitlog").default
const chalk = require("chalk")
const simpleGit = require("simple-git")

const dir = fs.realpathSync(process.argv[2] || process.cwd())

const runCommand = async (command, options = {}) => {
    console.log(chalk`{green $} ${command}`)

    const commandName = command.split(" ")[0]
    const args = spawnArgs(command.slice(commandName.length))
    const p = spawn(commandName, args, {
        cwd: options.dir || dir,
        env: process.env,
        stdio: [process.stdout, process.stderr]
    })

    const code = await new Promise((resolve) => p.on("close", resolve))
    if (code !== 0) {
        console.error(
            chalk.red(`Command returned error, code ${code}!`)
        )
        throw new Error()
    }
}

const main = async () => {
    const configPath = dir+"/pullmeister.config.js"
    if (!fs.existsSync(configPath)) {
        return console.error("Config pullmeister.config.js not found")
    }

    const config = require(configPath)
    const lastCommit = gitlog({
        repo: dir,
        number: 1,
        fields: ["hash", "subject", "authorName", "authorEmail", "authorDate"]
    })[0]
    console.log(
        chalk`Last commit: {blue ${lastCommit.subject}} {yellow <${
            lastCommit.authorEmail
        }>} ${lastCommit.authorDate.split(" ").slice(0, 2).join(" ")} {gray [${
            lastCommit.hash
        }]}`
    )

    console.log(chalk`{blue Executing git pull...}`)
    const data = await simpleGit(dir).pull()
    // console.log(data)
    const files = data.files
    if (!files.length) {
        console.log(chalk`{green No updates!}`)
        return
    }

    const commits = gitlog({
        repo: dir,
        number: 100,
        fields: ["hash", "subject", "authorName", "authorEmail", "authorDate"],
    })
    console.log()
    console.log("Received commits:")
    for (let commit of commits) {
        if (commit.hash === lastCommit.hash) break
        console.log(
            chalk`{blue ${commit.subject}} {yellow <${
                commit.authorEmail
            }>} ${commit.authorDate.split(" ").slice(0, 2).join(" ")} {gray [${
                commit.hash
            }]}`
        )
    }

    for (const taskName of Object.keys(config)) {
        const task = config[taskName]
        const matchingFiles = micromatch(files, task.glob)
        if (matchingFiles.length) {
            console.log()
            console.log(
                chalk.green(
                    `${task.description} ${chalk.white("(" + taskName + ")")}`
                )
            )
            for (let command of task.commands) {
                try {
                    if (typeof command === "string") {
                        command = [command]
                    }
                    await runCommand(...command)
                } catch (err) {
                    return
                }
            }
        }
    }
    console.log()
    console.log(chalk.green("Done!"))
}
main()
