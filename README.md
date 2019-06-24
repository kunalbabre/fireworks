# Fireworks App
SignalR based application that allows website users to light fireworks and display on all the connected site users. You can light single or multi shot using the app. There is also a button that can stimulate a crash /home/admin. Pressing the button again will make the application run again.

Source: [Github](https://github.com/kunalbabre/fireworks)

## Port Exposed
* 80

## Images [on Docker Hub](https://cloud.docker.com/u/kunalbabre/repository/docker/kunalbabre/fireworks): 

* Green: kunalbabre/fireworks:green
* Blue: kunalbabre/fireworks:blue
* Red: kunalbabre/fireworks:red
* Yellow: kunalbabre/fireworks:yellow

## Trigger fireworks manually 

* Trigger Single - ```/home/singleshot```
* Trigger Multishot - ```/home/multishot```


## Environment  variables 
* ```SIGNALR_CS```  : (optional) if you wish to scale-out you can provide connection string for Redis or Azure SignalR
* ```APP_COLOR```:  (works with latest tag): you can specify theme color for the app (red,green, blue, yellow)

## Health Monitoring 

* Liveness - ```/home/isRunning```
    * returns HTTP 200 if the application is alive
    * returns HTTP 400 if the application has crashed

* Readiness  - ```/home/isRunning``` 
    * returns HTTP 200 if the application is alive
    * returns HTTP 400 if the application has crashed

