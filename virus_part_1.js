var controls = new(function() {
    this.speed = 1;
    this.radius = 5;
    this.allowed_to_move = 0;
    // this.reoccurance_rate = 0;
    this.chance_to_transmit = 100;
    this.time_to_recover = 4;

    this.start_button = function() {
        if (global_timer !== null) {
            return;
        }
        global_timer = setInterval(paint_canvas, 20).val(++time_counter);
    };
    // this.pause_button = function() {
    //     // console.log("pause");
    //     clearInterval(global_timer);
    //     global_timer = null;
    // };
    this.restart_button = function() {
        initialise();
    }
})();
window.onload = function() {
    var gui = new dat.GUI({
        closed: false,
        remembered: {
            undefined: {
                "0": {},
            },
        },
        folders: {},
        load: JSON,
        // width: 400,
        autoPlace: false,
    });

    gui.add(controls, "speed", 1, 10).name("Speed To Move");
    gui.add(controls, "radius", 1, 10).name("Ball Radius (Size)");
    gui
        .add(controls, "allowed_to_move", 0, 200)
        .name("Number Allowed To Move");
    // gui.add(controls, "reoccurance_rate", 0, 8).name("Reoccurance Rate");
    gui
        .add(controls, "chance_to_transmit", 0, 100)
        .name("Chance to Transmit");
    gui.add(controls, "time_to_recover", 0, 20).name("Time To Recover");
    gui.add(controls, "start_button").name("Click To Start");
    // gui.add(controls, "pause_button").name("Click To Pause");
    gui.add(controls, "restart_button").name("Click To Restart");
    // gui.add(controls, "infect_random").name("Infect Random");
    gui.remember("Default");

    var customContainer = document.getElementById("controls-container");
    customContainer.append(gui.domElement);
};

function summary_count(data, query) {
    var result = 0;
    for (i = 0; i < data.length; i++) {
        var obj = data[i];
        if (obj.colour == query) {
            result++;
        }
    }
    return result;
}


function check_boundaries(canvas, ball) {
    // Checks if ball has collided with walls and adjust angles accordingly
    if (ball.x_position >= canvas.width - ball.radius) {
        ball.x_position = canvas.width - ball.radius - 1;
        ball.angle = Math.PI - ball.angle;
        ball.x_velocity = -1 * Math.cos(ball.angle) * ball.speed;
    }

    if (ball.x_position <= ball.radius) {
        ball.x_position = ball.radius + 1;
        ball.angle = Math.PI - ball.angle;
        ball.x_velocity = -1 * Math.cos(ball.angle) * ball.speed;
    }

    if (ball.y_position >= canvas.height - ball.radius) {
        ball.y_position = canvas.height - ball.radius - 1;
        ball.angle = 2 * Math.PI - ball.angle;
        ball.y_velocity = -1 * Math.sin(ball.angle) * ball.speed;
    }

    if (ball.y_position <= ball.radius) {
        ball.y_position = ball.radius + 1;
        ball.angle = 2 * Math.PI - ball.angle;
        ball.y_velocity = -1 * Math.sin(ball.angle) * ball.speed;
    }

    return ball;
}

function check_collision(ball1, ball2) {
    var absx = Math.abs(
        parseFloat(ball2.x_position) - parseFloat(ball1.x_position)
    );
    var absy = Math.abs(
        parseFloat(ball2.y_position) - parseFloat(ball1.y_position)
    );

    // find distance between two balls.
    var distance = absx * absx + absy * absy;
    distance = Math.sqrt(distance);
    // check if distance is less than sum of two radius - if yes, collision
    if (distance < parseFloat(ball1.radius) + parseFloat(ball2.radius)) {
        return true;
    }
    return false;
}

function process_collision(ball1, ball2) {
    // Sticky balls check from: https://gist.github.com/christopher4lis/f9ccb589ee8ecf751481f05a8e59b1dc
    if (
        (ball1.x_velocity - ball2.x_velocity) *
        (ball2.x_position - ball1.x_position) +
        (ball1.y_velocity - ball2.y_velocity) *
        (ball2.y_position - ball1.y_position) >=
        0
    ) {
        var vx1 =
            (ball1.x_velocity * (ball1.mass - ball2.mass) +
                2 * ball2.mass * ball2.x_velocity) /
            (ball1.mass + ball2.mass);
        var vy1 =
            (ball1.y_velocity * (ball1.mass - ball2.mass) +
                2 * ball2.mass * ball2.y_velocity) /
            (ball1.mass + ball2.mass);

        var vx2 =
            (ball2.x_velocity * (ball2.mass - ball1.mass) +
                2 * ball1.mass * ball1.x_velocity) /
            (ball1.mass + ball2.mass);
        var vy2 =
            (ball2.y_velocity * (ball2.mass - ball1.mass) +
                2 * ball1.mass * ball1.y_velocity) /
            (ball1.mass + ball2.mass);

        //set velocities for both balls
        ball1.x_velocity = vx1;
        ball1.y_velocity = vy1;
        ball2.x_velocity = vx2;
        ball2.y_velocity = vy2;
    }
    // while (check_collision(ball1, ball2)) {
    //   process_collision(ball1,ball2)
    // //    // ball1.x_position += ball1.x_velocity;
    // //   // ball1.y_position += ball1.y_velocity;
    // //   // ball2.x_position += ball2.x_velocity;
    // //   // ball2.y_position += ball2.y_velocity;
    // }
}

