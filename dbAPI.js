
//LAZY-INITIALIZING FIREBASE PROXY
var sizeof = require('object-sizeof')

var API = function(db) {
    var self = this
    
    //let query = mutes.where('time', '<=', now)
    //let deleted = mutes.doc('DC').delete()
    self.mutes = db.collection('mutes')
    
    self.addMute = function(opts, cb) {
        /*
        opts:
        {
            time,
            member,
            guild
        }
        */
        var added = self.mutes.add(opts).then(function(ref) {
            console.log('Mute databased')
            cb(null, ref)
        }).catch(function(err) { cb(err) })
    }
    
    self.removeMute = function(id, cb) { //remove mute by document ID
        var deleted = self.mutes.doc(id).delete().then(function(ref) {
            console.log('Mute undatabased')
            cb(null, ref)
        }).catch(function(err) { cb(err) })
    }
    
    self.getMutes = function(opts, cb) { //get mute by guild and member
        var query = self.mutes.where('member', '==', opts.member).where('guild', '==', opts.guild).get().then(function(querySnapshot) {
            cb(null, querySnapshot)
        }).catch(function(err) { cb(err) })
    }
    
    self.getFinishedMutes = function(cb) { //get mutes by whether they are complete
        var D = new Date()
        var now = D.getTime()
        
        var query = self.mutes.where('time', '<=', now).get().then(function(querySnapshot) {
            cb(null, querySnapshot)
        }).catch(function(err) { cb(err) })
    }
    
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
            
        var docRef = self.servers.doc(id);
        if (!docRef) {
            cb(404)
            return
        }
        docRef.get({source:"cache"})
        .then(function(doc) {
            if (doc.exists) { 
                var dat = doc.data()
                self.cache[id] = dat
                cb(null, dat)
            }
            else cb(404)
        }).catch(function(err) { cb(err) })
    }
    self.mem = function() {
        return sizeof(self.cache)
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
                console.log("DATABSE MODIFY::\n", dat.id)
                if (dat) self.cache[dat.id] = dat
            }
            /*
            if (change.type === "removed") {
                console.log("removed: ", change.doc.data());
            }
            */
        })
    })
}

module.exports = API