/**
	Hyperelastic growth model, Roberto Toro 2015
	Main
*/

var simulationParams;	// simulation parametres
var simulation;			// simulation object
var display;			// display

function mySimulation(params) {
	this.time=0;// history, actually
	this.dt=0;	// time step

	this.ge=0;	// geometry
	this.me=0;	// mechanics
	this.gr=0;	// growth
	this.di=0;	// display
}

/**
Main: init simulation
*/
function initSimulation(params) {
	var si=new mySimulation();
	
	// create geometry
	switch(params.geometry) {
		case "ring":
			si.ge=makeRing(params);
			break;
		case "sphere":
			si.ge=makeSphere(params);
			break;
	}

	// init mechanics
	si.me=initMechanics(si.ge,params);

	// init growth
	si.gr=initGrowth(params);
	switch(params.growth) {
		case "ring border instantaneous":
			si.growthFunction=growRingBorderInstantaneous;
			break;
		case "ring tangential instantaneous":
			si.growthFunction=growRingTangentialInstantaneous;
			break;
	}
	
	// compute time step for simulation
	si.dt=computeTimeStep(si.ge,si.me);
	
	if(params.T==0)
		si.growthFunction(si.ge,si.gr);
	
	/*
	$("#select").change(selectSimulation);
	$("#startStop").click(startStop);
	*/

	return si;
}

/**
computeTimeStep
*/
function computeTimeStep(ge,me) {
	var a=0;	// average mesh spacing
	var n1,n2;
	var nt=ge.nt;
	var t=ge.t;
	var p=ge.p;
	var K=me.K;
	var rho=me.rho;
	var dt;
	
	for(i=0;i<nt;i++)
	for(j=0;j<4;j++) {
		n1=t[4*i+j];
		n2=t[4*i+(j+1)%4];
		a+=Math.sqrt(
			Math.pow(p[n1*3+0]-p[n2*3+0],2)+
			Math.pow(p[n1*3+1]-p[n2*3+1],2)+
			Math.pow(p[n1*3+2]-p[n2*3+2],2)
		);
	}
	a=a/nt/4;
	dt=0.2*0.1*Math.sqrt(rho*a*a/K);
	
	return dt;
}

/**
Simulation step
Request a new frame, call the render function, call the simulation functions and update
model display.
*/
function simulationStep(si) {
	
	// if(si.time>0.1 || flag_running==false)	return;
		
	si.time+=si.dt;

	tetraElasticity(si.ge,si.me);
	//linElasticity(si.ge,si.me);
	move(si.ge,si.me,si.dt);
}

/*
function pauseResume(di) {
	if(flag_running==true) {
		flag_running=false;
		$("#startStop").html("Start");
	}
	else {
		flag_running=true;
		animate(param);
		param.growthFunc(param);
		$("#startStop").html("Stop");
	}
}
*/
