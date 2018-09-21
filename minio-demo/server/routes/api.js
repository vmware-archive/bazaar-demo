const express = require('express');
const router = express.Router();
const multer = require("multer");
const minio = require("minio");

const vcap_services = JSON.parse(process.env.VCAP_SERVICES);
const minioEndPoint = vcap_services.minio[0].credentials.services[0].status.loadBalancer.ingress[0].ip;
const minioPort = vcap_services.minio[0].credentials.services[0].spec.ports[0].port;
const minioAccessKey = vcap_services.minio[0].credentials.secrets[0].data.accesskey;
const minioSecretKey = vcap_services.minio[0].credentials.secrets[0].data.secretkey;

console.log('vcap info - url: [' + minioEndPoint + ':' + minioPort + '] credentials: [' + minioAccessKey + ' | ' + minioSecretKey + ']')
var minioClient = new minio.Client({
    endPoint: minioEndPoint,
    port: minioPort,
    useSSL: false,
    accessKey: minioAccessKey,
    secretKey: minioSecretKey
});

router.get('/', (req, res) => {
  res.send('API: please select method');
});

router.get('/info', function(request, response) {
  var infojson = {
    'url': minioEndPoint,
    'port': minioPort,
    'accessKey': minioAccessKey,
    'secretKey': minioSecretKey
  };
  response.send(infojson);
});

router.get('/create-bucket', function(request, response) {
  var exists = minioClient.bucketExists('minio-demo', function(error1) {
    if (error1) {
      console.log(error1);
      response.send('{"result": "error: '+error1+'"}');
    }
  });
  if (exists) {
    console.log("minio-demo already exists");
    response.send('{"result": "minio-demo already exists"}');
  } else {
    console.log("minio-demo bucket doesn't exist");
    minioClient.makeBucket('minio-demo', function(error2) {
      if (error2) {
        console.log(error2);
        response.send('{"result": "error: '+error2+'"}');
      }
      else {
        console.log("minio-demo bucket created successfully");
        response.send('{"result": "minio-demo bucket created successfully"}');
      }
    });
  }
});

router.get('/get-bucket-content', function(request, response) {
  var stream = minioClient.listObjects('minio-demo');
  var data = [];
  stream.on("data", function(chunk) {
    data.push(chunk);
  });
  stream.on("end", function() {
    response.send(data);
  });
});

module.exports = router;
