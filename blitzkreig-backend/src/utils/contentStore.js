'use strict'

const fs = require('fs/promises')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../../data')

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

async function readJson(fileName, fallbackValue) {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, fileName)

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    const initialValue = JSON.parse(JSON.stringify(fallbackValue))
    await fs.writeFile(filePath, `${JSON.stringify(initialValue, null, 2)}\n`, 'utf8')
    return initialValue
  }
}

async function writeJson(fileName, value) {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, fileName)
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  return value
}

function nextId(items) {
  return items.reduce((max, item) => {
    const id = Number(item.id) || 0
    return id > max ? id : max
  }, 0) + 1
}

module.exports = {
  DATA_DIR,
  ensureDataDir,
  nextId,
  readJson,
  writeJson,
}