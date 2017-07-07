module.exports = {
    Update: function Update(pcollection, where, set, callback)
    {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Tremendo Error!!!!');
            }
            else {
                var collection = db.collection(pcollection);
                collection.update(where, { $set: set }, function (err, result) {
                    if (err) {
                        console.log('Tremenda ERROR compadre');
                    }
                    else {
                        return callback('Ok');
                    }
                    db.close();
                });
            }
        });
    },
    Find: function Find(pcollection, filter, fields, callback)
    {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        //var url = 'mongodb://localhost:27017/Solicitudes'; // Después de la URL (Fija con puerto por defecto Mongo) viene la BD
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Tremendo Error!!!!');
            }
            else {
                var collection = db.collection(pcollection);
                collection.find(filter, fields).toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {
                        console.log('Found:', result);
                        callback(result);
                    } else {
                        callback([]);
                        console.log('No document(s) found with defined "find" criteria!');
                    }
                    db.close();
                });
            }
        });
    },
    Insert: function Insert(pcollection, dataInsert, callback) {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Tremendo Error!!!!');
            }
            else {
                var collection = db.collection(pcollection);
                collection.insert(dataInsert, function (err, result) {
                    if (err) {
                        console.log('Tremenda ERROR compadre');
                    }
                    else {
                        callback('Ok');
                    }
                    db.close();
                });
            }
        });
    },
    Remove: function Remove(pcollection, criteria, callback) {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Tremendo Error!!!!');
            }
            else {
                var collection = db.collection(pcollection);
                collection.remove(criteria, function (err, result) {
                    if (err) {
                        console.log('Tremenda ERROR compadre');
                    }
                    else {
                        callback('Ok');
                    }
                    db.close();
                });
            }
        });
    },
    Aggregate: function Aggregate(pcollection, aggregatequery, callback) {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        //var url = 'mongodb://localhost:27017/Solicitudes'; // Después de la URL (Fija con puerto por defecto Mongo) viene la BD
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Tremendo Error!!!!');
            }
            else {
                var collection = db.collection(pcollection);
                collection.aggregate(aggregatequery).toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {
                        console.log('Found:', result);
                        callback(result);
                    } else {
                        callback([]);
                        console.log('No document(s) found with defined "find" criteria!');
                    }
                    db.close();
                });
            }
        });
    }
}
