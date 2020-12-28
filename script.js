const ctx = canvas.getContext('2d')
ctx.font = "50px sans-serif"

const myId = location.hash.replace('#', '') || ("Leobite_" + Math.round(Math.random() * 100000000))
identifier.innerText = myId
const peer = new Peer(myId)
let connection = {}
let pinging = false
let lastPingStamp
let pingTimeout

function doPing() {
  connection.send({
    ping: new Date()/1
  })
  lastPingStamp = new Date()/1
  pingTimeout = false
  
  // kijk of er verder gepingt moet worden recurse
  if(pinging)
    startPinging()
}

function startPinging() {
  pinging = true
  
  // lastpingstamp ud? ping meteen
  if(!lastPingStamp) {
    doPing()
  }
  // laaste ping < 1000ms geleden? timeout naar 1000ms
  //lastPingStamp < new Date()/1 - 1000
  else if(!pingTimeout) {
    pingTimeout = setTimeout(doPing, 1000)
  }
}

// "server"
peer.on('connection', function(conn) {
  conn.on('data', function(data) {
    if(data.ping) {
      conn.send({
        ping: data.ping
      })
    }
    if(data.pong) {
      console.log("ping:", data.pong)
    }
  })
})

// "client"
connectButton.addEventListener('click', function() {
  if(connection.open)
    return
  
  connection = peer.connect(connectionPeer.value)
  console.log(connection)
  
  connection.on('open', function(data) {
    connectionPeer.style.display = "none"
    connectButton.style.display = "none"
    stopPing.style.display = "block"
    sendPing.style.display = "block"
    sendPing.addEventListener('click', startPinging)
    
    console.log(
      "Connection opened",
      new Date() / 1,
      connection.peer,
      connection.reliable,
    )
  })
  
  connection.on('data', function(data) {
    if(data.ping) {
      const ping = new Date()/1 - data.ping
      lastPingStamp = new Date()/1
      // console.log('full round-trip in ms', ping)
      
      window.requestAnimationFrame(function() {
        ctx.clearRect(0,0,400,300)
        ctx.fillText(ping, 50, 80)
      })
      
      // if(pinging)
        // startPinging()
    }
  })
})
stopPing.addEventListener('click', function() {
  pinging = false
})
