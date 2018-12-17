var API = function(db) {
    var self = this
    
    self.set = function(id, opts, cb) {
        var docRef = db.collection('servers').doc(id);
        var setter = docRef.set(opts).then(function(ref) {
            cb(null, ref)
        }).catch(function(err) { cb(err) })
    }
    self.update = function(id, opts, cb) {
        var docRef = db.collection('servers').doc(id);
        var update = docRef.update(opts).then(function(ref) {
            cb(null, ref)
        }).catch(function(err) { cb(err) })
    }
    self.get = function(id, cb) {
        var docRef = db.collection('servers').doc(id);
        if (docRef) {
            docRef.get()
            .then(function(doc) {
                if (doc.exists) cb(null, doc.data())
                else cb(404)
            }).catch(function(err) { cb(err) })
        } else cb(404)
    }
}

module.exports = API