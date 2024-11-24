const path = nativeRequire('path');
const fs = nativeRequire('fs');
var routes = require('./OSC_routingTables/routingExample.js')

// CHANGE THESE TO YOUR NEEDS!
var hostStr = "192.168.178.24"
var portStr = "7000"

// clients
/* 
// only needed if there is more than just master.json and client.json
var sessions = {
    //'127.0.0.1': 'path/to/a.json',
    //'192.168.0.10': 'path/to/b.json'
}
*/

// no changes needed from now on
var clients = []
var clientsIP = []

var projectFolder = ''
var statePath = ''
var states = {}

var srcAmount = 0
var firstSrcSync = true
var srcObjs = []
var namesArr = []
var batchAmount = 0
var batchIdx = -1
var firstBatchSync = true
var batchObjs = []
var loadWait = 1500
var breakUpdate = false

// mapping function
function scale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// load state func
function loadState(name) {
    if (name in states) {
        receive('/STATE/SET', states[name])
    } else {
        console.log(`state ${name} not found`)
    }
}

// save state func
function saveState(name, state) {
    states[name] = state
    saveJSON(statePath, states)
}

// get file list
var getAllFilesFromFolder = function (dir, getAll) {
    var filesystem = nativeRequire("fs")
    var results = []
    filesystem.readdirSync(dir).forEach(function (file) {
        // to get everything incl subdirs and full path in output
        if (getAll) {
            file = dir + '/' + file
            var stat = filesystem.statSync(file)
            if (stat && stat.isDirectory()) {
                results = results.concat(getAllFilesFromFolder(file))
            } else results.push(file)
        } else {
            // to get only filename
            filePath = dir + '/' + file
            var stat = filesystem.statSync(filePath)
            results.push(file)
        }
    });
    return results
};


// client tracking and removing
app.on('open', (data, client) => {

    //see if newly connected client is already present, if not add to list and show in UI matrix
    if (!clients.includes(client.id)) {
        clients.push(client.id)
        clientsIP.push(client.address)
        //receive('/O-S-C/clientAddrMat_Sett', client.address)
    }
    for (var c = 0; c < clients.length; c++) {
        receive('/O-S-C/clientAddrMat_Sett/' + c, clientsIP[c])
        receive('/O-S-C/clientIDMat_Sett/' + c, clients[c])
    }

    // route all clients other than the host client to the "clientUI.json"
    if (client.address !== hostStr && client.address !== '127.0.0.1') {
        receive('/SESSION/OPEN', projectFolder + 'OSC_UI_client_master.json', { clientId: client.id })

        // to get the current state back on all GUIS feed the amounts to their DDs
        setTimeout(function () {
            if (srcAmount != 0) {
                receive('/get/srcAmount', srcAmount)
                receive('/O-S-C/srcAmountDD', srcAmount)
            }
            if (batchAmount != 0) {
                receive('/get/batchAmount', batchAmount)
                receive('/O-S-C/batchAmountDD', batchAmount)
            }
        }, 500)
    }

    /*
    // only needed if there is more than just master.json and client.json -> then swap with above one
    if (sessions[client.address]) {
        receive('/SESSION/OPEN', sessions[client.address], {clientId: client.id})
    }
    */
})

app.on('close', (data, client) => {
    if (clients.includes(client.id)) clients.splice(clients.indexOf(client.id))
})


