#!/usr/bin/env node
const git = require('git-last-commit');
const fs = require("fs")
const { exec } = require("child_process");
const micromatch = require('micromatch');
const path = require("path");

console.log(process.argv)

const dir = fs.realpathSync(process.argv[2] || process.cwd())
console.log("Dir:", dir)

const getLastCommit = (options) => {
    return new Promise(((resolve, reject) => {
        git.getLastCommit(function(err, commit) {
            if (err) return reject(err)
            return resolve(commit)
        }, options)
    }))
}

const getChangedFilesSince = (hash, dir) => {
    return new Promise(((resolve, reject) => {
        exec(`cd ${dir} && git diff-tree --no-commit-id --name-only -r ${hash}`, (error, stdout, stderr) => {
            if (error) {
                return reject(error)
            }
            if (stderr) {
                return reject(stderr)
            }

            return resolve(stdout.split('\n').filter(s => s.length))
        });
    }))
}

const main = async () => {
    const configPath = dir+"/pullmaster.config.js"
    if (!fs.existsSync(configPath)) {
        return console.error("No pullmaster config!")
    }

    const config = require(configPath)
    console.log(config)

    let commit
    try {
        commit = await getLastCommit({dst: dir})
    } catch (err) {
        console.error(err)
        return
    }
    console.log(commit.hash)
    const files = await getChangedFilesSince(commit.hash, dir)

    Object.keys(config).forEach(taskName => {
        const task = config[taskName]
        const matchingFiles = micromatch(files, task.glob)
        if (matchingFiles.length) {
            console.log(`Запуск задачи ${taskName} (${task.description}), вызвавшие файлы:`)
            matchingFiles.forEach(file => console.log(file))
        }
    })
    console.log(micromatch(files, "app/**/Events.*"))
}
main()