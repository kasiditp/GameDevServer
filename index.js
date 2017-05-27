var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);

var clients = [];

io.on("connection", function(socket){
    var currentUser;
    var towers;
    // var paths = [];

    socket.on("USER_CONNECT", function(){
        console.log("User connected");
        for( var i = 0; i < clients.length; i++){
            // socket.emit("USER_CONECTED", { name:clients[i].name, position:clients[i].position })
            socket.emit("USER_CONECTED", { name:clients[i].name, size:clients.length })

            console.log("User name"+ clients[i].name + " is connected");
        }
    });

    socket.on("PLAY", function(data){
        console.log(data);
        currentUser = {
            name:data.name,
            position:data.position
        }

        clients.push(currentUser);
        socket.emit("PLAY", currentUser);
        socket.broadcast.emit("USER_CONNECTED", currentUser);
    });

    socket.on("LOGIN", function(data){
        console.log(data);
        currentUser = {
            name:data.name,
            size:clients.length
        }

        clients.push(currentUser);
        socket.emit("LOGIN", currentUser);
        socket.broadcast.emit("USER_CONNECTED", currentUser);
    });

    socket.on("MOVE", function(data){
        currentUser.position = data.position;
        socket.emit("MOVE", currentUser);
        console.log(currentUser.name+"move to "+currentUser.position)
    });

    socket.on("CREEP_LEVEL", function(data){
        // var level = data.level;
        console.log("Wave Level UP");
        socket.broadcast.emit("UPGRADE_WAVE", {status:"true"});
    });

    socket.on("CREATE_TOWER", function(data){
        // currentUser.position = data.position;
        
        towers = {
            type:data.type,
            position:data.position
        }
        console.log("DO FUNCTION CREATE TOWER" + towers.type + towers.position);
        socket.broadcast.emit("CREATE_TOWERS", towers);
        console.log(towers.type+" position "+towers.position)
    });

    socket.on("PATH", function(data){
        // currentUser.position = data.position;
        
        paths.push(data.position);
        console.log("Get Path" + data.position);
        // socket.broadcast.emit("CREATE_TOWERS", towers);
        // console.log(towers.type+" position "+towers.position)
    });

    socket.on("disconnect", function(){
        socket.broadcast.emit("USER_DISCONNECTED", currentUser);
        for(var i = 0 ; i < clients.length; i++){
            if(clients[i].name === currentUser.name){
                console.log("User"+clients[i].name+" disconnected");
                clients.splice(i,1);
            }
        }
    });
    socket.on("ELEMENT_CHANGING", function(data){
        socket.broadcast.emit("ELEMENT_CHANGE", data.element);
    });
});

server.listen(app.get('port'), function(){
    console.log('----------Server is running----------');
});