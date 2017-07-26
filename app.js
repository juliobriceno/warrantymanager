var express = require("express");
var CSV = require("comma-separated-values");
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var session = require('client-sessions');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var MyMongo = require('./js/mymongo.js');
var fileUpload = require('express-fileupload');
var MyMail = require('./js/mails.js');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var google = require('googleapis');

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

var GOOGLE_CLIENT_ID = "827292123788-c239k97f0se0v2lmtr0l4gemr7085pev.apps.googleusercontent.com"
  , GOOGLE_CLIENT_SECRET = "7-XiBka0UpwhKYAchM69Odu9";

var googleapis = require('googleapis')
  , drive = googleapis.drive('v3')

var key = require('./path/serviceaccount.json');

var jwtClient = new googleapis.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/drive'
  ],
  null
);

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    //callbackURL: "http://vps-1299884-x.dattaweb.com:8081/auth/google/callback",
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
          return done(null, profile);
      });
  }
));

app.get('/auth/google', passport.authenticate('google', {
    scope: [
           'https://www.googleapis.com/auth/plus.login',
           'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

const fs = require('fs');

app.use(function (req, res, next) {
    var str = req.url;
    var patt = new RegExp(".git");
    var patt2 = new RegExp("node_modules");
    if ((req.url == '/app.js') || (patt.test(str) == true) || (patt2.test(str) == true) || (req.url == '/js/mymongo.js') || (req.url == '/js/mails.js')) {
        res.status(404).send("Not found");
    }
    else {
        next();
    }
});

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/", express.static(__dirname + '/'));

app.use(bodyParser.json());
app.use(fileUpload());

// must use cookieParser before expressSession
app.use(cookieParser());
app.use(expressSession({ secret: '#19DieciNueveNoviembre', resave: true, saveUninitialized: true }));

app.use("/", express.static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/getPanel', function (req, res) {
    if (typeof req.session.user != 'undefined') {
        res.sendFile(path.join(__dirname + '/uploadfile.html'));
    }
    else {
        res.sendFile(path.join(__dirname + '/login.html'));
    }
});

app.post('/closeSession', function (req, res) {
    delete req.session.user;
    res.end(JSON.stringify({ result: 'Ok' }));
});

app.post('/getSession', function (req, res) {
    var Data = {};
    if (typeof req.session.user != 'undefined') {
        Data.Email = req.session.user.Email;
    }
    else {
        Data.Email = 'nc';
    }
    res.end(JSON.stringify(Data));
});

// Cierra sesión
app.post('/api/Logout', function (req, res) {
    var Data = {};
    req.session.user = undefined;
    Data.Result = 'ok';
    res.end(JSON.stringify(Data));
});

// Cargar nuevo usuario
app.post('/NewUserRegister', function (req, res) {
    MyMongo.Find('Users', { strEmail: req.body.user.strEmail }, function (result) {
        var Data = {};
        if (result.length > 0) {
            Data.Result = 'userExist'
            res.end(JSON.stringify(Data))
        }
        else {
            MyMongo.Insert('Users', req.body.user, function (result) {
                if (result == 'Ok') {
                    req.session.user = req.body.user;
                    MyMongo.Insert('Messages', [{ email: req.session.user.strEmail, messagetype: 'alert alert-success alert-dismissible', messagetype2: 'text-danger', messagetype3: 'fa fa-warning', message: req.body.user.strFirstName + ' Thanks for use us!', message2: 'Now we work for you :) ...', read: false }, { email: req.session.user.strEmail, messagetype: 'alert alert-danger alert-dismissible', messagetype2: 'text-danger', messagetype3: 'fa fa-warning', message: req.body.user.strFirstName + ' Hey!', message2: 'You dont have any registered device ...', read: false }], function (result) {
                        if (result == 'Ok') {
                            req.session.messages = [{ email: req.session.user.strEmail, messagetype: 'alert alert-success alert-dismissible', messagetype2: 'text-danger', messagetype3: 'fa fa-warning', message: req.body.user.strFirstName + ' Thanks for use us!', message2: 'Now we work for you :) ...', read: false }, { email: req.session.user.strEmail, messagetype: 'alert alert-danger alert-dismissible', messagetype2: 'text-danger', messagetype3: 'fa fa-warning', message: req.body.user.strFirstName + ' Hey!', message2: 'You dont have any registered device ...', read: false }];
                            req.session.devices = [];
                            Data.Result = 'ok';
                            res.end(JSON.stringify(Data))
                        };
                    });
                };
            });
        }
    });
});

// Update user
app.post('/api/UpdateUser', function (req, res) {
    var Data = {};
    MyMongo.Remove('Users', { 'strEmail': req.body.user.strEmail }, function (result) {
        if (result == 'Ok') {
            MyMongo.Insert('Users', req.body.user, function (result) {
                if (result == 'Ok') {
                    Data.Result = 'ok';
                    req.session.user = req.body.user;
                    res.end(JSON.stringify(Data))
                };
            });
        };
    });
});

// Registrar un nuevo dispositivo
app.post('/api/NewDeviceRegister', function (req, res) {
    var Data = {};
    MyMongo.Remove('Devices', { 'email': req.session.user.strEmail }, function (result) {
        if (result == 'Ok') {
            MyMongo.Insert('Devices', req.body.devices, function (result) {
                if (result == 'Ok') {
                    req.session.devices = req.body.devices;
                    MyMongo.Insert('Messages', { email: req.session.user.strEmail, messagetype: 'alert alert-danger alert-dismissible', messagetype2: 'text-danger', messagetype3: 'fa fa-warning', message: req.session.user.strFirstName + ' Hey!', message2: ' I see you have a new device :)  ...', read: false }, function (result) {
                        if (result == 'Ok') {
                            MyMongo.Find('Devices', { email: req.session.user.strEmail }, function (result) {
                                Data.Devices = result;
                                MyMongo.Find('Messages', { email: req.session.user.strEmail }, function (result) {
                                    Data.Messages = result;
                                    req.session.messages = Data.Messages;
                                    Data.Result = 'ok';
                                    res.end(JSON.stringify(Data))
                                })
                            })
                        }
                    });
                };
            });
        };
    });
});

// update messages
app.post('/api/UpdateMessages', function (req, res) {
    var Data = {};
    MyMongo.Remove('Messages', { 'email': req.session.user.strEmail }, function (result) {
        if (result == 'Ok') {
            MyMongo.Insert('Messages', req.body.Messages, function (result) {
                if (result == 'Ok') {
                    req.session.messages = req.body.Messages;
                    Data.Result = 'ok';
                    res.end(JSON.stringify(Data))
                };
            });
        };
    });
});

// Subir archivos y escribirlos en disco
app.post('/api/uploadFile', function (req, res) {
    var Data = {};
    var sampleFile;
    sampleFile = req.files.file;
    var fileMetadata = {
        'name': sampleFile.name,
        parents: ['0B2_PIECATjTWaHNxOGd2cjhSRnc']
    };
    var media = {
        mimeType: sampleFile.mimetype,
        body: sampleFile.data
    };
    drive.files.create({
        auth: jwtClient,
        resource: fileMetadata,
        media: media,
        fields: 'id, webContentLink, webViewLink, thumbnailLink'
    }, function (err, file) {
        if (err) {
            console.log(err);
        } else {

            MyMongo.Find('Devices', { $and: [{ email: req.session.user.strEmail }, { strSerial: req.body.DeviceActiveSerial } ] }, function (result) {
                var NewFiles = result[0].Files;
                NewFiles.push({ FilewebViewLink: file.webViewLink, FileName: sampleFile.name, FilethumbnailLink: file.thumbnailLink });
                MyMongo.UpdateCriteria('Devices', { $and: [{ email: req.session.user.strEmail }, { strSerial: req.body.DeviceActiveSerial }] }, { Files: NewFiles }, function (resp) {
                    MyMongo.Find('Devices', { email: req.session.user.strEmail }, function (result) {
                        Data.Result = 'ok';
                        Data.Devices = result;
                        res.end(JSON.stringify(Data))
                        console.log(file.id);
                    });
                });
            });


        }
    });
});

// Obtener data inicial
app.post('/api/GetInitialData', function (req, res) {
    var Data = {};
    Data.Result = "ok";
    Data.User = req.session.user;
    Data.Messages = req.session.messages;
    Data.Devices = req.session.devices;
    res.end(JSON.stringify(Data));
});

// Login del usuario
app.post('/Logon', function (req, res) {
    MyMongo.Find('Users', { $and: [{ "strEmail": req.body.userLogon.strEmail }, { "strPassword": req.body.userLogon.strPassword }] }, function (result) {
        var Data = {};
        if (result.length == 0) {
            Data.Result = 'userDoesNotExist'
            res.end(JSON.stringify(Data));
        }
        else {
            req.session.user = result[0];
            MyMongo.Find('Messages', { "email": req.session.user.strEmail }, function (result) {
                req.session.messages = result;
                MyMongo.Find('Devices', { "email": req.session.user.strEmail }, function (result) {
                    req.session.devices = result;
                    Data.User = req.session.user;
                    Data.Messages = req.session.messages;
                    Data.Devices = req.session.devices;
                    Data.Result = 'ok';
                    res.end(JSON.stringify(Data));
                });
            });
        }
    });
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
      MyMongo.Find('Users', { "strEmail": req.user.email }, function (result) {
          var Data = {};
          if (result.length == 0) {
              res.redirect('/index.html');
          }
          else {
              req.session.user = result[0];
              MyMongo.Find('Messages', { "email": req.session.user.strEmail }, function (result) {
                  req.session.messages = result;
                  MyMongo.Find('Devices', { "email": req.session.user.strEmail }, function (result) {
                      req.session.devices = result;
                      res.redirect('/home.html');
                  });
              });
          }
      });
  });

app.post('/Login', function (req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Tremendo Error!!!!');
        }
        else {
            var collection = db.collection('Users'); // La tabla o collection que viene siendo la tabla
            var filter = { $and: [{ "Email": req.body.Email }, { "Password": req.body.Password }] };
            collection.find(filter).toArray(function (err, result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                var Data = {};
                if (err) {
                    console.log(err);
                } else if (result.length) {
                    req.session.user = result[0];
                    console.log('Found:', req.session.user.Email);
                    Data.Login = true;
                    Data.Email = req.session.user;
                    res.end(JSON.stringify(Data));
                } else {
                    Data.Login = false;
                    res.end(JSON.stringify(Data));
                }
            });
        }
        db.close();
    });
});

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

