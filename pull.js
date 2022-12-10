#!/usr/bin/env node
import { create } from 'hyper-sdk'
import { parseArgs } from 'node:util'
import Hyperdrive from 'hyperdrive'
import Localdrive from 'localdrive'
import MirrorDrive from 'mirror-drive'

const options = {
  url: { type: 'string', short: 'u' },
  location: { type: 'string', short: 'l' },
  storage: { type: 'string', short: 's'}
}

const { url, location, storage } = parseArgs({ options }).values

if (url === undefined || !url.startsWith('hyper://')) {
  console.log('Please pass a `hyper://` URL to the -u flag.')
  process.exit(1)
}

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

const core = await sdk.get(url)

console.log('Loaded core for URL')

const corestore = sdk.namespace('pull')

const drive = new Hyperdrive(corestore, core.key)

await drive.ready()

console.log('Created drive')

const local = new Localdrive(location ?? process.cwd())

console.log(`Syncing with folder \n\t${location}`)

const mirror = new MirrorDrive(drive, local, {
  filter: (key) => !key.startsWith('/.') && !key.startsWith('/node_modules')
})

for await (const { op, key } of mirror) {
  console.log(`${op}: ${key}`)
}

console.log('Sync complete', mirror.count)

// TODO: Listen to peer join/remove
await sdk.close()
