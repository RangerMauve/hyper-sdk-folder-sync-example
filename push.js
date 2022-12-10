#!/usr/bin/env node
import { create } from 'hyper-sdk'
import { parseArgs } from 'node:util'
import Hyperdrive from 'hyperdrive'
import Localdrive from 'localdrive'
import MirrorDrive from 'mirror-drive'

console.log('Loading')

const options = {
  location: { type: 'string', short: 'l' },
  storage: { type: 'string', short: 's'}
}

const { location, storage } = parseArgs({ options }).values

const sdk = await create({
  storage: storage || false
})

console.log(`Own Swarm ID:\n\t ${sdk.publicKey.toString('hex')}`)

sdk.on('peer-add', ({publicKey}) => {
  console.log('Connected', publicKey.toString('hex'))
})

sdk.on('peer-remove', ({publicKey}) => {
  console.log('Disconnected', publicKey.toString('hex'))
})

process.on('SIGINT', () => {
  console.log('Clearing hypercore connections')
  sdk.close()
})

const corestore = sdk.namespace('push')

const drive = new Hyperdrive(corestore)

await drive.ready()

console.log(`Created drive\n\t ${drive.core.url}`)

const local = new Localdrive(location ?? process.cwd())

console.log(`Syncing with folder \n\t${location}`)

const mirror = new MirrorDrive(local, drive, {
  filter: (key) => !key.startsWith('/.') && !key.startsWith('/node_modules')
})

for await (const { op, key } of mirror) {
  console.log(`${op}: ${key}`)
}

console.log('Sync complete', mirror.count)

console.log('Joining network')

await sdk.join(drive.discoveryKey)

console.log('Joined! Waiting for connections')

console.log('Press Ctrl+C to stop the process')
console.log('Run the following on another machine to pull changes.')
console.log(`./pull.js ${drive.core.url}`)
