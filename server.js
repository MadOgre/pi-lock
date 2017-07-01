"use strict";

var express = require("express");
var app = express();
var Gpio = require('onoff').Gpio;

//this is mock for testing only

// function Gpio(pin, initialState)  {
// }

// Gpio.prototype.write = function(data, cb) {
//     //if (data === 0) throw new Error("test error");
//     //nothing happens;
//     setTimeout(cb);
// };

// Gpio.prototype.unexport = function() {
//     //nothing happens
// };

var lock = new Gpio(17, 'high');

var PORT = process.env.NODE_PORT || 3000;

var BUZZER_INTERVAL = 3000;

//Serve the index
var path = require( "path" );
var indexPath = path.join( __dirname, "/app/index.html" );

function activateBuzzer(cb) {
    lock.write(0, cb);
}

function deactivateBuzzer(cb) {
    lock.write(1, cb);
}

app.get("/", function(req, res, next){
    res.status(200).sendFile(indexPath, { });
});

app.post("/opendoor", function(req, res, next){
    activateBuzzer(function(err){
        if (err) return next(err);
        setTimeout(function(){
            deactivateBuzzer(function(err){
                if (err) return next(err);
                return res.json({result: 'success'});
            });
        }, BUZZER_INTERVAL);
    })
});

app.get("/opendoor", function(req, res, next){
    activateBuzzer(function(err){
        if (err) return next(err);
        setTimeout(function(){
            deactivateBuzzer(function(err){
                if (err) return next(err);
                return res.json({result: 'success'});
            });
        }, BUZZER_INTERVAL);
    })
});

app.use(function(err, req, res, next) {
    try {
        deactivateBuzzer(function(){
            console.log("Error detected - Buzzer deactivated");
            console.log(err);
            return res.json({result: 'error', error: err.message}); 
        });
    }
    catch(err) {
        console.log("Error detected - attempted to deactivate buzzer - failed!");
        console.log(err);
        return res.json({result: 'error', error: err.message}); 
    }
});

app.listen(PORT, function() {
    console.log("Server active on port " + PORT);
});

process.on("SIGINT", function(){
    console.log("just exited");
    lock.unexport();
    process.exit();
});