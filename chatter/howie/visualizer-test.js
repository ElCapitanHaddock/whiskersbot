const version = 13
const mode = "twopi" //nodes,neato,twopi,twopi_compressed,databasic

var fs = require('fs')
var obj = JSON.parse(fs.readFileSync(`./versions/v${version}.json`, 'utf8'));

var res = ""
if (mode == "twopi") res += `digraph G {
	node [fontsize=20 shape=point];
	ranksep=3;
	root="yes";
	edge[arrowhead="none"];
`
function slim(input) {
    var punct = /[\.’'\[\](){}⟨⟩:,،、‒–—―…!.‹›«»‐\-?‘’“”'";/⁄·\&*@\•^†‡°”¡¿※#№÷×ºª%‰+−=‱¶′″‴§~_|‖¦©℗®℠™¤₳฿₵¢₡₢$₫₯֏₠€ƒ₣₲₴₭₺₾ℳ₥₦₧₱₰£៛₽₹₨₪৳₸₮₩¥]/g
    return input.toLowerCase().replace(/\s/g,'').replace(punct, "")
}

obj = Object.keys(obj).map(k => obj[k])
for (var i = 0; i < obj.length; i++) {
    if (mode == "nodes") res += obj[i].node.replace(/\"/g,"") + "\n"
    else {
        for (var j = 0; j < obj[i].edges.length; j++) {
            if (mode == "databasic") res += "\""+obj[i].node.replace(/\"/g,"") + "\"\t\"" + obj[i].edges[j].replace(/\"/g,"") + "\"\n"
            else if (mode == "neato") res += "\""+(slim(obj[i].node) || obj[i].node) + "\" -- \"" + (slim(obj[i].edges[j]) || obj[i].edges[j]) + "\"\n"
            else if (mode == "twopi") res += "\""+obj[i].node.replace(/\"/g,"") + "\" -> \"" + obj[i].edges[j].replace(/\"/g,"") + "\"\n"
            else if (mode == "twopi_compressed") {
                res += "\"" + (slim(obj[i].node) || obj[i].node) + "\" -> \"" + (slim(obj[i].edges[j]) || obj[i].edges[j]) + "\"\n"
            }
        }
    }
}
if (mode == "twopi") res += "}"
console.log(res)

fs.writeFile(`./graphs/${mode + "_" + version}.txt`, res, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 


/*

digraph G {
	node [fontsize=20 shape=point];
	ranksep=3;
	root="hello";
	edge[arrowhead="none"];

*/