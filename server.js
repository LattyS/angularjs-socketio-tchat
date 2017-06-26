const path = require('path');
const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use( '/node_modules', express.static(path.join(__dirname, 'node_modules')) ); // Permet au client de faire des requêtes pour aller chercher les node_modules sur http://localhost:1337/node_modules
app.use( express.static(path.join(__dirname, 'public')) ); // Sert par défaut le dossier /public sur http://localhost:1337

// Au lancement du serveur, la liste des utilisateurs est vide (normal)
let usersList = [];

// Un nouvel utilisateur (représenté ici par la variable 'socket') vient de se connecter
io.on('connection', socket => {

    // On initialise par défaut un utilisateur vide
    const currentUser = {
        id     : null,
        pseudo : null
    };

    socket.on('setPseudo', pseudo => {
        /* Le nouvel utilisateur vient de nous envoyer son pseudo, il faut donc :
            1) modifier l'objet 'currentUser' et l'ajouter à notre 'usersList' serveur
            2) renvoyer à ce nouvel utilisateur cette même 'usersList' des membres déjà présents (pour qu'il sache qui est en ligne)
            3) notifier tous les autres connectés que cet utilisateur vient d'arriver sur le channel
        */

        // 1)
        currentUser.id     = socket.id;
        currentUser.pseudo = pseudo;
        usersList.push(currentUser);

        // 2)
        socket.emit('usersList', usersList);

        // 3) le 'modifier' broadcast permet d'envoyer à tout le monde SAUF à ce socket là : https://socket.io/docs/server-api/#flag-broadcast
        socket.broadcast.emit('newUser', currentUser);
    });

    // Le serveur reçoit de cet utilisateur un nouveau message (sous forme de texte), il le redistribue (broadcast) à tous les autres connectés
    socket.on('message', (message) => {
        socket.broadcast.emit('message', {
            pseudo : currentUser.pseudo,
            text   : message 
        });
    });

    // Le serveur est informé que cet utilisateur vient de quitter le chat (événement natif 'disconnect' de Socket.io)
    socket.on('disconnect', () => {
        /* Il faut donc :
            1) notifier tous les autres connectés que cet utilisateur vient de partir (pour qu'ils puissent mettre à jour leur propre liste)
            2) supprimer cet utilisateur de notre 'usersList' serveur
        */

        // 1)
        socket.broadcast.emit('userDisconnected', currentUser);

        // 2)
        usersList = usersList.filter(user => user !== currentUser); // Petit .filter sur un Array JavaScript (c.f. https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/filter)
    });

    socket.on('message', (message) => {
        socket.broadcast.emit('message', {pseudo:user.pseudo, text:message});
    });

}); // Fin du "onconnection"

const port = process.env.PORT || 1337;
server.listen(port, () => console.log(`Le serveur écoute sur le port ${port}`));