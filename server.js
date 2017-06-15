const path = require('path');
const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use( express.static(path.join(__dirname, 'public')) );

var nbUsers = 0;
io.on('connection', socket => {
    nbUsers++;
    console.log(`Il y a maintenant ${nbUsers} connectés !`);

    socket.on('setPseudo', pseudo => {
        console.log(`${pseudo} vient de se connecter !` );
    });
    socket.on('disconnect', socket => {
        nbUsers--;
        console.log(`Il y a maintenant ${nbUsers} connectés !`);
    });
});


const port = process.env.PORT || 1337;
server.listen(port, () => console.log(`Le serveur écoute sur le port ${port}`));










































/*require('colors');
const path = require('path');
const express = require('express');

// Création de l'app Express
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use( express.static(path.join(__dirname, 'public')) );

io.on('connection', function(socket) {
    socket.on('msg', console.log);
});

const port = process.env.PORT || 1337;

http.listen(port, () => console.info(`✔ Le serveur écoute sur le port ${port}`.green));*/