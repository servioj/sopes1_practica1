
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

     sockt.on('peticionPorcentajeRAM',function (sop) {
         io.sockets.emit('porcentajeRAM',{msg:porcentaeRAM});
     });

     sockt.on('peticionPorcentajeCPU',function (sop) {
         io.sockets.emit('porcentajeCPU',{msg:porcentaeCPU});
     });

     sockt.on('peticionDetalleProcesos',function (sop) {
         procesosJSON=procesosJSON+']}';

         var procesosJSON1=procesosJSON.replace("\n"," ");
         var procesosJSON2=procesosJSON1.replace("\r"," ");
         //var procesosJSON3=procesosJSON2.replace(/\s*[\r\n][\r\n \t]*/g," ");
         var procesosJSON3=procesosJSON2.replace("\t"," ");
         //console.log(procesosJSON3);
         //io.sockets.emit('detalleProcesos',JSON.parse(procesosJSON3));
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
 var procesosJSON='{ "procesos" : ['+'{"nombre":"ejemplo" ,"ram":"ejemplo", "estado":"ejemplo", "usuario":"ubuntu", "PID":1 }';
 var porcentaeRAM=1.00;
 var porcentaeCPU=1.00;

 function procesosEjecutandose() {
     var fs = require("fs"),
         path = require("path");
     procesosJSON='{ "procesos" : ['+'{"nombre":"ejemplo" ,"ram":"ejemplo", "estado":"ejemplo", "usuario":"ubuntu", "PID":1 }';
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
                     guardarInfoProceso(data,path.basename(file));
                     //console.log(procesosJSON);
                     //console.log("------"+data.substring(inicio,inicio+2));
                 }
             });
             //console.log("%s (%s)(%s)(%s)", file, path.basename(file),path.extname(file),estadoUltimoProcesoLeido);  //imprime las carpetas
             //console.log("procesos Ejecutandose "+procesosEjecutandosee);
         });
     });
     //console.log("---------------"+procesosEjecutandosee+"-----------------------");
     //console.log("runin="+procRunning+" suspendi="+procSuspend+" zombie="+procZombie+" detenido="+procDetenido+" noDefinido="+noDefinido);
     //procesosJSON=procesosJSON+']}';
     porcentajeUtilizacionRAM();
     porcentajeCPU();
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
 
 function guardarInfoProceso(dato,pid) {
     var nombre=dato.substring(dato.indexOf("Name:")+6,dato.indexOf("State:"));
     var ram=dato.substring(dato.indexOf("VmData:")+8,dato.indexOf("VmStk:"));
     var estado=dato.substring(dato.indexOf("State:")+7,dato.indexOf("Tgid:"));
     var proce=',{"nombre":"'+nombre+'", "ram":"'+ram+'", "estado":"'+estado+'", "usuario":"ubuntu", "PID":'+pid+' }';
     procesosJSON=procesosJSON+proce;
 }

 function porcentajeUtilizacionRAM() {
     var fs = require('fs');
     fs.readFile('/proc/meminfo', 'utf8', function(err, data) {
         if( err ){
             console.log(err)
         }
         else{
             var memTotal=data.substring(data.indexOf("MemTotal:")+10,data.indexOf("MemFree:"));
             var memDisponible=data.substring(data.indexOf("MemAvailable:")+14,data.indexOf("Buffers:"));
             memTotal=memTotal.substring(0,memTotal.indexOf("kB"));
             memDisponible=memDisponible.substring(0,memDisponible.indexOf("kB"));
             var memUsada=memTotal-memDisponible;
             porcentaeRAM=100.00*parseFloat(memUsada)/parseFloat(memTotal);
             //console.log("------"+data.substring(inicio,inicio+4));
         }
     });
 }
 
 function porcentajeCPU() {
     // Vamos a requerir del modulo que provee Node.js
// llamado child_process
     var exec = require('child_process').exec, child;
// Creamos la función y pasamos el string pwd
// que será nuestro comando a ejecutar
     //var commando='cat <(grep \'cpu \' /proc/stat) <(sleep 1 && grep \'cpu \' /proc/stat) | awk -v RS="" \'{print ($13-$2+$15-$4)*100/($13-$2+$15-$4+$16-$5)}\'';
     var commando='top -b -n1 | grep "Cpu(s)" | awk \'{print $2 + $4}\'';
     console.log(commando);
     child = exec(commando,
// Pasamos los parámetros error, stdout la salida
// que mostrara el comando
         function (error, stdout, stderr) {
             // Imprimimos en pantalla con console.log
             //console.log(parseFloat(stdout));
             porcentaeCPU=parseFloat(stdout);
             // controlamos el error
             if (error !== null) {
                 console.log('exec error: ' + error);
             }
         });
 }