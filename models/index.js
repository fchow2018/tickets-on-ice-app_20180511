var mongoose = require('mongoose');
/*add you connection somewhere here*/

const dbUrl = (process.env.MONGODB_URI || 'mongodb://localhost/tickets-on-ice', {useMongoClient: true}); // localhost
mongoose.connect(dbUrl);
mongoose.Promise = global.Promise;  // use native Promise

/* adding model User to index.js */
module.exports.User = require('./User');
/* adding model Ticket to index.js */
module.exports.Tickets = require('./Tickets');
