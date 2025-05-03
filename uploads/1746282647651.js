global.owner = "62895402567224"
global.name = "WANZOFC BOT"
global.botname = "WANZOFC BOT"
global.qris = "https://files.catbox.moe/z2ubpl.jpg"
global.image = "https://files.catbox.moe/z2ubpl.jpg";
global.linkSaluran = "https://whatsapp.com/channel/0029ValQ7lvEFeXr8we3Oy2r";
global.idSaluran = "120363322519740862@newsletter";
global.namaSaluran = "WANZOFC BOT";
sret = "`";
let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})