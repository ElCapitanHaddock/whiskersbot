

module.exports = function() {
    this.printParent = function() {
        console.log(module.parent)
    }
}