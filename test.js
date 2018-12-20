const pd = require('paralleldots');
 
// Be sure to set your API key
pd.apiKey = "CfBfRociarAWzvGPZdBC9Jxoh7buAb81wrtms4qryWg";

pd.objectRecognizer("https://i.dailymail.co.uk/i/pix/2018/02/02/18/48D3379500000578-5345305-image-a-16_1517595669475.jpg",'url')
    .then((response) => {
        console.log(JSON.parse(response).output);
    })
    .catch((error) => {
        console.log(error);
    })
