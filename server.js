const path = require('path');
const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use( express.static(path.join(__dirname, 'public')) );

const usersList = [];

io.on('connection', socket => {

    const user = {};

    socket.on('setPseudo', pseudo => {
        /* Un nouvel utilisateur (représenté ici par la variable 'socket') vient de se connecter et définir son pseudo, il faut donc :
            1) créer cet objet utilisateur et le stocker dans la liste du serveur
            2) donner à ce nouvel utilisateur la liste des membres déjà présents
            3) notifier tous les autres connectés que cet utilisateur vient d'arriver sur le channel
        */
 
        // 1) Création et stockage du nouvel utilisateur dans la liste de notre serveur (qui lui stocke un ID)
        let newUser = { id: socket.id, pseudo: pseudo };
        usersList.push(newUser);

        // 2) Envoi de la liste à ce nouvel utilisateur
        socket.emit('usersList', usersList);

        // 3) le 'modifier' broadcast permet d'envoyer à tout le monde SAUF à ce socket là : https://socket.io/docs/server-api/#flag-broadcast
        socket.broadcast.emit('newUser', newUser);

        user.pseudo = pseudo;
        
    });

    socket.on('disconnect', () => {
        /* Un utilisateur (représenté ici par la variable 'socket') vient de se déconnecter du tchat, il faut donc :
            1) notifier tous les autres connectés que cet utilisateur vient de partir
            2) supprimer cet utilisateur de la liste 'usersList' tenue par le serveur
        */

        // Récupération de l'objet utilisateur qui vient de se déconnecter
        let user = usersList.find( user => user.id === socket.id );
        
        // 1) On dit aux autres que cet user s'est déconnecté, pour qu'ils puissent mettre leur liste à jour
        socket.broadcast.emit('userDisconnected', user);
    });

    socket.on('message', (message) => {
        socket.broadcast.emit('message', {pseudo:user.pseudo, text:message});
    });

}); // Fin du "onconnection"

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