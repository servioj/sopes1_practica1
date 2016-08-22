/**
 * Created by ubuntu on 20/08/16.
 */
window.setInterval(accion,6000);
//window.onload=function () {
    console.log("adentro script");
    var socket = io.connect('http://127.0.0.1:5000');

    socket.on('init',function (data) {
        console.log(data.msg);
    });

socket.on('respuestaintervalo',function (data) {
    console.log(data.msg);
    document.getElementById("totalprocesos").value=data.msg;
});

socket.on('totalprocesos',function (data) {
    console.log(data.msg);
    document.getElementById("totalprocesos").value=data.msg;
});

socket.on('ejecutandose',function (data) {
    console.log(data.msg);
    document.getElementById("ejecutandose").value=data.msg;
});

socket.on('suspendidos',function (data) {
    console.log(data.msg);
    document.getElementById("suspendidos").value=data.msg;
});

socket.on('detenidos',function (data) {
    console.log(data.msg);
    document.getElementById("detenidos").value=data.msg;
});

socket.on('zombie',function (data) {
    console.log(data.msg);
    document.getElementById("zombie").value=data.msg;
});
//}

function accion() {
    //console.log("intervalo");
    socket.emit('peticioncliente');
    socket.emit('peticionEjecutandose');
    socket.emit('peticionSuspendidos');
    socket.emit('peticionDetenidos');
    socket.emit('peticionZombie');
    
}