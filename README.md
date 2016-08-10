Store console.log messages
==========================

Usage
-----

This is a simple script to be included via


    <script type="text/javascript" src="console-log-store.min.js"></script>


into your web site. Then log messages are captured

    > Logger.list()
    []

    > console.log(123)

    > log0 = Logger.list()[0]
    Object {level: "DEFAULT", date: Wed Aug 10 2016 18:17:38 GMT+0200 (CEST), message: "123"}
    
    > log0.level
    "DEFAULT"
    
    > log0.date
    Wed Aug 10 2016 18:17:38 GMT+0200 (CEST)
    
    > log0.message
    "123"


One unavoidable problem is that the source line in the browser log
then points to the console-log-store.min.js script; In Chrome you can
then blackbox the script to prevent this: Dev tools -> Settings ->
Blackboxing -> Add pattern "console-log-store.min.js".


Build
-----

Checkout and run "npm run build"
