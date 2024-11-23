/*
 For the UI's complete address table please have a look at .../routingTables/APIspecs/addressTable.html 
*/

var vimixSrcAddr = "/vimix/#"
var vimixBatchAddr = "/vimix/batch#"


module.exports = {
    "myFirstDeviceFaders": {
        2: vimixSrcAddr + '0/alpha',
        3: vimixSrcAddr + '1/alpha',
    },

    "myFirstDeviceKnobs": {
        14: 'knobsMat/0',
        15: 'knobsMat/1',
    },

    "myFirstDeviceBtns": {
        23: 'playPauseMat/0',
        24: 'playPauseMat/1',
    },

    "mySecondDeviceControl": {
        39: 'flashMat/0',
        48: 'flashMat/1',
    },

    "mySecondDevicePitch": {
        39: '',
        48: '',
    }
}

