
//LAZY-INITIALIZING FIREBASE PROXY

var API = function(db) {
    var self = this
    self.servers = db.collection('servers')
    
    self.cache = {}
    self.set = function(id, opts, cb) {
        var docRef = self.servers.doc(id);
        var setter = docRef.set(opts).then(function(ref) {
            self.cache[opts.id] = opts
            console.log(`Server added to index: (${opts.name}) #${opts.id} ` )
            cb(null, ref)
        }).catch(function(err) { cb(err) })
    }
    self.update = function(id, opts, cb) {
        var docRef = self.servers.doc(id);
        var update = docRef.update(opts).then(function(ref) {
            cb(null, ref)
        }).catch(function(err) { cb(err) })
    }
    self.get = function(id, cb) {
        if (self.cache[id]) {
            cb(null, self.cache[id])
            return
        }
            
        //var docRef = self.servers.doc(id);
        /*if (!docRef) {
            cb(404)
            return
        }*/
        self.servers.doc(id).get()
        .then(function(doc) {
            if (doc.exists) { 
                var dat = doc.data()
                self.cache[id] = dat
                cb(null, dat)
            }
            else cb(404)
        }).catch(function(err) { cb(err) })
    }
    
    //shard concurrency
    self.servers.onSnapshot(function(querySnapshot) {
        querySnapshot.docChanges().forEach(function(change) {
            if (change.type === "added") {
                //console.log("DATABASE SET::\n", change.doc.data());
                var dat = change.doc.data()
                if (dat) self.cache[dat.id] = dat
            }
            if (change.type === "modified") {
                var dat = change.doc.data()
                console.log("DATABSE MODIFY::\n", dat.id);
                if (dat) self.cache[dat.id] = dat
            }
            /*
            if (change.type === "removed") {
                console.log("removed: ", change.doc.data());
            }
            */
        });
    });
}

module.exports = API