app.post('/upload', function (req, res) {

    var Data = {};

    if (typeof req.session.user == 'undefined') {
        Data.Result = 'nc';
        res.end(JSON.stringify(Data));
        return 0;
    }

    var sampleFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return 0;
    }

    sampleFile = req.files.file;

    if (typeof sampleFile == 'undefined') {
        Data.Result = 'nd';
        res.end(JSON.stringify(Data))
        return 0;
    }

    if (sampleFile.mimetype.trim() != 'application/vnd.ms-excel' && sampleFile.mimetype.trim() != 'text/plain')
    {
        Data.Result = 'nt';
        res.end(JSON.stringify(Data));
        return 0;
    }

    if (sampleFile.data.byteLength > 250000)
    {
        Data.Result = 'ns';
        res.end(JSON.stringify(Data))
        return 0;
    }

    var Products = [];
    var Fila = 0;

    CSV.forEach(sampleFile.data.toString('ascii'), { header: true }, function (record) {
        var Enterprise = { Enterprise: req.session.user.Enterprise, State: req.session.user.State, Email: req.session.user.Email, Phone: req.session.user.Phone };
        record.Msg = '1';
        Fila = Fila + 1;
        record.Fila = Fila;
        if (typeof record.Descripcion == 'undefined') {
            record.Msg = 'No se encontró columna "Descripcion".';
            Data.Result = 'nx';
        }
        if (typeof record.Precio == 'undefined') {
            record.Msg = 'No se encontró columna "Precio".';
            Data.Result = 'nx';
        }
        else {
            if (!isNumber(record.Precio)) {
                record.Msg = 'La columna "Precio no es un número".';
                Data.Result = 'nx';
            }
        }
        if (typeof record.Cantidad == 'undefined') {
            record.Msg = 'No se encontró columna "Cantidad".';
            Data.Result = 'nx';
        }
        else {
            if (Math.floor(record.Cantidad) != record.Cantidad || !isNumber(record.Cantidad)) {
                record.Msg = 'La columna "Cantidad" no es un número entero.';
                Data.Result = 'nx';
            }
        }
        if (typeof record.Estado == 'undefined') {
            record.Estado = '';
        }
        if (typeof record.Marca == 'undefined') {
            record.Marca = '';
        }
        if (typeof record.Modelo == 'undefined') {
            record.Modelo = '';
        }
        if (typeof record.Serial == 'undefined') {
            record.Serial = '';
        }
        for (var name in record) {
            if ((name != 'Descripcion') && (name != 'Precio') && (name != 'Cantidad') && (name != 'Estado') && (name != 'Marca') && (name != 'Modelo') && (name != 'Serial') && (name != 'Msg') && (name != 'Fila')) {
                record.Msg = 'Una columna tiene un nombre desconocido';
                Data.Result = 'nx';
            }
        }
        Object.assign(Enterprise, record);
        Products.push(Enterprise);
    });

    Data.Products = Products;

    Data.Products = Data.Products.filter(function (el) { return el.Msg != '1' });

    if (Data.Result == 'nx') {
        res.end(JSON.stringify(Data))
        return 0;
    }

    MyMongo.Remove('Inventary', { Email: req.session.user.Email }, function (result) {
        MyMongo.Insert('Inventary', Products, function (result) {
            Data.Result = 'Ok';
            if (result == 'Ok') { res.end(JSON.stringify(Data)) };
        }
        );
    }
    );

});

