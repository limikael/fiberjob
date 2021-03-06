fiberjob
========

Run external commands synchronously using Noje.js Fibers

Simple usage
------------

Run `ls` in a fiber:

    Fiber(function() {
        var files=FiberJob("ls").run().getOutput();
        // Do other stuff here, will be run _after_ the command is executed.
    }).run();

Arguments
---------

Arguments can be applied using the chainable `arg` method:

    Fiber(function() {
        FiberJob("echo").arg("hello","world").run();
    }).run();

If your arguments should be somewhat more complex:

    Fiber(function() {
        var f=FiberJob("echo");
        f.arg("hello");
        f.arg("world");
        f.run();
    }).run();

Show output
-----------

By default, the output of the command is stored in the object and can be retreived using the `getOutput` method. You can also send the output to standard out:

    Fiber(function() {
        FiberJob("echo").arg("hello","world").show().run();
    }).run();

Return code
-----------

In addition to `getOutput` there is also `getReturnCode` to get the command's return code:

    Fiber(function() {
        var f=FiberJob("ls");
        f.run();
        var output=f.getOutput();
        var code=f.getReturnCode();
    }).run();

Fail if things didn't go well
-----------------------------

Often in script situations, we want to run an external command and make sure it has a return code that signals success. If it does, we are not particularly interested in the output, but if not, we would like to know what went wrong. The `expect` method does exactly this:

    Fiber(function() {
        FiberJob("ls").expect(0).run();
    }).run();