function recover(ball) {
    ball.colour = "purple";
}

function transmit_infection(ball1, ball2) {
    if (ball1.colour !== "purple" && ball2.colour !== "purple") {
        if (ball1.colour == "red" || ball2.colour == "red") {
            if (Math.random() * 100 < controls.chance_to_transmit) {
                ball1.colour = "red";
                ball2.colour = "red";
                setTimeout(recover, controls.time_to_recover * 1000, ball1);
                setTimeout(recover, controls.time_to_recover * 1000, ball2);
                // setTimeout(recover(ball1),recovery_time);
                // setTimeout(recover(ball2),recovery_time);
            }
        }
    }
}

function paint_canvas() {
    // if ((time_counter / 100) % controls.reoccurance_rate == 0) {
    //   var unlucky_index = Math.round(Math.random() * ball_array.length);
    //   ball_array[unlucky_index].colour = "red";
    // }
    if (time_counter >= area_width * 2) {
        clearInterval(global_timer);
    }
    for (var i = 0; i < ball_array.length; ++i) {
        // ball_array[i].speed = controls.speed;
        ball_array[i].radius = controls.radius;
        if (i < controls.allowed_to_move) {
            ball_array[i].allowed_to_move = false;
        } else {
            ball_array[i].allowed_to_move = true;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < ball_array.length; ++i) {
        var current_ball = ball_array[i];

        current_ball = check_boundaries(canvas, current_ball);

        for (var j = i + 1; j < ball_array.length; ++j) {
            if (check_collision(current_ball, ball_array[j])) {
                process_collision(current_ball, ball_array[j]);
                transmit_infection(current_ball, ball_array[j]);
            }
        }
        if (current_ball.allowed_to_move) {
            current_ball.x_position += current_ball.x_velocity;
            current_ball.y_position += current_ball.y_velocity;
        }
        ctx.beginPath();
        ctx.fillStyle = current_ball.colour;
        ctx.arc(
            current_ball.x_position,
            current_ball.y_position,
            current_ball.radius,
            0,
            Math.PI * 2,
            false
        );
        ctx.fill();
        ctx.closePath();
    }
    infected_count = summary_count(ball_array, "red");
    document.getElementById("infected_count").innerHTML =
        "Infected: " + infected_count;
    healthy_count = summary_count(ball_array, "blue");
    document.getElementById("healthy_count").innerHTML =
        "Healthy: " + healthy_count;
    recovered_count = summary_count(ball_array, "purple");
    document.getElementById("recovered_count").innerHTML =
        "Recovered: " + recovered_count;
    time_counter += 1;
    document.getElementById("recovered_count").innerHTML =
        "Timer: " + time_counter;

    area_ctx.fillStyle = "blue";
    area_ctx.fillRect(time_counter / 2, 0, 1, healthy_count);
    area_ctx.transform(1, 0, 0, -1, 0, area_canvas.height);
    area_ctx.fillStyle = "purple";
    area_ctx.fillRect(
        time_counter / 2,
        0,
        1,
        recovered_count + infected_count
    );
    area_ctx.fillStyle = "red";
    area_ctx.fillRect(time_counter / 2, 0, 1, infected_count);
    area_ctx.transform(1, 0, 0, -1, 0, area_canvas.height);

}


// Inspiration from http://bl.ocks.org/atul-github/0019158da5d2f8499f7f
var canvas = document.getElementById("mycanvas");
var ctx = canvas.getContext("2d");
ctx.canvas.width = document.getElementById(
    "simulation-block"
).clientWidth;
var area_canvas = document.getElementById("area_chart");
var area_ctx = area_canvas.getContext("2d");
// area_ctx.canvas.height = document.getElementById("summary-block").clientHeight
var area_width =
    document.getElementById("summary-block").clientWidth;
area_ctx.canvas.width = area_width;
// area_ctx.transform(1, 0, 0, -1, 0, area_canvas.height);
var ball_array = [];
var ball_count = 200;
// var recovery_time = 4000;
var time_counter = 0;

var global_timer = null;

function initialise() {


    ball_array = [];
    time_counter = 0;
    area_ctx.clearRect(0, 0, area_ctx.canvas.width, area_ctx.canvas.height);
    for (var i = 0; i < ball_count; i++) {
        // Initialise all balls and append to array
        var ball = {
            radius: controls.radius,
            angle: Math.random() * 360,
            mass: 1,
            allowed_to_move: true,
        };
        // ball.mass = ball.radius;
        ball.speed = controls.speed;
        if (i == 0) {
            ball.colour = "red";
            setTimeout(recover, controls.time_to_recover * 1000, ball);
        } else {
            ball.colour = "blue";
        }
        ball.x_position = Math.random() * (canvas.width - ball.radius);
        ball.y_position = Math.random() * (canvas.height - ball.radius);
        ball.x_velocity = Math.cos(ball.angle) * ball.speed;
        ball.y_velocity = Math.sin(ball.angle) * ball.speed;
        ball_array.push(ball);
    }

    global_timer = setInterval(paint_canvas, 20);
}

initialise();