app.post('/Registration', function (req, res) {

    var Data = {};

    MyMongo.Find('Users', { 'Email': req.body.Email }, {}, function (result) {
        if (result.length > 0) {
            Data.Result = 'Re';
            res.end(JSON.stringify(Data));
            return 0;
        }
        else {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            MyMongo.Insert('Users', { 'Enterprise': req.body.Enterprise, 'State': req.body.State, 'Phone': req.body.Phone, 'Email': req.body.Email, 'Password': text }, function (result) {
                if (result == 'Ok') {
                    MyMail.SendEmail("<p>&nbsp;</p><p>Hola!</p><p>Solicitaste una clave de acceso a Encu&eacute;ntralo. Hemos generado una al azar, la cual es: <strong>" + text + "</strong>  </p><p>Las mejores ventas!</p><p>&nbsp;</p>", req.body.Email, "Acceso a Encuentralo.");
                    Data.Result = 'Ok';
                    res.end(JSON.stringify(Data))
                    return 0;
                };
            }
            );
        }
    }
    );
});

app.post('/RecoverPassword', function (req, res) {

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    MyMongo.Update('Users', { 'Email': req.body.Email }, { 'Password': text }, function (result) {
        if (result == 'Ok') {
            MyMail.SendEmail("<p>&nbsp;</p><p>Hola!</p><p>Solicitaste una nueva clave de acceso a Encu&eacute;ntralo. Hemos generado una al azar, la cual es: <strong>" + text + "</strong>  </p><p>Las mejores ventas!</p><p>&nbsp;</p>", req.body.Email, "Nueva clave de acceso a Encuentralo.");
            var Data = {};
            Data.Result = 'Ok';
            res.end(JSON.stringify(Data))
        };
    }
    );

});

