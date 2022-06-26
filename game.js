const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')
const score = document.querySelector('#score')
const start = document.querySelector('#start')
const get_started = document.querySelector('#get_started')
const final_score = document.querySelector('#final_score')

canvas.width = innerWidth
canvas.height = innerHeight


class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        // now we'll draw the projectile before updating the values.
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        // now we'll draw the projectile before updating the values.
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        // now we'll draw the projectile before updating the values.
        this.draw()
        // We're considering friction to slow down the explosion particles overtime
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}
// ensures that the player is at the centre of the screen regardless of the size of it.
const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, "white")                                                
// this array will help help us to iterate over all projectiles while animating them.
let projectiles = []
let enemies = []
let particles = []
let animationID
let current_score = 0
let restart_count = 0
function init() {
    restart_count += 1
    player = new Player(x, y, 10, "white")                                                
    projectiles = []
    enemies = []
    particles = []
    current_score = 0
    score.innerHTML = current_score
    final_score.innerHTML = current_score
}
function spawnEnemies() {
    setInterval(() => {
        // This specifiies that the radius of our enemies can take any value between 15 and 60
        const radius = Math.random() * (60 - 15) + 15
        let x
        let y
        // This if else block makes sure that enemies are spawned from the boundaries of our canvas, randomly.
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else {
            x = Math.random() * canvas.width 
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        // Randomising colors of enemies.
        // HSL is hue, saturation and lightness. 3 parameters.
        // We're randomising hue and using ` instead of ' so that we can compute math.random within the hsl function.
        const color = `hsl(${Math.random() * 500}, 90%, 50%`
        const angle = Math.atan2(canvas.height / 2 - y,canvas.width / 2 - x)
        const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000 * (2**restart_count)) // 1000 is the time in milisecs after which a new enemy is spawned
}

// requestAnimationFrame(animate) calls itself on loop infinitely once we call animate().
function animate() {
    animationID = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // we call this after every clear so that our player doesn't disappear after one clearRect call.
    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        }
        else {
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        // Removing projectiles from the animation when they exit the canvas
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        // Detecting enemy - player collision
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 0.5) {
            cancelAnimationFrame(animationID)
            get_started.style.display = 'flex'
            final_score.innerHTML = current_score
        }

        // Detecting enemy - projectile collision
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if (dist - enemy.radius - projectile.radius < 1) {
                
                // enemy.radius * 2 ensures that the number of particles are proportionate to the enemy size
                for (let i = 0 ; i < enemy.radius ; i++) {
                    // Math.random() - 0.5 ensures that our velocities will take random values between -0.5 and 0.5
                    // Math.random() * 2 ensures that particle radius will take any value between 0 and 2
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 7), y: (Math.random() - 0.5) * (Math.random() * 7)}))
                }
                if (enemy.radius - 10 > 15) {
                    // Incrementing score by 10 for shrinking an enemy
                    current_score += 10
                    score.innerHTML = current_score
                    // we use gsap to make the decrementing radius look smooth while it is animated on our canvas
                    gsap.to(enemy, {radius: enemy.radius - 15})
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
                else {
                    // Incrementing score by 50 for eliminating an enemy
                    current_score += 50
                    score.innerHTML = current_score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }        
        })
    })
}

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 4, 'white', velocity))
})

// What happens when we click 'START' 
start.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    get_started.style.display = 'none'
})
