const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PADDLE_SPEED = 8;
const AI_SPEED = 4;

// Game state
let playerPaddle = { x: 10, y: canvas.height / 2 - PADDLE_HEIGHT / 2 };
let aiPaddle = { x: canvas.width - PADDLE_WIDTH - 10, y: canvas.height / 2 - PADDLE_HEIGHT / 2 };
let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    vx: Math.random() > 0.5 ? 5 : -5,
    vy: (Math.random() - 0.5) * 6
};
let playerScore = 0;
let aiScore = 0;

// Player control - Mouse movement
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerPaddle.y = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle within canvas
    playerPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerPaddle.y));
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#888";
    ctx.setLineDash([12, 18]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawScore() {
    ctx.font = "32px Segoe UI, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(playerScore, canvas.width / 4, 42);
    ctx.fillText(aiScore, canvas.width * 3 / 4, 42);
}

// Main game loop
function update() {
    // AI paddle movement: Track ball, but with limited speed
    let targetY = ball.y + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    if (aiPaddle.y < targetY) {
        aiPaddle.y += AI_SPEED;
    } else if (aiPaddle.y > targetY) {
        aiPaddle.y -= AI_SPEED;
    }
    aiPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiPaddle.y));

    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Collisions with top/bottom
    if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
        ball.vy *= -1;
        ball.y = Math.max(0, Math.min(canvas.height - BALL_SIZE, ball.y));
    }

    // Collisions with paddles
    // Player paddle
    if (
        ball.x <= playerPaddle.x + PADDLE_WIDTH &&
        ball.y + BALL_SIZE >= playerPaddle.y &&
        ball.y <= playerPaddle.y + PADDLE_HEIGHT
    ) {
        ball.vx = Math.abs(ball.vx);
        // Add a bit of "spin" based on where it hit the paddle
        let impact = ((ball.y + BALL_SIZE / 2) - (playerPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.vy += impact * 2;
    }
    // AI paddle
    if (
        ball.x + BALL_SIZE >= aiPaddle.x &&
        ball.y + BALL_SIZE >= aiPaddle.y &&
        ball.y <= aiPaddle.y + PADDLE_HEIGHT
    ) {
        ball.vx = -Math.abs(ball.vx);
        let impact = ((ball.y + BALL_SIZE / 2) - (aiPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.vy += impact * 2;
    }

    // Score check
    if (ball.x < 0) {
        aiScore++;
        resetBall(-1);
    } else if (ball.x + BALL_SIZE > canvas.width) {
        playerScore++;
        resetBall(1);
    }
}

function resetBall(direction) {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.vx = direction * 5;
    ball.vy = (Math.random() - 0.5) * 6;
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawNet();
    drawRect(playerPaddle.x, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, "#2ee");
    drawRect(aiPaddle.x, aiPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, "#e22");
    drawBall(ball.x, ball.y, BALL_SIZE, "#ffe600");
    drawScore();
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();