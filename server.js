
const express = require('express');
const app = express();
const htmlRoutes = require('./app/routing/htmlRoutes');
const apiRoutes = require('./app/routing/apiRoutes');

// port for heroku and default port
const port = process.env.PORT || 5000; 

// now we can use public and data folders
app.use(express.static(__dirname + '/app/public'));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.json({ type: 'application/*+json' }));

//routes
app.use(htmlRoutes);
app.use(apiRoutes);

// use html and api files instead of putting them here
require('./app/routing/htmlRoutes.js');
require('./app/routing/apiRoutes.js');

// listener for console
app.listen(port, () => console.log(`listening on port ${port}!`));