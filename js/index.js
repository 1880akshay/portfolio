var cmdLine = `<div><span class="user_domain">guest@1880akshay</span>:<span class="tilde">~</span>$</div>`;
var cmdInput = `<div class="cmd_input_area"><form onsubmit="submitCommand(event)" onkeydown="getPreviousCommand(event)"><input type="text" class="cmd_input" spellcheck="false"></form></div>`;

var mainCommands = ['help', 'cd', 'cat', 'ls', 'clear'];
var files = ['welcome.txt', 'about_me.txt', 'skills.txt', 'projects.txt', 'work_experience.txt'];

var links = {
    'Email/': 'mailto:1880akshay@gmail.com',
    'GitHub/': 'https://github.com/1880akshay',
    'Linkedin/': 'https://www.linkedin.com/in/1880akshay/',
}

var cmdStack = [];
var cmdInd = 0;
var cmdStackSize = 0;

function getPreviousCommand(event) {
    switch(event.keyCode) {
        case 38:
            //up arrow press
            event.preventDefault();
            if(cmdInd!=0) {
                event.target.value = cmdStack[--cmdInd];
            }
            break;
        case 40:
            //down arrow press
            event.preventDefault();
            if(cmdStackSize!=0 && cmdInd<cmdStackSize-1) {
                event.target.value = cmdStack[++cmdInd];
            }
            break;
    }
}

function typeNewCommand() {
    $('#terminal').append(`<div class="user_domain_container">`+cmdLine+cmdInput+`</div>`);
    $('#terminal input').last().focus();
}

async function displayFileContents(cmd, filename) {

    if(filename !== 'help.txt' && !files.includes(filename)) {
        $('#terminal').append(cmd + `: ` + filename + `: not found`);
        return;
    }

    //await fetch('static/files/'+filename)
    await fetch('files/'+filename)
    .then(res => res.text())
    .then(data => {
        //console.log(data);
        $('#terminal').append(`<div>`+data.replace(/ (?![^<]*>)/g, "&nbsp;").replace(/\n/g, "<br>")+`</div>`);
    })
}

function generateLink(name, href) {
    return `<a href=`+href+` target="_blank">`+name+`</a>`;
}

function lsRun() {
    for(var i in files) {
        $('#terminal').append(files[i]+'&emsp;');
    }
    $('#terminal').append('<br />');
    for(var name in links) {
        $('#terminal').append(generateLink(name, links[name])+'&emsp;');
        $('#terminal a').last().css('color', '#3391ff');
    }
}

async function catRun(cmd, filename) {
    if(filename == "") {
        $('#terminal').append('Please specify the file you want to read');
        return;
    }
    await displayFileContents(cmd, filename);
}

function cdRun(directory) {
    if(directory[directory.length-1] != '/') directory+='/';
    if(directory in links) {
        window.open(links[directory]);
    }
    else {
        $('#terminal').append(`cd: ` + directory + `: not found`);
    }
}

async function runCommand(cmdList) {
    var n = cmdList.length;
    var mainCommand = cmdList[0];
    switch(mainCommand) {
        case 'clear':
            document.getElementById('terminal').innerHTML = "";
            break;
        case 'help':
            await displayFileContents(mainCommand, 'help.txt');
            break;
        case 'ls':
            lsRun();
            break;
        case 'cd':
            cdRun((n>=2)?cmdList[1]:"");
            break;
        case 'cat':
            await catRun(mainCommand, (n>=2)?cmdList[1]:"");
            break;
        default:
            $('#terminal').append(mainCommand + ': command not found');
    }
}

async function runDefaultCommand() {
    cmdStack.push('cat welcome.txt');
    cmdInd=++cmdStackSize;
    $('#terminal').append(`<div class="user_domain_container">`+cmdLine+`<div id="autorun"></div></div>`);
    var typewriter = new Typewriter(document.getElementById('autorun'), {
        loop: false,
        delay: 80,
    });

    typewriter.typeString('cat welcome.txt').start().callFunction(async () => {
        $('.Typewriter__cursor').hide();
        await runCommand(['cat', 'welcome.txt']);
        typeNewCommand();
    });
}

async function submitCommand(event) {
    event.preventDefault();
    var input = event.target.querySelector('input');
    input.disabled = true;
    var cmd = input.value;
    cmd=cmd.trim();
    if(cmd && cmd != "") {
        cmdStack.push(cmd);
        cmdInd=++cmdStackSize;
        var cmdList = cmd.split(" ");
        await runCommand(cmdList);
    }
    typeNewCommand();
}

$(document).ready(function() {
    runDefaultCommand();
});