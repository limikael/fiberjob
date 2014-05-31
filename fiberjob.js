var Fiber = require("fibers");
var child_process = require("child_process");
var path = require("path");
var fs = require("fs");

/**
 * Run child commands in a fiber.
 * @class FiberJob
 */
function FiberJob(command) {
	if (!(this instanceof FiberJob))
		return new FiberJob(command);

	this.cmd=command;
	this.cmdArgs=[];
	this.returnCode=null;
	this.output="";
	this.showOutput=false;
}

/**
 * Run the command.
 * @method run
 * @chainable
 */
FiberJob.prototype.run=function() {
	this.fiber = Fiber.current;

	if (!this.fiber)
		throw new Error("Must be run in a fiber");

	this.previousPath=process.cwd();

	if (this.workingPath)
		process.chdir(this.workingPath);

	this.cmd=FiberJob.resolveCmd(this.cmd);

	this.childProcess=child_process.spawn(this.cmd,this.cmdArgs);

	this.childProcess.stdout.on("data",this.onChildProcessOutput.bind(this));
	this.childProcess.stderr.on("data",this.onChildProcessOutput.bind(this));
	this.childProcess.on("error",this.onChildProcessError.bind(this));
	this.childProcess.on("close",this.onChildProcessClose.bind(this));

	Fiber.yield();

	if (this.expectedReturnCode!=undefined) {
		if (this.returnCode!=this.expectedReturnCode) {
			if (!this.showOutput)
				console.log(this.output);

			if (this.workingPath)
				process.chdir(this.previousPath);

			throw new Error("Expected "+this.getFullCommand()+" to return "+this.expectedReturnCode+" but got "+this.returnCode);
		}
	}

	return this;
}

/**
 * Get full command for display.
 * @method getFullCommand
 */
FiberJob.prototype.getFullCommand=function() {
	return this.cmd+" "+this.cmdArgs.join(" ");
}

/**
 * Add arguments.
 * @method args
 * @chainable
 */
FiberJob.prototype.arg=function() {
	var i;

	for (i=0; i<arguments.length; i++)
		this.cmdArgs=this.cmdArgs.concat(arguments[i]);

	return this;
}

/**
 * Show output or not.
 * @method show
 * @chainable
 */
FiberJob.prototype.show=function() {
	this.showOutput=true;

	return this;
}

/**
 * Child process output.
 * @method onChildProcessOutput
 * @private
 */
FiberJob.prototype.onChildProcessOutput=function(data) {
	this.output+=data;

	if (this.showOutput) {
		process.stdout.write(data);
	}
}

/**
 * Child process is complete.
 * @method onChildProcessClose
 * @private
 */
FiberJob.prototype.onChildProcessClose=function(res) {
	this.returnCode=res;

	if (this.workingPath)
		process.chdir(this.previousPath);

	this.fiber.run();
}

/**
 * Child process error.
 * @method onChildProcessError
 * @private
 */
FiberJob.prototype.onChildProcessError=function(e) {
	throw new Error("Unable to run command: "+this.getFullCommand());
}

/**
 * Set expected return code.
 * @method expect
 * @chainable
 */
FiberJob.prototype.expect=function(returnCode) {
	this.expectedReturnCode=returnCode;

	return this;
}

/**
 * Get return code.
 * @method getReturnCode
 * @private
 */
FiberJob.prototype.getReturnCode=function() {
	return this.returnCode;
}

/**
 * Get output.
 * @method getOutput
 * @private
 */
FiberJob.prototype.getOutput=function() {
	return this.output;
}

/**
 * Resolve command path.
 * @method resolveCmd
 * @private
 */
FiberJob.resolveCmd=function(cmd) {
	if (fs.existsSync(path.resolve(cmd)))
		cmd=path.resolve(cmd);

	if (process.platform="win32" && fs.existsSync(cmd+".cmd"))
		cmd=cmd+".cmd";

	return cmd;
}

module.exports=FiberJob;