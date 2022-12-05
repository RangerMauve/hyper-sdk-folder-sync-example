# hyper-sdk-folder-sync-example
Example Node.js project for syncing to and from Hyperdrives with Hyper-SDK@4

## How it works

This example uses [Hyperdrive](https://github.com/hypercore-protocol/hyperdrive-next) to send p2p files over the [Hyperswarm network](https://github.com/hyperswarm/hyperswarm) using [Hyper-SDK](https://github.com/RangerMauve/hyper-sdk) and the [Mirror-Drive](https://github.com/holepunchto/mirror-drive) API.

`push.js` takes a folder path (or the current working directory) and uploads data (except for things starting with `.` or `node_modules/`) into an in-memory Hyperdrive.

It then starts advertising the hyperdrive's data on hyperswarm via the hyperdrive's discovery key.

It also prints the `hyper://` URL of the hyperdrive.

Then, other users may use `pull.js` with the URL of the hyperdrive (and an optional folder path) to pull changes from the drive to their local computer.

You can see your swarm ID and the incoming / disconnecting peers as the sync takes place.

Note that this example doesn't persist data locally, and it's up to you to figure out how to manage storage if you're making more complex APIs.

For an easy to use service for publishing to hyperdrive, check out [Distributed Press](https://distributed.press/).

```
./push.js ./my_folder
./pull.js hyper://blog.mauve.moe ./my_other_folder
```
