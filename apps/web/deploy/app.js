'use strict';
// DomaiNesia cPanel Passenger starts this file (not `npm start`).
// Run only after uploading a successful standalone build into imtaq-app.
// Next.js standalone server.js will use the PORT supplied by Passenger.
process.env.NODE_ENV = 'production';
require('./server.js');
