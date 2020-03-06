const socket = io()

socket.emit('startCall',{userId:'5de64bca7845634ca0cb0cd6'})

socket.on('userStatusDetail', (message) => {
    console.log('user status Details',message)
})


