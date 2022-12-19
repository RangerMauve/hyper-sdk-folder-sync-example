#!/usr/bin/env node
import { create } from 'hyper-sdk'
import { parseArgs } from 'node:util'

const options = {
  storage: { type: 'string', short: 's'}
}

const { storage } = parseArgs({ options }).values

const sdk = await create({
  storage: storage // TODO: Where should the default location for storage be?
})

console.log(sdk.publicKey.toString('hex'))

await sdk.close()
