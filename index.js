const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const score = document.querySelector('#score')

canvas.width = innerWidth
canvas.height = innerHeight

class Boundary {
    static width = 31
    static height = 31
    constructor({ position }) {
        this.position = position
        this.width = 30
        this.height = 30
    }

    draw() {
        c.fillStyle = '#070082'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Player {
    constructor({ position, velocity, rotation}) {
        this.position = position
        this.velocity = velocity
        this.radius = 10.5
        this.radians = 0.75
        this.openRate = 0.065
        this.rotation = rotation
    }

    draw() {
        // Using save and restore so that the global canvas functions that we're going to use won't affect the contents on our screen.
        c.save()
        // translate function helps us to pick the pivot about which we want to rotate.
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        // We use negative translate so that the rest of the canvas remains unchanged.
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'  
        c.fill()
        c.closePath()
        c.restore()
    }
    //This will make our pac man move with the press of keys corresponding to the velocities
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        // Chomp animation
        if (this.radians < 0 || this.radians > .75) this.openRate = -this.openRate
        this.radians += this.openRate
    }
}

class Pellet {
    constructor({ position }) {
        this.position = position
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

class Ghost {
    constructor({ position, velocity, color = '#d40000'}) {
        this.position = position
        this.velocity = velocity
        this.radius = 13.5
        this.color = color
        this.previous_collisions = []
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color  
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const pellets = []
const boundaries = []
const player = new Player( {
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 1.4,
        y: 0 
    }
})
const ghost = [
    new Ghost({
    position: {
        x: Boundary.width * 10 + Boundary.width / 2,
        y: Boundary.height * 4 + Boundary.height / 2
    },
    velocity: {
        x: 1,
        y: 0
    }
}),
    new Ghost({
        position: {
            x: Boundary.width * 10 + Boundary.width / 2,
            y: Boundary.height * 8 + Boundary.height / 2
        },
        velocity: {
            x: 1,
            y: 0
        },
        color: '#e100ff'
    })
]

// const keys = {} creates an object to tell us which keys are being pressed down.
// w is a property, but w: {} is an object with a property called pressed, initially false for all keys.
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

// We're defining this lastkey to help us overwrite the previous key.
// Earlier, if you would press w and then d without letting go of w, the pac man would move infinitely in w's direction.
// We don't want that, so we can overwrite the last key in the keydown switch case to make it most effective.
let lastKey = ''
let current_score = -10
const map = [
    ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
    ['-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-'],
    ['-',' ','-',' ','-','-','-',' ','-',' ','-',' ','-',' ','-','-','-',' ','-',' ','-'],
    ['-',' ',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    ['-',' ','-','-',' ',' ',' ','-','-',' ','*',' ','-','-',' ',' ',' ','-','-',' ','-'],
    ['-',' ',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    ['-',' ','-',' ','-','-','-',' ','-',' ','-',' ','-',' ','-','-','-',' ','-',' ','-'],
    ['-',' ',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    ['-',' ','-','-',' ',' ',' ','-','-',' ','*',' ','-','-',' ',' ',' ','-','-',' ','-'],
    ['-',' ',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    ['-',' ','-',' ','-','-','-',' ','-',' ','-',' ','-',' ','-','-','-',' ','-',' ','-'],
    ['-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-'],
    ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-']

    // ['-','-','-','-','-','-','-','-','-','-','-'],
    // ['-',' ',' ',' ',' ',' ',' ',' ',' ',' ','-'],
    // ['-',' ','-',' ','-','-','-',' ','-',' ','-'],
    // ['-',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    // ['-',' ','-','-',' ',' ',' ','-','-',' ','-'],
    // ['-',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    // ['-',' ','-',' ','-','-','-',' ','-',' ','-'],
    // ['-',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    // ['-',' ','-','-',' ',' ',' ','-','-',' ','-'],
    // ['-',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    // ['-',' ','-',' ','-','-','-',' ','-',' ','-'],
    // ['-',' ',' ',' ',' ',' ',' ',' ',' ',' ','-'],
    // ['-','-','-','-','-','-','-','-','-','-','-']

    // ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
    // ['-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-'],
    // ['-',' ','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-',' ','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-',' ','-'],
    // ['-',' ','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ','-'],
    // ['-',' ','-',' ','-','-','-','-','-','-','-',' ','-','-',' ',' ','-','-','-','-','-','-','-','-',' ',' ','-','-','-',' ','-','-',' ',' ','-','-',' ','-'],
    // ['-',' ','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ',' ','-',' ','-',' ',' ',' ',' ','-',' ','-'],
    // ['-',' ','-','-','-',' ',' ','-','-','-','-',' ',' ','-',' ',' ',' ','-','-',' ','-',' ','-',' ',' ',' ',' ',' ','-',' ','-',' ',' ',' ',' ','-',' ','-'],
    // ['-',' ',' ',' ',' ',' ',' ','-',' ','-','-',' ',' ',' ',' ',' ',' ','-',' ',' ','-',' ',' ',' ',' ',' ',' ',' ','-',' ','-',' ',' ',' ',' ','-',' ','-'],
    // ['-',' ',' ',' ',' ',' ',' ','-',' ','-','-',' ',' ','-','-','-',' ','-',' ','-','-',' ',' ',' ',' ',' ',' ',' ','-',' ','-',' ',' ',' ',' ',' ',' ','-'],
    // ['-',' ','-',' ',' ',' ',' ','-',' ','-',' ',' ',' ',' ',' ',' ',' ','-',' ',' ','-',' ',' ',' ',' ',' ','-',' ','-',' ','-',' ',' ',' ',' ',' ',' ','-'],
    // ['-',' ','-',' ',' ',' ',' ','-',' ','-',' ',' ',' ',' ',' ',' ',' ','-','-','-','-',' ','-','-','-',' ','-',' ','-',' ','-',' ',' ',' ',' ','-',' ','-'],
    // ['-',' ','-',' ',' ',' ',' ','-',' ','-',' ',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ','-',' ','-','-','-','-','-',' ',' ','-','-','-',' ','-'],
    // ['-',' ','-',' ',' ',' ',' ','-',' ','-',' ',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ','-','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ','-'],
    // ['-',' ','-','-',' ',' ','-','-',' ','-','-',' ',' ','-','-','-','-','-','-','-','-','-',' ','-','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ','-'],
    // ['-',' ','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ','-'],
    // ['-',' ','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-',' ','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-',' ','-'],
    // ['-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-'],
    // ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-']
]

// i denotes what row we're dealing with in the matrix
map.forEach((row, i) => {
    row.forEach((symbol, j) => {                                                    
        switch (symbol) {
            case '-':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    }
                })
            )
            break
            case ' ':
                pellets.push(new Pellet({
                    position: {
                        x: j * Boundary.width + Boundary.width / 2,
                        y: i * Boundary.height + Boundary.height / 2
                    }
                })
            )
        }
    })
})

// This function checks for any collisions, circle represents player and rectangle represents boundary
function check_collision_for_pac_man({ circle, rectangle }) {
    // const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height && 
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width)
}
// This is the same function but for the ghost.
function check_collision({ circle, rectangle }) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding && 
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

let animationID
function animate() {
    animationID = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    // Now we'll set base velocities to 0 so that the pac man doesn't move infinitely and stops when we stop pressing a movement key.
    player.velocity.x = 0
    player.velocity.y = 0
    // Now we're adding conditions to move the pac man when movement keys are pressed.
    // We're also predicting if it may collide, if it does, velocity 0, if not, then velocity is set to 5 or -5 in the corresponding direction.
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            // We wrote {...player} to create an object of player instead of passing it as a property of circle.
            // ... is the spread operator. Now, all properties and methods within player are under circle.
            // Then we use , velocity: { } to edit the properties of velocity. 
            // THIS IS THE ACTUAL PREDICTION! 
            if ( check_collision_for_pac_man({ circle: {...player, velocity: { x: 0, y: -1.4}}, rectangle: boundary})) {
                player.velocity.y = 0
                break
            }
            else {
                player.velocity.y = -1.4
            }
        }    
    }
    else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i] 
            if ( check_collision_for_pac_man({ circle: {...player, velocity: { x: -1.4, y: 0}}, rectangle: boundary})) {
                player.velocity.x = 0
                break
            }
            else {
                player.velocity.x = -1.4
            }
        }    
    }
    else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i] 
            if ( check_collision_for_pac_man({ circle: {...player, velocity: { x: 0, y: 1.4}}, rectangle: boundary})) {
                player.velocity.y = 0
                break
            }
            else {
                player.velocity.y = 1.4
            }
        }    
    }
    else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i] 
            if ( check_collision_for_pac_man({ circle: {...player, velocity: { x: 1.4, y: 0}}, rectangle: boundary})) {
                player.velocity.x = 0
                break
            }
            else {
                player.velocity.x = 1.4
            }
        }    
    }

    // We remove eaten pellets here and increment the score value too!
    pellets.forEach((pellet, i) => {
        pellet.draw()

        if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius) {
            pellets.splice(i, 1)
            current_score += 10
            console.log(current_score)
            score.innerHTML = current_score
        }
    })
    boundaries.forEach((boundary) => {
        boundary.draw()
    })
    
    player.update()
    
    ghost.forEach((ghost) => {
        ghost.update()
        // Checking if ghost touches player.
        if (Math.hypot( ghost.position.x - player.position.x, ghost.position.y - player.position.y) < ghost.radius + player.radius) {
            cancelAnimationFrame(animationID)
            let popup = document.getElementsByClassName("popup")[0]
            popup.style.display = "flex"
            popup.innerText = "You Lose!\nRefresh to play again!"
            console.log('You Lose!\nRefresh to play again!')
            player.velocity.x = 0
            player.velocity.y = 0
        }

        // Checking if the player won.
        if ( pellets.length === 0 ) {
            cancelAnimationFrame(animationID)
            let popup = document.getElementsByClassName("popup")[0]
            popup.style.display = "flex"
            popup.innerText = "You Win!\nRefresh to play again!"
            console.log('You Win!\nRefresh to play again!')
            player.velocity.x = 0
            player.velocity.y = 0
        }        

        const collisions = []
        // sometimes there may be duplicates in the collisions array.
        // hence we use !collisions.includes() to push the alert only if it doesn't exist in the collisions array.
        boundaries.forEach(boundary => {
            if ( !collisions.includes('right') && check_collision({ circle: {...ghost, velocity: { x: 2, y: 0}}, rectangle: boundary}))
            {
                collisions.push('right')
            }

            if ( !collisions.includes('left') && check_collision({ circle: {...ghost, velocity: { x: -2, y: 0}}, rectangle: boundary}))
            {
                collisions.push('left')
            }

            if ( !collisions.includes('top') && check_collision({ circle: {...ghost, velocity: { x: 0, y: -2}}, rectangle: boundary}))
            {
                collisions.push('top')
            }

            if ( !collisions.includes('down') && check_collision({ circle: {...ghost, velocity: { x: 0, y: 2}}, rectangle: boundary}))
            {
                collisions.push('down')
            }
        })
        // This if statement makes sure that we are only looking at collisions at an instance.
        // We are not concerned about the collisions that were a risk before some time.
        if (collisions.length > ghost.previous_collisions.length){
            ghost.previous_collisions = collisions
        }
        // We use JSON.stringify to typecast these arrays into strings.
        // Without this, the equivalence for these two arrays will never be satisfied.
        if (JSON.stringify(collisions) !== JSON.stringify(ghost.previous_collisions)) {
            // These if statements will add all possible directions that our ghost can move in.
            if (ghost.velocity.x > 0) ghost.previous_collisions.push('right')
            else if (ghost.velocity.x < 0) ghost.previous_collisions.push('left')
            else if (ghost.velocity.y > 0) ghost.previous_collisions.push('down')
            else if (ghost.velocity.y < 0) ghost.previous_collisions.push('top')
            // pathways array filters out consistent collision prone directions and contains possible directions our ghost can move in.
            const pathways = ghost.previous_collisions.filter((collision) => {
                return !collisions.includes(collision)
            })
            // Now we're adding randomness to the direction that our ghost chooses to move in.
            const direction_now = pathways[Math.floor(Math.random() * pathways.length)]
            switch (direction_now) {
                case 'down':
                    ghost.velocity.x = 0
                    ghost.velocity.y = 2
                    break
                case 'top':
                    ghost.velocity.x = 0
                    ghost.velocity.y = -2
                    break
                case 'left':
                    ghost.velocity.x = -2
                    ghost.velocity.y = 0
                    break
                case 'right':
                    ghost.velocity.x = 2
                    ghost.velocity.y = 0
                    break
            }
            // After every case we will reset the previous collisions array so that the ghost always chooses its path from the instantaneous collision chances.
            ghost.previous_collisions = []
        }       
        
    })
    // This iff block changes the amount of rotation of our pac man based on the direction in which it is moving.
    if (player.velocity.x > 0) {
        player.rotation = 0
    }
    else if (player.velocity.x < 0) {
        player.rotation = Math.PI
    }
    else if (player.velocity.y > 0) {
        player.rotation = Math.PI / 2
    }
    else if (player.velocity.y < 0) {
        player.rotation = Math.PI * 1.5
    }
}   
animate()   

// we're grabbing the 'key' property from the event object. Hence ({ key }). 

// addEventListener('keydown', ({ key }) => {
//     switch (key) {
//         case 'w':
//             player.velocity.y = -5
//             break
//         case 'a':
//             player.velocity.x = -5
//             break
//         case 's':
//             player.velocity.y = 5
//             break
//         case 'd':
//             player.velocity.x = 5
//             break
//     }

//     console.log(player.velocity)
// })

// This is old. The issue was that changing directions caused the varying velocities to move the pac man in diagonals.
// Hence we introduced last key to keep track of latest key in effect.s
addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})