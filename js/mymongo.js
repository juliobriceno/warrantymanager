module.exports = {
    Update: function Update(pcollection, where, set, callback)
    {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds153652.mlab.com:53652/warranty';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log(err);
            }
            else {
                var collection = db.collection(pcollection);
                collection.update(where, { $set: set }, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        return callback('Ok');
                    }
                    db.close();
                });
            }
        });
    },
    UpdateCriteria: function Update(pcollection, criteria, set, callback) {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds153652.mlab.com:53652/warranty';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log(err);
            }
            else {
                var collection = db.collection(pcollection);
                collection.update(criteria, { $set: set }, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var collection = db.collection('Log');
                        var dataInsert = set;
                        collection.insert(dataInsert, function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                callback('Ok');
                            }
                            db.close();
                        });
                    }
                });
            }
        });
    },
    Find: function Find(pcollection, filter, callback) {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds153652.mlab.com:53652/warranty'; 
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log(err);
            }
            else {
                var collection = db.collection(pcollection);
                collection.find(filter).toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {
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
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds153652.mlab.com:53652/warranty';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log(err);
            }
            else {
                var collection = db.collection(pcollection);
                collection.insert(dataInsert, function (err, result) {
                    if (err) {
                        console.log(err);
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
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds153652.mlab.com:53652/warranty';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log(err);
            }
            else {
                var collection = db.collection(pcollection);
                collection.remove(criteria, function (err, result) {
                    if (err) {
                        console.log(err);
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
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds153652.mlab.com:53652/warranty';
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
