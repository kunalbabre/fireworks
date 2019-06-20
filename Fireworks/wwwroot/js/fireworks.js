// when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
// not supported in all browsers though and sometimes needs a prefix, so we need a shim




function fireworks(counters, canvasId) {
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 10000 / 60);
            };
    })();
    // now we will setup our basic variables for the demo
    var canvas = document.getElementById(canvasId),
        ctx = canvas.getContext('2d'),
        // full screen dimensions
        cw = window.innerWidth,
        ch = window.innerHeight,
        // firework collection
        fireworks = [],
        // particle collection
        particles = [],
        // starting hue
        hue = 120,
        // when launching fireworks with a click, too many get launched at once without a limiter, one launch per 5 loop ticks
        limiterTotal = 50,
        limiterTick = 0,
        // this will time the auto launches of fireworks, one launch per 80 loop ticks
        timerTotal = 30,
        timerTick = 0,
        mousedown = false,
        // mouse x coordinate,
        mx,
        // mouse y coordinate
        my;

    // set canvas dimensions
    canvas.width = cw;
    canvas.height = ch;

    // now we are going to setup our function placeholders for the entire demo

    // get a random number within a range
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // calculate the distance between two points
    function calculateDistance(p1x, p1y, p2x, p2y) {
        var xDistance = p1x - p2x,
            yDistance = p1y - p2y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    // create firework
    function Firework(sx, sy, tx, ty, speed, acceleration) {
        // actual coordinates
        this.x = sx;
        this.y = sy;
        // starting coordinates
        this.sx = sx;
        this.sy = sy;
        // target coordinates
        this.tx = tx;
        this.ty = ty;
        // distance from starting point to target
        this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
        this.distanceTraveled = 0;
        // track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
        this.coordinates = [];
        this.coordinateCount = 3;
        // populate initial coordinate collection with the current coordinates
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = speed;//15;
        this.acceleration = acceleration; //1.09;
        this.brightness = random(50, 360);
        // circle target indicator radius
        this.targetRadius = 0.5;
    }

    // update firework
    Firework.prototype.update = function (index) {
        // remove last item in coordinates array
        this.coordinates.pop();
        // add current coordinates to the start of the array
        this.coordinates.unshift([this.x, this.y]);

        // cycle the circle target indicator radius
        if (this.targetRadius < 3) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }

        // speed up the firework
        this.speed *= this.acceleration;

        // get the current velocities based on angle and speed
        var vx = Math.cos(this.angle) * this.speed,
            vy = Math.sin(this.angle) * this.speed;
        // how far will the firework have traveled with velocities applied?
        this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

        // if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty);
            // remove the firework, use the index passed into the update function to determine which to remove
            fireworks.splice(index, 1);
        } else {
            // target not reached, keep traveling
            this.x += vx;
            this.y += vy;
        }
    }

    // draw firework
    Firework.prototype.draw = function () {
        ctx.beginPath();
        // move to the last tracked coordinate in the set, then draw a line to the current x and y
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
        ctx.stroke();

        ctx.beginPath();
        // draw the target for this firework with a pulsing circle
        ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // create particle
    function Particle(x, y) {
        this.x = x;
        this.y = y;
        // track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        // set a random angle in all possible directions, in radians
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        // friction will slow the particle down
        this.friction = 0.95;
        // gravity will be applied and pull the particle down
        this.gravity = 1;
        // set the hue to a random number +-50 of the overall hue variable
        this.hue = random(hue - 50, hue + 50);
        this.brightness = random(50, 80);
        this.alpha = 1;
        // set how fast the particle fades out
        this.decay = random(0.015, 0.03);
    }

    // update particle
    Particle.prototype.update = function (index) {
        // remove last item in coordinates array
        this.coordinates.pop();
        // add current coordinates to the start of the array
        this.coordinates.unshift([this.x, this.y]);
        // slow down the particle
        this.speed *= this.friction;
        // apply velocity
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        // fade out the particle
        this.alpha -= this.decay;

        // remove the particle once the alpha is low enough, based on the passed in index
        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    };

    // draw particle
    Particle.prototype.draw = function () {
        ctx.beginPath();
        // move to the last tracked coordinates in the set, then draw a line to the current x and y
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.stroke();
    }

    // create particle group/explosion
    function createParticles(x, y) {
        // increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
        var particleCount = 50;
        while (particleCount--) {
            particles.push(new Particle(x, y));
        }
    }
    
    // main demo loop
    function loop() {
        // this function will run endlessly with requestAnimationFrame
        requestAnimFrame(loop);

        // increase the hue to get different colored fireworks over time
        // hue += 0.5;

        // create random color
        hue = random(0, 360);

        // normally, clearRect() would be used to clear the canvas
        // we want to create a trailing effect though
        // setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
        ctx.globalCompositeOperation = 'destination-out';
        // decrease the alpha property to create more prominent trails
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, cw, ch);
        // change the composite operation back to our main mode
        // lighter creates bright highlight points as the fireworks and particles overlap each other
        ctx.globalCompositeOperation = 'lighter';

        if (fireworks.length > 50) {
            fireworks=fireworks.slice(0, 50);
        }
        // loop over each firework, draw it, update it
        var i = fireworks.length;
        while (i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }

        // loop over each particle, draw it, update it
        var j = particles.length;
        while (j--) {
            particles[j].draw();
            particles[j].update(j);
        }

        // launch fireworks automatically to random coordinates, when the mouse isn't down
        if (timerTick >= timerTotal) {

            var totalShotsInLoop = counters.single + counters.multi; //saftey so we don't overload screen 
            var speed = totalShotsInLoop < limiterTotal ? 15 : 30;
            var acceleration = totalShotsInLoop < limiterTotal  ? 1.09 : 3;

            while (counters.single + counters.multi > 0) {
                if (counters.multi > 0) {
                    var r1 = random(0, cw);
                    var r2 = random(0, ch / 2);
                    fireworks.push(new Firework(cw / 2, ch, r1, r2, speed, acceleration));
                    fireworks.push(new Firework(cw / 2.3, ch + 20, r1 + 3, r2 + 12, speed, acceleration));
                    fireworks.push(new Firework(cw / 2.6, ch + 40, r1 + 5, r2 + 6, speed, acceleration));
                    fireworks.push(new Firework(cw / 2.9, ch + 60, r1 + 8, r2 + 18, speed, acceleration));
                    counters.multi = counters.multi > 0 ? counters.multi - 1 : 0;

                    counters.showMessage("Firing a multi-shot now...");
                    counters.total++;
                }
                if (counters.single > 0) {
                    fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2), speed, acceleration));
                    counters.single = counters.single > 0 ? counters.single  - 1 : 0;
                    counters.showMessage("Firing a single-shot now...");
                    counters.total++;
                }
                counters.update();
                timerTick = 0;


            }
            counters.update();
        } else {
            timerTick++;
            counters.showMessage("");
        }

    }

    if (window.addEventListener) // W3C standard
    {
        window.addEventListener('load', loop, false); // NB **not** 'onload'
    }
    else if (window.attachEvent) // Microsoft
    {
        window.attachEvent('onload', loop);
    }


}