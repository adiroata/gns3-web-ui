const { MSICreator } = require('electron-wix-msi');
const path = require('path');
const APP_DIR = path.resolve(__dirname, 'GNS3_WebUI-win32-x64');
const OUT_DIR = path.resolve(__dirname, 'windows_installer');

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

    description: 'GNS3 WebUI is web implementation of user interface for GNS3 software.',
    exe: 'GNS3',
    name: 'GNS3 Web UI',
    version: '2.0.0',

    ui: {
        chooseDirectory: true
    },
});

msiCreator.create().then(function(){
    msiCreator.compile();
});
