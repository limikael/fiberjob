fiberjob
========

Run external commands synchronously using Noje.js Fibers

Simple usage
------------

Run `ls`in a fiber:

    Fiber(function() {
        FiberJob("ls").run();
        // Do other stuff here, will be run _after_ the command is executed.
    }).run();

Arguments
---------

Use the chainable `arg` method:

    Fiber(function() {
        FiberJob("echo").arg("hello","world").run();
        // Do other stuff here, will be run _after_ the command is executed.
    }).run();

