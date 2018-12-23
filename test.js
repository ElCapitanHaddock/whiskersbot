


var natural = require('natural');
var classifier = new natural.BayesClassifier();

classifier.addDocument("bruh", "moment")
classifier.addDocument("ethovoid", "cringe")
classifier.addDocument("uhtredofbebbanburg", "isepic")

var save = JSON.stringify(classifier)

classifier.addDocument("test", "penguin")

var restored = natural.BayesClassifier.restore(JSON.parse(save))
console.log(restored.docs)
console.log(classifier.docs)