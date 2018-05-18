/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const socket = require('socket.io')
// const http = require('http');

/**
 * Create Express server.
 */
const app = express();



const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, new Date().toISOString() + file.originalname)
  }
})

const fileFilter = (req, file, callback) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'video/mp4') {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

// Authenticators
const authenticatorController = require('./controllers/api-guys/authenticator');

// Data Providers
const studentDataProviderController =  require('./controllers/api-guys/dataprovider/student');
const companyDataProviderController =  require('./controllers/api-guys/dataprovider/company');
const contestDataProviderController =  require('./controllers/api-guys/dataprovider/contest');
const projectDataProviderController =  require('./controllers/api-guys/dataprovider/project');
const awardDataProviderController = require('./controllers/api-guys/dataprovider/award');
const attachmentProviderController = require('./controllers/api-guys/dataprovider/attachment');
const companyProjectDataProviderController = require('./controllers/api-guys/dataprovider/companyproject');
const tagDataProviderController = require('./controllers/api-guys/dataprovider/tag');

// Data receivers
const studentDataReceiverController =  require('./controllers/api-guys/datareceiver/student');
const companyDataReceiverController =  require('./controllers/api-guys/datareceiver/company');
const contestDataReceiverController =  require('./controllers/api-guys/datareceiver/contest');
const projectDataReceiverController =  require('./controllers/api-guys/datareceiver/project');
const awardDataReceiverController = require('./controllers/api-guys/datareceiver/award');
const attachmentReceiverController = require('./controllers/api-guys/datareceiver/attachment');
const companyProjectDataReceiverController = require('./controllers/api-guys/datareceiver/companyproject');
const tagDataReceiverController = require('./controllers/api-guys/datareceiver/tag');


/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');


/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use((req, res, next) => {
//   if (req.path === '/api/upload') {
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user &&
    (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.use(cors({credentials: true, origin: true}));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/steam', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
app.get('/api/linkedin', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getLinkedin);
app.get('/api/instagram', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/lob', apiController.getLob);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.array('myFiles'), apiController.postFileUpload);
app.get('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
app.post('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
app.get('/api/google-maps', apiController.getGoogleMaps);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth authorization routes. (API examples)
 */
app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), (req, res) => {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), (req, res) => {
  res.redirect('/api/tumblr');
});
app.get('/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
app.get('/auth/steam/callback', passport.authorize('openid', { failureRedirect: '/api' }), (req, res) => {
  res.redirect(req.session.returnTo);
});
app.get('/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
app.get('/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/api/pinterest');
});


/* 
 API guys
*/

// Login
app.post('/student/login', studentDataReceiverController.login);
app.post('/company/login', companyDataReceiverController.login);

// Authenticate
app.post('/authenticate', authenticatorController.authenticate);


// Signup
app.post('/student/signup', studentDataReceiverController.postSignup);
app.post('/company/signup', companyDataReceiverController.postSignup);

// Students

app.get('/students/get', authenticatorController.verifyToken, studentDataProviderController.getStudent);
app.delete('/students/delete', authenticatorController.verifyToken, studentDataReceiverController.deleteStudent);
app.get('/students/all', authenticatorController.verifyToken,  studentDataProviderController.getAllStudents);
app.put('/students/update', authenticatorController.verifyToken, studentDataReceiverController.updateStudent);

// Companies

app.get('/companies/get', authenticatorController.verifyToken, companyDataProviderController.getCompany);
app.delete('/companies/delete', authenticatorController.verifyToken, companyDataReceiverController.deleteCompany);

// Projects
app.get('/projects/all', authenticatorController.verifyToken, projectDataProviderController.getAllProjects);
app.post('/projects/new', authenticatorController.verifyToken, projectDataReceiverController.createProject);
app.get('/projects/get', authenticatorController.verifyToken, projectDataProviderController.getProject);
app.post('/projects/upvotes', authenticatorController.verifyToken, projectDataReceiverController.addUpvotes);
app.post('/projects/upvotes/remove', authenticatorController.verifyToken, projectDataReceiverController.removeUpvotes);
app.put('/projects/update', authenticatorController.verifyToken, projectDataReceiverController.updateProject)
app.delete('/projects/delete', authenticatorController.verifyToken, projectDataReceiverController.deleteProject);


// Company projects
app.get('/companyprojects/all', authenticatorController.verifyToken, companyProjectDataProviderController.getAllProjects);
app.get('/companyprojects', authenticatorController.verifyToken, companyProjectDataProviderController.getProject);
app.post('/companyprojects', authenticatorController.verifyToken, companyProjectDataReceiverController.createCompanyProject);
app.put('/companyprojects', authenticatorController.verifyToken, companyProjectDataReceiverController.updateCompanyProject);
app.delete('/companyprojects', authenticatorController.verifyToken, companyProjectDataReceiverController.deleteCompanyProject);

// Contests
app.get('/contests/all', authenticatorController.verifyToken, contestDataProviderController.getAllContests);
app.post('/contests/new', authenticatorController.verifyToken, contestDataReceiverController.createContest);
app.get('/contests/get', authenticatorController.verifyToken, contestDataProviderController.getContest);
app.put('/contests/update', authenticatorController.verifyToken, contestDataReceiverController.updateContest);
app.post('/contests/registrations', authenticatorController.verifyToken, contestDataReceiverController.addRegistrations);
app.post('/contests/registrations/remove', authenticatorController.verifyToken, contestDataReceiverController.removeRegistrations);
app.delete('/contests/delete', authenticatorController.verifyToken, contestDataReceiverController.deleteContest);


//Awards
app.get('/awards/all', authenticatorController.verifyToken, awardDataProviderController.getAllAwards);
app.get('/awards/get', authenticatorController.verifyToken, awardDataProviderController.getAward);
app.post('/awards/new', authenticatorController.verifyToken, awardDataReceiverController.createAward);
app.put('/awards/update', authenticatorController.verifyToken, awardDataReceiverController.updateAward);
app.delete('/awards/delete', authenticatorController.verifyToken, awardDataReceiverController.deleteAward);

// Attachments
app.get('/attachments', authenticatorController.verifyToken, attachmentProviderController.getAttachments);
app.post('/attachments', authenticatorController.verifyToken, upload.single('file'), attachmentReceiverController.createAttachment);
app.delete('/attachments', authenticatorController.verifyToken, attachmentReceiverController.deleteAttachment);
app.post('/attachments/signedUrlGet', authenticatorController.verifyToken, attachmentReceiverController.signedUrlGet);
app.post('/attachments/signedUrlPut', authenticatorController.verifyToken, attachmentReceiverController.signedUrlPut);

// Tags
app.get('/getalltags', authenticatorController.verifyToken, tagDataProviderController.getAllTags);
app.get('/tags', authenticatorController.verifyToken, tagDataProviderController.getTag);
app.post('/tags', authenticatorController.verifyToken, tagDataReceiverController.createTag);
app.put('/tags', authenticatorController.verifyToken, tagDataReceiverController.updateTag);
app.delete('/tags', authenticatorController.verifyToken, tagDataReceiverController.deleteTag);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});



const io = socket(server);



io.on('connection', function(socket){
  console.log('User connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });  
  
  socket.on('emit_method', function(msg){
    console.log('message: ' + msg);
  }); 
  
});

global.io = io;

module.exports = app;
