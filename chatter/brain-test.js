

var natural = require('natural');

var wn = new natural.WordNet();
var mp = natural.Metaphone;
var se = natural.SoundEx;
var dm = natural.DoubleMetaphone;
var tk = new natural.WordTokenizer();

natural.LancasterStemmer.attach();
mp.attach();

var brain = {}

var Neuron = function(name) {
    var self = this
    
    //lowercase, symbol-less
    var node = self.node = name
    
    var relations = {}
    
    // vehicle, dependent node
    // loves, you
    // is, cat
    var Relation = function(ship, to) {
      this.ship = ship
      this.to = to
    }
}

var text = "i am waking up to the sounds of chainsaws"
console.log(mp.process(text))
console.log(se.process(text))
console.log(dm.process(text))

console.log(text.tokenizeAndPhoneticize())
console.log(text.tokenizeAndStem());

Array.prototype.clone = function(){
  return this.map(e => Array.isArray(e) ? e.clone() : e);
};