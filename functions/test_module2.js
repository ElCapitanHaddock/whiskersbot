

module.exports = function() {
    var mod1 = require('./test_module1')
    this.printParent = function() {
        console.log(mod1)
    }
}