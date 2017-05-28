var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var firebase = require('firebase');

app.set('port', process.env.PORT || 3000);

var clients = [];

firebase.initializeApp({
    // serviceAccount: "./gamedev-service-account.json",
    apiKey: "AIzaSyBOomMPoBi11mrpyDKnLtGqy2OsBUdFQGY",
    databaseURL: "https://gamedev-50e4c.firebaseio.com",
    projectId: "gamedev-50e4c",
});

var databaseRef = firebase.database().ref("account");
var payload = {};

// winning update score to firebase
// payload['account/'+accountName+"/"+score] = message;
// databaseRef.update(payload);
// databaseRef.child('/Jub/score').on("value", function(snapshot) {
//     console.log(snapshot.val());
//     payload['/Jub/score'] = 2;
//     databaseRef.update(payload);
// }, function (errorObject) {
//   console.log("The read failed: " + errorObject.code);
// });
// databaseRef.push({
//     text:"ddd"
// });

io.on("connection", function (socket) {
    var currentUser;
    var towers;
    // var paths = [];

    socket.on("USER_CONNECT", function () {
        console.log("User connected");
        for (var i = 0; i < clients.length; i++) {
            // socket.emit("USER_CONECTED", { name:clients[i].name, position:clients[i].position })
            socket.emit("USER_CONECTED", { name: clients[i].name, size: clients.length })

            console.log("User name" + clients[i].name + " is connected");
        }
    });

    socket.on("PLAY", function (data) {
        console.log(data);
        currentUser = {
            name: data.name,
            position: data.position
        }

        clients.push(currentUser);
        socket.emit("PLAY", currentUser);
        socket.broadcast.emit("USER_CONNECTED", currentUser);
    });

    socket.on("LOGIN", function (data) {
        console.log(data);
        currentUser = {
            name: data.name,
            size: clients.length
        }

        clients.push(currentUser);
        socket.emit("LOGIN", currentUser);
        socket.broadcast.emit("USER_CONNECTED", currentUser);
    });

    socket.on("MOVE", function (data) {
        currentUser.position = data.position;
        socket.emit("MOVE", currentUser);
        console.log(currentUser.name + "move to " + currentUser.position)
    });

    socket.on("CREEP_LEVEL", function (data) {
        // var level = data.level;
        console.log("Wave Level UP");
        socket.broadcast.emit("UPGRADE_WAVE", { status: "true" });
    });

    socket.on("LOSE_LIFE", function (data) {
        // var level = data.level;
        console.log("LOSE LIFE");
        socket.broadcast.emit("UPGRADE_LIFES", { status: "true" });
    });

    socket.on("LOSE_GAME", function (data) {
        // var level = data.level;
        console.log("LOSE GAME");
        socket.broadcast.emit("WIN_GAME", { status: "true" });
    });

    socket.on("CREATE_TOWER", function (data) {
        // currentUser.position = data.position;

        towers = {
            type: data.type,
            position: data.position,
            tag: data.tag
        }
        console.log("DO FUNCTION CREATE TOWER" + towers.type + towers.position);
        socket.broadcast.emit("CREATE_TOWERS", towers);
        console.log(towers.type + " position " + towers.position)
    });

    socket.on("PATH", function (data) {
        // currentUser.position = data.position;

        paths.push(data.position);
        console.log("Get Path" + data.position);
        // socket.broadcast.emit("CREATE_TOWERS", towers);
        // console.log(towers.type+" position "+towers.position)
    });

    socket.on("disconnect", function () {
        socket.broadcast.emit("USER_DISCONNECTED", currentUser);
        for (var i = 0; i < clients.length; i++) {
            if (currentUser && clients[i].name === currentUser.name) {
                console.log("User" + clients[i].name + " disconnected");
                clients.splice(i, 1);
            }
        }
    });
    socket.on("ELEMENT_CHANGING", function (data) {
        console.log("Element Changing " + data.element);
        var element = {
            element: data.element
        }
        socket.broadcast.emit("ELEMENT_CHANGE", element);
    });
    socket.on("DIE_DIE_DIE", function (data) {
        console.log("DIE DIE DIE " + data.tag);
        var element = {
            tag: data.tag
        }
        socket.broadcast.emit("HERO_NEVER_DIE", element);
    });
    socket.on("STORE_SCORE", function (data) {
        console.log("Player List " + clients);
        console.log("Player name " + currentUser);
        console.log("STORE SCORE " + parseInt(data.playerno));
        var indexPlayer = parseInt(data.playerno) - 1;
        if (clients[indexPlayer]) {
            databaseRef.child(clients[indexPlayer].name).child("score").on("value", function (snapshot) {
                //  console.log(snapshot.val());
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
            payload[clients[indexPlayer].name + "/score"] = parseInt(snapshot.val()) + 1;
            databaseRef.update(payload);
        }
    });
    socket.on("SELL_TOWER", function (data) {
        console.log("SOLD tower " + data.tag);
        towers = {
            tag: data.tag
        }
        socket.broadcast.emit("SOLD_TOWER", towers);
    });
    socket.on("UPGRADE_TOWER_ELEMENT", function (data) {
        console.log("Upgrade tower " + data.tag);
        towers = {
            tag: data.tag,
            element: data.element
        }
        socket.broadcast.emit("UPGRADED_TOWER_ELEMENT", towers);
    });
});

server.listen(app.get('port'), function () {
    console.log('----------Server is running----------');
});