/*
 For the UI's complete address table please have a look at .../routingTables/APIspecs/addressTable.html 
*/

var vimixSrcAddr = "/vimix/#"
var vimixBatchAddr = "/vimix/batch#"

module.exports = {
    '192.168.178.42': {
        '/OSCtest/heartbeat': 'mainMixMat/0',
        '/OSCtest/': '1/alpha',
    },

    'deviceIP02': {
        '/OSCtest/': 'knobsMat/0',
        '/OSCtest/': 'knobsMat/1',
    },

    'deviceIP03': {
        '/OSCtest/': 'playPauseMat/0',
        '/OSCtest/': 'playPauseMat/1',
    },

    'deviceIP04': {
        '/OSCtest/': 'flashMat/0',
        '/OSCtest/': 'flashMat/1',
    },

    'deviceIP05': {
        '/OSCtest/': '',
        '/OSCtest/': '',
    }
}

