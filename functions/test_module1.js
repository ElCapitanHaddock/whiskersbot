

var test_module1 = function() {
    var Mod2 = require('./test_module2.js')
    var mod2 = new Mod2()
    this.printParent = function() {
        mod2.printParent()
    }
    this.test = "hello"
}

module.exports = test_module1