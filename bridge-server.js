const server = require('ws').Server
const crypto = require('crypto')
const ws = new server({ port: 23000 })

const connectionMap = {}

console.log('Start server')

ws.on('connection', (socket) => {
  const uuid = crypto.randomUUID()
  socket.send('Request attributes.')

  let userName = { current: '' }

  socket.on('message', (ms) => {
    const message = JSON.parse(ms)
    const data = JSON.parse(message.data)

    switch (message.messageType) {
      case 'trackingData':
        if (message.userName.length <= 0) break
        Object.keys(connectionMap[message.userName]).forEach((uuid) => {
          const client = connectionMap[message.userName][uuid]
          if (client.connectionType === 'resoniteClient')
            client.socket.send(data)
        })
        break
      case 'websocketSetting':
        setVmConnectionAttribute(
          data.userName,
          data.connectionType,
          socket,
          userName,
          uuid,
        )
        console.log(
          `connected: {user:${data.userName}, type:${data.connectionType}}`,
        )
        break

      default:
        console.log('default')
        break
    }
  })

  socket.on('close', () => {
    if (userName.current in connectionMap) {
      const connection = connectionMap[userName.current][uuid]
      console.log(
        `closed: {user:${userName.current}, type:${connection.connectionType}}`,
      )
      delete connectionMap[userName.current][uuid]
    }
  })
})

const checkConnectionType = (connectionType) => {
  if (
    connectionType === 'resoniteClient' ||
    connectionType === 'webClient' ||
    connectionType === 'server'
  )
    return true
  return false
}

const setVmConnectionAttribute = (
  newUserName,
  connectionType,
  socket,
  userName,
  uuid,
) => {
  if (checkConnectionType(connectionType)) {
    if (userName.current in connectionMap)
      delete connectionMap[userName.current][uuid]
    if (!(newUserName in connectionMap)) connectionMap[newUserName] = {}
    connectionMap[newUserName][uuid] = {
      connectionType: connectionType,
      socket: socket,
    }
    userName.current = newUserName

    deleteEmptyList()
    console.log(connectionMap)
  }
}

const deleteEmptyList = () => {
  Object.keys(connectionMap).forEach((userName) => {
    if (Object.keys(connectionMap[userName]).length <= 0)
      delete connectionMap[userName]
  })
}
