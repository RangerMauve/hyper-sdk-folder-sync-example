#!/usr/bin/env node
import { create } from 'hyper-sdk'
// import { parseArgs } from 'node:util'
import Hyperdrive from 'hyperdrive'
import Localdrive from 'localdrive'

const url = process.argv[2]

if (!url.startsWith('hyper://')) {
  console.log('Please specify a `hyper://` URL to load')
  process.exit(1)
}

const sdk = await create({
  storage: false
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

const location = process.argv[3] || process.cwd()

const local = new Localdrive(location)

console.log(`Syncing with folder \n\t${location}`)

const mirror = drive.mirror(local, {
  filter: (key) => !key.startsWith('/.') && !key.startsWith('/node_modules')
})

for await (const { op, key } of mirror) {
  console.log(`${op}: ${key}`)
}

console.log('Sync complete', mirror.count)

// TODO: Listen to peer join/remove
await sdk.close()
