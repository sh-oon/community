let socketUri

//로컬
if (process.env.NODE_ENV === 'development') {
  // socketUri = "ws://192.168.1.152:7100"
  socketUri = "ws://localhost:8080"
}


//개발서버
if (process.env.NODE_ENV === 'production') {
  socketUri = "ws://localhost:8080"
}


//운영용


export {socketUri}