app.post('/GetProducts', function (req, res) {

    MyMongo.Find('Inventary', { 'Descripcion': { '$regex': req.body.Nombre, $options: 'i' } }, {}, function (result) {
        var Data = {};
        Data.Products = result;
        res.end(JSON.stringify(Data));
    }
    );

});

app.post('/getUserData', function (req, res) {

    var Data = {};

    if (typeof req.session.user == 'undefined') {
        Data.Result = 'nc';
        res.end(JSON.stringify(Data));
        return 0;
    }

    Data.Result = 'Ok';
    Data.Enterprise = req.session.user.Enterprise;
    Data.State = req.session.user.State;
    Data.Phone = req.session.user.Phone;
    Data.Email = req.session.user.Email;
    res.end(JSON.stringify(Data));

});

app.post('/updateUserData', function (req, res) {

    var Data = {};

    if (typeof req.session.user == 'undefined') {
        Data.Result = 'nc';
        res.end(JSON.stringify(Data));
        return 0;
    }

    MyMongo.Update('Users', { 'Email': req.session.user.Email }, { 'Enterprise': req.body.Enterprise, 'State': req.body.State, 'Phone': req.body.Phone }, function (result) {
        if (result == 'Ok') {
            Data.Result = 'Ok';
            res.end(JSON.stringify(Data))
        };
    });
});

app.post('/updatePassword', function (req, res) {

    var Data = {};

    if (typeof req.session.user == 'undefined') {
        Data.Result = 'nc';
        res.end(JSON.stringify(Data));
        return 0;
    }

    MyMongo.Update('Users', { 'Email': req.session.user.Email }, { 'Password': req.body.Password }, function (result) {
        if (result == 'Ok') {
            Data.Result = 'Ok';
            res.end(JSON.stringify(Data))
        };
    });
});

app.post('/GetSuggestProducts', function (req, res) {

    MyMongo.Aggregate('Inventary', [{ "$group": { _id: "$Descripcion", count: { $sum: 1 } } }], function (result) {
        var Data = {};
        Data.SuggestProducts = result;
        res.end(JSON.stringify(Data));
    }
    );

});

const port = process.env.PORT || 3000

app.listen(port);