module.exports = {

    oscInFilter: function (data) {

        var { address, args, host, port, clientId } = data

        /*########################## initial SYNC WITH VIMIX sources ###########################*/

        // filter incoming message for tag "/name" and a number as it is a unique combination for vimix's sync message
        if (!breakUpdate && firstSrcSync && address.includes('/name') && address.match(/\d/g)) {

            srcAmount++
            srcObjs[srcAmount] = { id: srcAmount }

            // get first and last letter of names and fill namesArr with them
            var shorty = '"' + (args[0].value[0] + args[0].value.slice(-1)).toUpperCase() + '"'
            var obj = JSON.parse(shorty)
            namesArr.push(obj)
            //console.log('one more, firstSrcSync = ' + breakUpdate)

            //get full names
            //namesArr.push(args[0].value)
            receive('/O-S-C/namesArr', namesArr)


            // populate and set O-S-C with data
            receive('/get/srcAmount', srcAmount)
            receive('/O-S-C/srcAmountDD', srcAmount)


            // no need to fill in the srcData, as it is done just by setting the DropDown one line above
            //recieve('/O-S-C/srcData', srcObjs)

            console.log('Added source#' + srcAmount + ' to list!')

            // disable additional syncing after first time
            var to = setTimeout(() => {
                firstSrcSync = false

                receive('/O-S-C/firstSync', false)
                receive('/O-S-C/setAddrSwitch', '#')
                clearTimeout(to)
            }, 150);
        }

        /*########################## initial SYNC WITH VIMIX batches ###########################*/

        if (!breakUpdate && firstBatchSync && address.includes('/batch#') && address.includes('/index') && address.match(/\d/g)) {
            //if (address.includes('/batch#') && address.includes('/index') && address.match(/\d/g)) {
            batchAmount++

            batchObjs[batchAmount] = { id: batchAmount }
            receive('/get/batchAmount', batchAmount)
            receive('/O-S-C/batchAmountDD', batchAmount)
            // no need to fill in the batchData, as it is done just by setting the DropDown one line above
            //recieve('/O-S-C/batchData', batchObjs)
            console.log('Added batch#' + batchAmount + ' to list!')

            // disable additional syncing after first time
            setTimeout(() => {
                firstBatchSync = false
            }, 350);

        }

        /*########################## END INIT SYNC WITH VIMIX ###########################*/

        // general batch alpha sync -> get the first argument and set this as batch alpha in O-S-C
        if (address.includes('/batch#') && address.match(/\d/g) && address.includes('/alpha')) {
            batchIdx++
            // console.log(args[0].value)
            receive('/vimix/batch#' + batchIdx + '/alpha', args[0].value)
            setTimeout(() => {
                batchIdx = -1
            }, 100);

        }

        /*########################## MIDI Devices ###########################*/

        if (host === 'midi') {

            // First Device
            if (port === 'myFirstDevice') {

                if (address === '/control') {

                    var [channel, ctrl, value] = args.map(arg => arg.value)

                    var mappedVal = scale(value, 0, 127, -0.35, 1.0) // faders alpha

                    if (routes.myFirstDeviceFaders[ctrl]) {

                        // exceptions to send differently scaled values
                        if (ctrl != 13 && ctrl != 55 && ctrl != 93) {
                            receive(routes.myFirstDeviceFaders[ctrl], mappedVal)
                            sendOsc({ address: routes.myFirstDeviceFaders[ctrl], args: [{ type: "f", value: mappedVal }], host: hostStr, port: portStr })
                        } else {
                            receive(routes.myFirstDeviceFaders[ctrl], mappedValInv)
                            sendOsc({ address: routes.myFirstDeviceFaders[ctrl], args: [{ type: "f", value: mappedVal }], host: hostStr, port: portStr })
                        }
                    }
                    else if (routes.myFirstDeviceKnobs[ctrl]) {
                        receive('/SET', routes.myFirstDeviceKnobs[ctrl], mappedVal2)
                    }
                    else if (routes.myFirstDeviceBtns[ctrl]) {
                        receive('/SET', routes.myFirstDeviceBtns[ctrl], value / 127)
                    }
                }
            }

            // Second Device
            else if (port === 'mySecondDevice') {

                if (address === '/control') {

                    var [channel, ctrl, value] = args.map(arg => arg.value)

                    if (routes.mySecondDeviceControls[ctrl]) {
                        // exceptions
                        if (ctrl != 0 && ctrl != 1 && ctrl != 2 && ctrl != 3 && ctrl != 4 && ctrl != 5 && ctrl != 6 && ctrl != 7) {
                            // prevent double trigger on release
                            if (value == 127) receive('/SET', routes.mySecondDevice[ctrl], value / 127)
                        } else {
                            var mappedVal3 = scale(value, 0, 127, -5.0, 5.0)
                            var mappedVal4 = scale(value, 0, 127, -2.0, 2.0)
                            if (ctrl == 0 || ctrl == 2 || ctrl == 4 || ctrl == 6) receive('/SET', routes.mySecondDevice[ctrl], mappedVal3)
                            else receive('/SET', routes.mySecondDevice[ctrl], mappedVal4)
                        }
                    }
                }

                else if (address === '/pitch') {
                    receive('/SET', routes.mySecondDevicePitch[ctrl], mappedVal2)
                }
            }

            /*########################### MIDI END ##############################*/


            return // bypass original message
        }
        // return data if you want the message to be processed
        return { address, args, host, port }
        //return { data }

    },


    ///////////////////////// OUT-FILTER ///////////////////////// 

    oscOutFilter: function (data) {

        var { address, args, host, port, clientId } = data

        // set srcData update off
        if (address === '/O-S-C/breakUpdate') {
            breakUpdate = args[0].value
            //console.log(breakUpdate)
        }

        //reset data when opening new file
        if (address === '/vimix/session/open') {
            srcAmount = 0
            firstSrcSync = true
            srcObjs = []
            batchAmount = 0
            firstBatchSync = true
            batchObjs = []
            namesArr = []
            receive('/O-S-C/firstSync', true)
        }

        // get file list when entering new project path
        if (address === '/O-S-C/getFileList') {
            projectFolder = args[0].value
            var fileListObj = {}
            var stateListObj = {}
            var folderCont = getAllFilesFromFolder(args[0].value, false)
            if (args.length > 1) var stateFolderCont = getAllFilesFromFolder(args[0].value + '/' + args[1].value, false)

            for (var i = 0; i < folderCont.length; i++) {
                if (folderCont[i].includes('.mix')) {
                    fileListObj[folderCont[i]] = folderCont[i]
                }
            }

            if (args.length > 1) {
                for (var i = 0; i < stateFolderCont.length; i++) {
                    if (stateFolderCont[i].includes('.state')) {
                        stateListObj[i] = stateFolderCont[i]
                    }
                }
            }
            receive('/O-S-C/sssnVar', fileListObj)
            receive('/O-S-C/statesVar', stateListObj)
        }

        // get states list on request
        if (address === '/O-S-C/getStatesList') {
            projectFolder = args[0].value
            var stateListObj = {}
            var stateFolderCont = getAllFilesFromFolder(args[0].value + '/' + args[1].value, false)

            for (var i = 0; i < stateFolderCont.length; i++) {
                if (stateFolderCont[i].includes('.state')) {
                    stateListObj[i] = stateFolderCont[i]
                }
            }
            receive('/O-S-C/statesVar', stateListObj)
        }

        // save/load states 
        else if (address === '/state/save' && args.length === 3) {
            try {
                statePath = args[2].value
                states = loadJSON(statePath) // || {}
                saveState(args[0].value, JSON.parse(args[1].value))
            } catch (e) {
                console.log(`error while saving state ${args[0].value}`)
                console.error(e)
            }
            return
        }

        else if (address === '/state/load') {
            statePath = args[1].value
            states = loadJSON(statePath) // || {}
            loadState(args[0].value)
            return
        }

        return { address, args, host, port }
        //return { data }
    }
}

