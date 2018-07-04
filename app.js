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
const socket = require('socket.io');
const history = require('connect-history-api-fallback');

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
dotenv.load({ path: '.env' });

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


// /**
//  * API keys and Passport configuration.
//  */
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
//  */
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

const appRouter = express.Router();
const apiRouter = express.Router();

// const staticFileMiddleware = express.static(path.join(__dirname + '/public'))
// appRouter.use(staticFileMiddleware);
// appRouter.use(history({
//   disableDotRule: true,
//   verbose: true
// }));

// app.get('/', function (req, res) {
//   res.render(path.join(__dirname + '/public/index.html'));
// });

appRouter.get('/', (req, res, next) => {
  res.sendFile(path.resolve("./public/index.html"));
})

app.use('/', appRouter);
app.use('/api/v1', apiRouter);

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

// /**
//  * API examples routes.
//  */
app.get('/api', apiController.getApi);
app.get('/api/steam', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
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

// /**
//  * OAuth authentication routes. (Sign in)
//  */
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
apiRouter.get('/auth/facebook/student', passport.authenticate('facebook-student', { scope: ['email', 'public_profile'] }));
apiRouter.get('/auth/facebook/student/callback', passport.authenticate('facebook-student', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
apiRouter.get('/auth/facebook/company', passport.authenticate('facebook-company', { scope: ['email', 'public_profile'] }));
apiRouter.get('/auth/facebook/company/callback', passport.authenticate('facebook-company', { failureRedirect: '/login' }), (req, res) => {
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
apiRouter.get('/auth/linkedin/student', passport.authenticate('student-linkedin', { state: 'SOME STATE' }));
apiRouter.get('/auth/linkedin/student/callback', passport.authenticate('student-linkedin', { failureRedirect: '/auth/student/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

apiRouter.get('/auth/linkedin/company', passport.authenticate('company-linkedin', { state: 'SOME STATE' }));
apiRouter.get('/auth/linkedin/company/callback', passport.authenticate('company-linkedin', { failureRedirect: '/auth/student/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

// /**
//  * OAuth authorization routes. (API examples)
//  */
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
apiRouter.post('/student/login', studentDataReceiverController.login);
apiRouter.post('/company/login', companyDataReceiverController.login);

// Authenticate
apiRouter.post('/authenticate', authenticatorController.authenticate);

//Check Verification
apiRouter.get('/getVerificationToken', authenticatorController.sendVerificationToken);
// Signup
apiRouter.post('/student/signup', studentDataReceiverController.postSignup);
apiRouter.post('/company/signup', companyDataReceiverController.postSignup);

// Verification
apiRouter.get('/student/account/authenticate',studentDataReceiverController.verifyStudent);
apiRouter.get('/company/account/authenticate',companyDataReceiverController.verifyCompany);
// Students

apiRouter.get('/students/get', authenticatorController.verifyToken,studentDataProviderController.getStudent);
apiRouter.delete('/students/delete', authenticatorController.verifyToken, studentDataReceiverController.deleteStudent);
apiRouter.get('/students/all', authenticatorController.verifyToken,  studentDataProviderController.getAllStudents);
apiRouter.put('/students/update', authenticatorController.verifyToken, studentDataReceiverController.updateStudent);

// Companies

apiRouter.get('/companies/get', authenticatorController.verifyToken, companyDataProviderController.getCompany);
apiRouter.delete('/companies/delete', authenticatorController.verifyToken, companyDataReceiverController.deleteCompany);
apiRouter.put('/companies/update', authenticatorController.verifyToken, companyDataReceiverController.updateCompany);


// Projects
apiRouter.get('/projects/all', authenticatorController.verifyToken, projectDataProviderController.getAllProjects);
apiRouter.post('/projects/new', authenticatorController.verifyToken, projectDataReceiverController.createProject);
apiRouter.get('/projects/get', authenticatorController.verifyToken, projectDataProviderController.getProject);
apiRouter.post('/projects/upvotes', authenticatorController.verifyToken, projectDataReceiverController.addUpvotes);
apiRouter.post('/projects/upvotes/remove', authenticatorController.verifyToken, projectDataReceiverController.removeUpvotes);
apiRouter.put('/projects/update', authenticatorController.verifyToken, projectDataReceiverController.updateProject)
apiRouter.delete('/projects/delete', authenticatorController.verifyToken, projectDataReceiverController.deleteProject);

apiRouter.post('/projects/addStudentView', authenticatorController.verifyToken, projectDataReceiverController.addStudentViews);
apiRouter.post('/projects/addCompanyView', authenticatorController.verifyToken, projectDataReceiverController.addCompanyViews);

// Company projects
apiRouter.get('/companyprojects/all', authenticatorController.verifyToken, companyProjectDataProviderController.getAllProjects);
apiRouter.get('/companyprojects', authenticatorController.verifyToken, companyProjectDataProviderController.getProject);
apiRouter.post('/companyprojects', authenticatorController.verifyToken, companyProjectDataReceiverController.createCompanyProject);
apiRouter.put('/companyprojects', authenticatorController.verifyToken, companyProjectDataReceiverController.updateCompanyProject);
apiRouter.delete('/companyprojects', authenticatorController.verifyToken, companyProjectDataReceiverController.deleteCompanyProject);
apiRouter.post('/companyprojects/upvotes', authenticatorController.verifyToken, companyProjectDataReceiverController.addUpvotes);
apiRouter.post('/companyprojects/upvotes/remove', authenticatorController.verifyToken, companyProjectDataReceiverController.removeUpvotes);


// Contests
apiRouter.get('/contests/all', authenticatorController.verifyToken, contestDataProviderController.getAllContests);
apiRouter.post('/contests/new', authenticatorController.verifyToken, contestDataReceiverController.createContest);
apiRouter.get('/contests/get', authenticatorController.verifyToken, contestDataProviderController.getContest);
apiRouter.put('/contests/update', authenticatorController.verifyToken, contestDataReceiverController.updateContest);
apiRouter.post('/contests/registrations', authenticatorController.verifyToken, contestDataReceiverController.addRegistrations);
apiRouter.post('/contests/registrations/remove', authenticatorController.verifyToken, contestDataReceiverController.removeRegistrations);
apiRouter.delete('/contests/delete', authenticatorController.verifyToken, contestDataReceiverController.deleteContest);


//Awards
apiRouter.get('/awards/all', authenticatorController.verifyToken, awardDataProviderController.getAllAwards);
apiRouter.get('/awards/get', authenticatorController.verifyToken, awardDataProviderController.getAward);
apiRouter.post('/awards/new', authenticatorController.verifyToken, awardDataReceiverController.createAward);
apiRouter.put('/awards/update', authenticatorController.verifyToken, awardDataReceiverController.updateAward);
apiRouter.delete('/awards/delete', authenticatorController.verifyToken, awardDataReceiverController.deleteAward);

// Attachments
apiRouter.get('/attachments', authenticatorController.verifyToken, attachmentProviderController.getAttachments);
// apiRouter.post('/attachments', authenticatorController.verifyToken, upload.single('file'), attachmentReceiverController.createAttachment);
apiRouter.delete('/attachments', authenticatorController.verifyToken, attachmentReceiverController.deleteAttachment);
apiRouter.post('/attachments/signedUrlGet', authenticatorController.verifyToken, attachmentReceiverController.signedUrlGet);
apiRouter.post('/attachments/signedUrlPut', attachmentReceiverController.signedUrlPut);

// Tags
apiRouter.get('/getalltags', authenticatorController.verifyToken, tagDataProviderController.getAllTags);
apiRouter.get('/tags', authenticatorController.verifyToken, tagDataProviderController.getTag);
apiRouter.post('/tags', authenticatorController.verifyToken, tagDataReceiverController.createTag);
apiRouter.put('/tags', authenticatorController.verifyToken, tagDataReceiverController.updateTag);
apiRouter.delete('/tags', authenticatorController.verifyToken, tagDataReceiverController.deleteTag);

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
