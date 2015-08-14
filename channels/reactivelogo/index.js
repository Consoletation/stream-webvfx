var Pumper = require('pumper');
var bassCheck = Pumper.createBand(20, 60, 127, 6 );
var maxVolume = 1;


var u = new UnityObject2();

function SendVolume(vol)
{
	if(u.getUnity() == null  || u.getUnity().SendMessage == undefined)
	{
		u.initPlugin(jQuery("#unityPlayer")[0], "web.unity3d");
		return;
	}
    u.getUnity().SendMessage("SoundReactive", "GetAudioData", vol * 0.8);
}

function update()
{
	

	Pumper.update();
	requestAnimationFrame(update);
	
	if(Pumper.volume > maxVolume)
		maxVolume = Pumper.volume;


	var normalized = Pumper.volume / maxVolume;

	SendVolume(normalized);
}

var divisions = 16, bands = [];


function init() {
    //Create bands
    var bandMin = 10;
    var bandSize = 80 / divisions;
    for (var i = 0 ; i < divisions ; i++){
        Pumper.createBand(bandMin, bandMin + bandSize, 127, 4 );
        bandMin += bandSize;
    }
    update();
}

var ReactiveLogo = {
    init: init
};


var AlgoViz = {
    init: init
};

module.exports = ReactiveLogo;