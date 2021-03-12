const electron = require('electron')
const url = require('url')
const path = require('path')
//ytdl
const ytdl = require('ytdl-core')
var ffmpeg = require('fluent-ffmpeg')
const ytinfo = require('youtube-info') 
// bull
const { createPublicKey } = require('crypto')
const { Accelerator, ipcRenderer } = require('electron')
const fs = require('fs');
const { stringify } = require('querystring')
const { title } = require('process')

const {app, BrowserWindow, Menu, ipcMain} = electron

let mainWindow
//start the app when ready
app.on('ready', function(){
    //mk new win
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true
        }
    })

    //load html in da win
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainScreen.html'),
        protocol:'file:',
        slashes: true
    }))
    mainWindow.on('closed', function(){
        app.quit()
    })
    
    const mainmenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainmenu)
})

//catch input from the main screen to decide on what to do next
ipcMain.on('item:select', function(e, i){
    console.log('loaded: ' + i)
    switch(i){
        case 'local':
            loadLocal()
            break
    }
})
    




//load the local songs page and manage its functions
let songs
let musicPath = app.getPath('music')
function loadLocal(){
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'localPlayer.html'),
        protocol:'file:',
        slashes: true
    }))
    //get users music folder path and stores the mp3 filenames/paths into memory
    songs = []
    console.log('music path: ' + musicPath)
    fs.readdirSync(musicPath).forEach(file => {
            if(file.endsWith('.mp3')){
                songs.push({
                    filePath: musicPath +'/'+ file,
                    songName: file.slice(0, -4) 
                }
            )}
        })
        //send the array of songs to localPlayer.html
        mainWindow.webContents.on('did-finish-load', function(){
            mainWindow.webContents.send('songs:songs', songs)
        })
}

    


//main menu (currently holds all screen menus as screen specific menus are to be added)
const mainMenuTemplate = [
    {
        label:'nav',
        submenu:[
            {
                label:'local',
                click(){loadLocal()}
            }
        ]
    },
    {
        label:'MediaControl',
        submenu:[
            {
                label:'Pause',
                accelerator:'Ctrl+O',
                click(){
                    mainWindow.webContents.send('songs:pause')
                }
            },
            {
                label:'Next',
                accelerator:'Ctrl+P',
                click(){
                    mainWindow.webContents.send('songs:next')
                }
            },
            {
                label:'Prev',
                accelerator:'Ctrl+I',
                click(){
                    mainWindow.webContents.send('songs:prev')
                }
            }
        ]
    },
    {
        //devmenu
        label:'dev',
        submenu:[
            {
                label:'Inspectelement',
                accelerator:'Ctrl+Shift+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools()
                }
            }
        ]
    },
    {
        //youtubedl  -- to be changed to its own menu on screen once youtube webvieww added
        label:'ytdl',
        submenu:[
            {//downlaod a single song from a link --  gonna b sick but i dneed to make a popup menu
                label:'dlsong',
                click(){
                    ytdlWin()
                }
            }
        ]

    }
]


//ytdl window funkcc
function ytdlWin(){
    //mk new win
    addWindow = new BrowserWindow({
        title:'ytdl',
        width: 300,
        height: 300,
        webPreferences:{
            nodeIntegration:true
        }
    })
    //load html in da win
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'ytdl.html'),
        protocol:'file:',
        slashes: true
    }))
    //garbage
    addWindow.on('closed', function(){
        addWindow = null
    })
}
ipcMain.on('ytdl:link', function(e, i){
    console.log(i.slice(-11))    
    
    let title = ''
    ytdl.getInfo(i).then(info => {
        title = (info.videoDetails.title)
        console.log('downloading:', info.videoDetails.title);
        let videostream = ytdl(i)
        ffmpeg(videostream)
            .audioBitrate(128)
            .save(musicPath + '/' + title + '.mp3')
            .on('end', function(){
                console.log('dl finsished')
            })
    }) 
})