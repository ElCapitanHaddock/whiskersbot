const version = 13

var fs = require('fs')
var obj = JSON.parse(fs.readFileSync(`./versions/v${version}.json`, 'utf8'));

var graph = {
      "id":"80ba40b4-bccc-42e0-b74f-06a8dc1642b6",
      "name":version + "JSON",
      "subtitle":null,
      "description":null,
      "updated_at":"2016-03-17T17:43:26.948+02:00",
      "created_at":"2016-03-17T15:02:34.000+00:00",
      "status":0,
      "image":{
         "path":"/system/graphs/missing.png",
         "ref_name":null,
         "ref_url":null
      },
      "nodeTypes":[
         {
            "id":"node",
            "name":"node",
            "name_alias":null,
            "description":null,
            "image":null,
            "image_as_icon":false,
            "color":"#9467bd",
            "properties":[
               
            ],
            "hide_name":null,
            "size":"metric_degree",
            "size_limit":48
         }
      ],
      "edgeTypes":[
         {
            "id":"node",
            "name":"node",
            "name_alias":null,
            "description":null,
            "weighted":1,
            "directed":1,
            "durational":null,
            "color":"#e377c2",
            "properties":[

            ]
         },
      ],
      "nodes":[],
      "edges":[]
}


obj = Object.keys(obj).map(k => obj[k])
for (var i = 0; i < obj.length; i++) {
     graph.nodes.push({
        "name": obj[i].node.replace(/\"/g,""),
        "id": obj[i].node.replace(/\"/g,""),
        "type": "node",
        "type_id":"node",
        "description":null,
        "image":null,
        "reference":null,
        "properties":{}
     })
    for (var j = 0; j < obj[i].edges.length; j++) {
        graph.edges.push({
            "from":obj[i].node.replace(/\"/g,""),
            "to":obj[i].edges[j].replace(/\"/g,""),
            "name":"node",
            "type_id":"node",
            "id":(i*j).toString(),
            "user_id":"node",
            "weight":1,
            "directed":1,
            "properties":{}
        })
    }
}

var save = JSON.stringify(graph)
fs.writeFile(`./graphs/gcJSON_${version}.json`, save, 'utf8', function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 
