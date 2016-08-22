
 var express = require('express');
 
var user = require('./routes/user');
var http = require('http');
var path = require('path');
 var estadoUltimoProcesoLeido="ninguno";
 
var app = express();
 //var socket = require('socket')(http);


// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());          //necesario para utilizar sesiones
app.use(express.bodyParser());
app.use(express.session({secret : "practica",cookie: {maxAge: 600000}}));//necesario para utilizar sesiones
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
 
require('./routes')(app);

var server=http.createServer(app);
 var io=require('socket.io').listen(server);

 //io.set('loglevel',10);
 io.sockets.on('connection',function (sockt) {
     console.log("un usuario conectado");
     sockt.on('peticioncliente',function (sop) {
         //console.log('peticionrespuesta');
         procesosEjecutandose();
         //console.log("---------------"+contador+"-----------------------");
         io.sockets.emit('respuestaintervalo',{msg:procesosEjecutandosee});
         procesosEjecutandosee=0;
     });

     sockt.on('peticionEjecutandose',function (sop) {
         io.sockets.emit('ejecutandose',{msg:procRunning});
         procRunning=0;
     });

     sockt.on('peticionSuspendidos',function (sop) {
         io.sockets.emit('suspendidos',{msg:procSuspend});
         procSuspend=0;
     });

     sockt.on('peticionDetenidos',function (sop) {
         io.sockets.emit('detenidos',{msg:procDetenido});
         procDetenido=0;
     });

     sockt.on('peticionZombie',function (sop) {
         io.sockets.emit('zombie',{msg:procZombie});
         procZombie=0;
     });

     sockt.emit('init',{msg:"test"});
 });


 server.listen(app.get('port'), function(){
     console.log('Express server listening on port ' + app.get('port'));
 });


 function ignoreFunc(file, stats) {
     // `file` is the absolute path to the file, and `stats` is an `fs.Stats`
     // object returned from `fs.lstat()`.
     if (stats.lstatSync(file).isDirectory()){
         return false;
     }else{
         return true;
     }
     //return stats.isDirectory() ;
 }

 var procesosEjecutandosee=0;
 var procRunning=0;
 var procSuspend=0;
 var procZombie=0;
 var procDetenido=0;
 var noDefinido=0;
 var noDefineUlt="ninguno";
 var procesosJSON='{ "procesos" : [';

 function procesosEjecutandose() {
     var fs = require("fs"),
         path = require("path");

     var p = "/proc";
     fs.readdir(p,function(err, files) {
         if (err) {
             throw err;
         }
         files.map(function (file) {
             return path.join(p, file);
         }).filter(function (file) {
             if(fs.statSync(file).isDirectory() && !isNaN(path.basename(file))){
                 return fs.statSync(file).isDirectory();
             }

         }).forEach(function (file) {
             procesosEjecutandosee=procesosEjecutandosee+1;
             var fs = require('fs');
             fs.readFile(file+'/status', 'utf8', function(err, data) {
                 if( err ){
                     console.log(err)
                 }
                 else{
                     var inicio=data.indexOf("State:")+7;
                     estadoUltimoProcesoLeido=data.substring(inicio,inicio+2);
                     if(estadoUltimoProcesoLeido=="S "){
                         procSuspend=procSuspend+1;
                     }else if(estadoUltimoProcesoLeido=="R "){
                         procRunning=procRunning+1;
                     }else if(estadoUltimoProcesoLeido=="Z "){
                         procZombie=procZombie+1;
                     }else if(estadoUltimoProcesoLeido=="D"){
                         procDetenido=procDetenido+1;
                     }else{
                         noDefinido=noDefinido+1;
                     }

                     guardarInfoProceso(data);
                     //console.log("------"+data.substring(inicio,inicio+2));
                 }
             });
             console.log("%s (%s)(%s)(%s)", file, path.basename(file),path.extname(file),estadoUltimoProcesoLeido);  //imprime las carpetas
             console.log("procesos Ejecutandose "+procesosEjecutandosee);
         });
     });
     console.log("---------------"+procesosEjecutandosee+"-----------------------");
     console.log("runin="+procRunning+" suspendi="+procSuspend+" zombie="+procZombie+" detenido="+procDetenido+" noDefinido="+noDefinido);
 }


 function estadoProceso(ruta) {
     var fs = require('fs');
     fs.readFile(ruta+'/status', 'utf8', function(err, data) {
         if( err ){
             console.log(err)
         }
         else{
             var inicio=data.indexOf("State:")+7;
             estadoUltimoProcesoLeido=data.substring(inicio,inicio+4);
             console.log("------"+data.substring(inicio,inicio+4));
         }
     });
     return estadoUltimoProcesoLeido;
 }
 
 function guardarInfoProceso() {
     
 }