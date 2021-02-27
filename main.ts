namespace SpriteKind {
    export const Ring = SpriteKind.create()
    export const RingBack = SpriteKind.create()
    export const Collectible = SpriteKind.create()
    export const Bird = SpriteKind.create()
}
let currentSpeed = 0
let areWeUnderTheSea = false
let controlLockEndTime = 0
let sloppy = false
let barrel_roll_count = 0
let flip_count = 0
let dolphinBody: Sprite = null
let edibleFishImages: Image[] = []
let edibleFishImagesRight: Image[] = []
let flippedImage: Image = null
let edibleFish: Sprite = null
let acellerationBoost = 0
let tileList: tiles.Location[] = []
let tileToCheck: tiles.Location = null
let touched_space = false
let tempo = 0
let dolphin: Sprite = null
let doingATrick = false
let dolphin_image: Image[] = []
let trick_string = ""
let direction = 0
let bird: Sprite = null
/**
 * Dolphin movement:
 * 
 * 1. underwater - no gravity
 * 
 * 2. above water - gravity
 * 
 * 3. momentum 
 * 
 * 4. large turn radius
 */
/**
 * barrel roll
 * 
 * flip 360
 * 
 * barrel roll + flip 360
 */
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    currentSpeed = 90
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    do_a_stunt()
})
function setIsUnderTheSea (underwater: boolean) {
    if (underwater) {
        if (!(areWeUnderTheSea)) {
            controlLockEndTime = game.runtime() + 500
            if (sloppy || (barrel_roll_count || flip_count)) {
                timer.after(1000, function () {
                    do_score()
                })
            }
        }
        dolphinBody.fx = 100
        dolphinBody.ay = 0
    } else {
        dolphinBody.fx = 0
        dolphinBody.ay = 200
    }
    areWeUnderTheSea = underwater
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    do_a_stunt()
})
function createEdibleFish () {
    edibleFishImages = [
    img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . 5 5 5 8 8 5 . . . . . 
        . . . 5 5 5 5 5 8 8 8 5 . . . 5 
        . . 5 5 5 5 5 5 5 8 8 5 8 . . 5 
        . 5 5 f 5 5 5 f 5 8 8 5 5 8 5 5 
        5 5 5 5 5 5 5 5 5 8 8 8 5 8 5 . 
        5 5 5 5 f f f 5 5 8 8 5 5 8 5 5 
        . 5 5 5 5 5 5 5 5 8 8 5 8 . 5 5 
        . . . 5 5 5 5 5 8 8 8 5 8 . 5 5 
        . . . . . 5 5 5 8 8 5 8 . . . 5 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `,
    img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . 4 4 1 4 4 . 4 4 . . . . 
        . . . 4 4 4 1 1 4 1 4 . . . . . 
        . . 4 f 4 f 4 1 4 1 4 . . . . . 
        . . . 4 4 4 1 4 . . 4 4 . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `,
    img`
        . . . . . . . . b a a . . . . . 
        . . . . . . . b a a . . . . . . 
        . . . . . . b b a a a . . . a . 
        . . . . . . a a a a a . . a 3 . 
        . . . . . a a a a a a . a 3 . . 
        . a a a a f a a f a a a a . . . 
        . c c c a a a a a a 3 a a . . . 
        . . . . a a a a a a 3 a a . . . 
        . . . . c c a a a 3 a a a . . . 
        . . . . . c c a 3 a a a a a . . 
        . . . . . . c c a a a . 3 a . . 
        . . . . . . c c a a a . . 3 3 . 
        . . . . . . . c a a a . . . 3 . 
        . . . . . . . . c a c . . . . . 
        . . . . . . . . . c c c . . . . 
        . . . . . . . . . . . c c . . . 
        `,
    img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . 7 . . . . . . . . . 
        . . . . . 7 7 . . . . . . . 7 7 
        . . 7 7 7 7 7 5 7 5 7 . 7 7 7 . 
        7 7 f 7 f 7 7 5 7 5 7 5 7 . . . 
        . 7 7 7 7 7 7 5 7 5 7 5 7 . . . 
        . . . . 8 8 7 . . . . . 7 7 . . 
        . . . . . . 8 . . . . . . 7 7 7 
        . . . . . . . . . . . . . . . 7 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `,
    img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . a a a a a . . . . . . 
        . . . a a a a f a a a . . . . . 
        8 a a a f a a a a a a a . . a a 
        8 8 a a a a a a a a 8 a a a 8 . 
        8 8 8 8 8 8 a a 8 a a 8 a 8 a . 
        . . . . 8 8 8 8 8 8 8 a . . a a 
        . . . . . 8 8 8 8 8 8 . . . . a 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `,
    img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . 2 . . . . . . . . . 
        . . . . 2 2 2 2 2 . 2 . . . . . 
        . . . 2 2 e 2 e e e 2 . . . . . 
        . . . . . . e . . . 2 . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `,
    img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . 5 8 5 . . . . . . . . . 
        . . . . 5 5 8 5 . 5 . . . . . . 
        . . . 5 5 5 8 5 8 . . . . . . . 
        . . . 5 5 5 8 5 8 . . . . . . . 
        . . . . 5 8 5 . . 5 . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `,
    img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . 9 . . . . . . . . 
        . . . . . 7 9 9 9 9 . . 7 . . . 
        . . . . 7 7 7 7 7 7 7 7 . . . . 
        . . . . . 7 7 7 7 7 . . 7 . . . 
        . . . . . . . 7 . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `
    ]
    edibleFishImagesRight = []
    for (let value of edibleFishImages) {
        flippedImage = value.clone()
        edibleFishImagesRight.push(flippedImage)
        flippedImage.flipX()
    }
    edibleFish = sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Food)
    sprites.setDataNumber(edibleFish, "imageIndex", randint(0, edibleFishImages.length - 1))
    sprites.setDataBoolean(edibleFish, "facingLeft", Math.percentChance(50))
    tiles.placeOnTile(edibleFish, getOffscreenOceanTile())
    updateEdibleFishDirection(edibleFish)
}
scene.onOverlapTile(SpriteKind.Food, assets.tile`tile2`, function (sprite, location) {
    sprite.vy = Math.abs(sprite.vy)
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`tile3`, function (sprite, location) {
    setIsUnderTheSea(false)
})
info.onCountdownEnd(function () {
    if (areWeUnderTheSea) {
        do_score()
    }
    game.over(true)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Collectible, function (sprite, otherSprite) {
    otherSprite.destroy(effects.confetti, 500)
    acellerationBoost += 1
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`tile1`, function (sprite, location) {
    setIsUnderTheSea(true)
})
function getOffscreenOceanTile () {
    tileList = tiles.getTilesByType(assets.tile`tile1`)
    tileToCheck = tileList.removeAt(randint(0, tileList.length - 1))
    while (!(tiles.locationXY(tileToCheck, tiles.XY.right) < dolphinBody.x - 80 || tiles.locationXY(tileToCheck, tiles.XY.left) > dolphinBody.x + 80)) {
        tileToCheck = tileList.removeAt(randint(0, tileList.length - 1))
    }
    return tileToCheck
}
function do_score () {
    info.changeScoreBy(barrel_roll_count * 200)
    if (flip_count) {
        info.changeScoreBy(2 ** flip_count * 200)
    }
    if (touched_space) {
        info.changeScoreBy(500)
    }
    if (sloppy) {
        info.changeScoreBy(-300)
    }
    sloppy = false
    barrel_roll_count = 0
    flip_count = 0
    touched_space = false
    update_trick_counter()
}
function updateEdibleFishDirection (fish: Sprite) {
    if (sprites.readDataBoolean(fish, "facingLeft")) {
        fish.setImage(edibleFishImages[sprites.readDataNumber(fish, "imageIndex")])
        fish.setVelocity(-5, randint(-5, 5))
    } else {
        fish.setImage(edibleFishImagesRight[sprites.readDataNumber(fish, "imageIndex")])
        fish.setVelocity(5, randint(-5, 5))
    }
}
scene.onHitWall(SpriteKind.Food, function (sprite, location) {
    sprites.setDataBoolean(sprite, "facingLeft", !(sprites.readDataBoolean(sprite, "facingLeft")))
    updateEdibleFishDirection(sprite)
})
function song_2 () {
    tempo = 700
    for (let index = 0; index < 2; index++) {
        for (let index = 0; index < 4; index++) {
            music.playMelody("C - E - G - - - ", tempo)
        }
        for (let index = 0; index < 4; index++) {
            music.playMelody("D - F - A - - - ", tempo)
        }
    }
    for (let index = 0; index < 2; index++) {
        for (let index = 0; index < 4; index++) {
            music.playMelody("E - G - B - - - ", tempo)
        }
        for (let index = 0; index < 4; index++) {
            music.playMelody("F - A - C5 - - - ", tempo)
        }
    }
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    currentSpeed += 50
    otherSprite.destroy(effects.disintegrate, 500)
    for (let index = 0; index < 3; index++) {
        dolphin.startEffect(effects.trail, 1000)
    }
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`tile10`, function (sprite, location) {
    touched_space = true
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.RingBack, function (sprite, otherSprite) {
    sprite.say("SICK!!!", 500)
    otherSprite.startEffect(effects.confetti, 500)
})
function do_a_stunt () {
    let titleHidden = 0
    if (titleHidden) {
        if (!(doingATrick)) {
            if (!(areWeUnderTheSea)) {
                timer.background(function () {
                    if (dolphinBody.vy < -200) {
                        animation.runImageAnimation(
                        dolphin,
                        [img`
                            ................................
                            ........bb......................
                            ........bbd.....................
                            .......bbbb.....................
                            ......bbbbb.....................
                            ......bbbbb.....................
                            .....bbbbfb.....................
                            ....bbbbbbbb....................
                            ....bbbbbbbb....................
                            ...bbbbbbbbb....................
                            ...bbbbbbbbbb...................
                            ...bbbbbbbbbb...................
                            ...bbbbbbbbbbb..................
                            ...bbbbbbbbbbb..................
                            ..bbbbbbbbbbbb..................
                            ..bbbbbbbbbb.bb.................
                            ..bbdbbbbbbb....................
                            ..bbdbbbbbbb....................
                            ..bbdbbbbbbb....................
                            .bbbdbbbbbb.....................
                            .bbb.bbbbbb.....................
                            ..b..bbbbbb.....................
                            ......bbbbb.....................
                            ......bbbbb.....................
                            .......bbbb.....................
                            ........bbb.....................
                            ........bbbb....................
                            .......bbbbb....................
                            ......bbbbbb....................
                            ......bb.bbb....................
                            .....bb...bb....................
                            ................................
                            `,img`
                            ................................
                            .......bb.......................
                            .......bb.......................
                            ......bbbb......................
                            ......bbbb......................
                            .....bbbbbb.....................
                            ....bfbbbbfb....................
                            ....bbbbbbbb....................
                            ....bbbbbbbb....................
                            ...bbbbbbbbb....................
                            ...bbbbbbbbb....................
                            ...bbbbbbbbbb...................
                            ..bbbbbbbbbbbb..................
                            .bbbbbbbbbbbbb..................
                            .bbbbbbcbbbbbbb.................
                            bbbbbbbcbbbbbbb.................
                            bbbbbbbcbbbbbbbb................
                            bbbbbbbcbbbbbbbb................
                            bbb.bbbcbbbb.bbb................
                            bb...bbbbbbb...b................
                            .....bbbbbb.....................
                            .....bbbbbb.....................
                            ......bbbbb.....................
                            ......bbbbb.....................
                            ......bbbbb.....................
                            ......bbbb......................
                            .....bbbbbb.....................
                            .....bbbbbbb....................
                            ....bbbbbbbbb...................
                            ...bbbb..bbbbb..................
                            ..bbb.....bbb...................
                            ................................
                            `,img`
                            ................................
                            .......db.......................
                            ......ddb.......................
                            ......ddb.......................
                            .....dbbb.......................
                            .....dbbbbb.....................
                            .....dbbbfb.....................
                            ....dbbbbbb.....................
                            ....dbbbbbbb....................
                            ...bdbbbbbbbb...................
                            ...bbbbbbbbbb...................
                            ...bbbbbbbbbbb..................
                            ...bbbbbbbbbbb..................
                            ..bbbbbbbbbbbb..................
                            ..bbbbbbbbbdbbb.................
                            .bbbbbbbbbbdbbb.................
                            .bbbbbbbbbbddbb.................
                            .bbbbbbbbbbbdbb.................
                            bbb.bbbbbbbb..b.................
                            b...bbbbbbbb....................
                            ....bbbbbbbb....................
                            .....bbbbbb.....................
                            .....bbbbb......................
                            .....bbbbb......................
                            .....bbbbb......................
                            .....bbbbb......................
                            .....bbbbbb.....................
                            .....bbbbbb.....................
                            ......bbbbb.....................
                            ......bbb.bb....................
                            ......bbb..bb...................
                            .......bb.......................
                            `,img`
                            ...ddb..........................
                            ...ddb..........................
                            ...ddbb.........................
                            ...ddbb.........................
                            ...ddbbbb.......................
                            ...dddbbbfb.....................
                            ...ddddbbbbb....................
                            ...dddddbbbb....................
                            ...ddddddbbbb...................
                            ...dddddddbbb...................
                            ...ddddddddbb...................
                            ...ddddddddbb...................
                            ...ddddddbbbb...................
                            ...ddddddbbbbb..................
                            ..bdddddddbbbbbb................
                            ..bbdddddddbbbbbb...............
                            ..bbdddddddbb..bbb..............
                            .bbbdddddddbb...................
                            .b..dddddddbb...................
                            ....ddddddbbb...................
                            ....ddddddbbb...................
                            ....ddddddbb....................
                            ....dddddbbb....................
                            .....ddddbb.....................
                            .....ddddbb.....................
                            .....ddddbb.....................
                            .....bbbbbb.....................
                            ....bbbbbbb.....................
                            ....bbbbbbb.....................
                            ...bbbb.bbb.....................
                            ..bbbb..bbbb....................
                            ..bbb.....bb....................
                            `,img`
                            ........bbd.....................
                            ........bbd.....................
                            ........bbd.....................
                            .......bbdd.....................
                            .......bbdd.....................
                            .....bbbdddd....................
                            ....bfbbdddd....................
                            ...bbbdddddd....................
                            ..bbbbdddddd....................
                            ..bbbddddddd....................
                            ..bbbddddddd....................
                            .bbbbddddddd....................
                            .bbbbddddddd....................
                            ..bbbdddddddb...................
                            ..bbbbddddddbb..................
                            ..bbbbddddddbbb.................
                            ..bbbbddddddbbbb................
                            ..bbbbdddddd...b................
                            ...bbbbddddd....................
                            ...bbbbdddd.....................
                            ...bbbbdddd.....................
                            ...bbbbdddd.....................
                            ....bbbddd......................
                            ....bbbddd......................
                            .....bbddd......................
                            .....bbbd.......................
                            .....bbbd.......................
                            .....bbbb.......................
                            ...bbbbbb.......................
                            ..bbbbbbbb......................
                            ..bbbb..bbb.....................
                            ................................
                            `,img`
                            ................................
                            ........bd......................
                            ........bdd.....................
                            ........bdd.....................
                            ......bbbdd.....................
                            .....bbfbdd.....................
                            .....bbbbdd.....................
                            ....bbbbbdd.....................
                            ....bbbbbbbb....................
                            ...bbbbbbbbb....................
                            ...bbbbbbbbbb...................
                            ...bbbbbbbbbb...................
                            ...bbbbbbbbbb...................
                            ...bbbbbbddbbb..................
                            ..bbbbbbbdd.bb..................
                            .bbbbbbbbdd..b..................
                            .bbbbbbbbdd.....................
                            bbbbbbbbbdd.....................
                            bbbbbbbbbdd.....................
                            bbb.bbbbbdd.....................
                            bb...bbbbdd.....................
                            b....bbbbbd.....................
                            ......bbbbd.....................
                            .......bbbd.....................
                            .......bbbb.....................
                            ........bbb.....................
                            ........bbb.....................
                            ........bbbb....................
                            .......bbbbbb...................
                            .......bbb.bbb..................
                            .......bb...bbb.................
                            ......bb......b.................
                            `],
                        100,
                        false
                        )
                        doingATrick = true
                        pause(600)
                        doingATrick = false
                        barrel_roll_count += 1
                    } else if (dolphinBody.vy > 0) {
                        if (dolphinBody.vx >= 0) {
                            animation.runImageAnimation(
                            dolphin,
                            dolphin_image,
                            50,
                            false
                            )
                        } else {
                            let backflip_images: number[] = []
                            animation.runImageAnimation(
                            dolphin,
                            backflip_images,
                            50,
                            false
                            )
                        }
                        doingATrick = true
                        pause(500)
                        doingATrick = false
                        if (areWeUnderTheSea) {
                            sloppy = true
                        } else {
                            flip_count += 1
                        }
                    }
                    update_trick_counter()
                })
            }
        }
    }
}
function update_trick_counter () {
    let trick_text_line_2: TextSprite = null
    let lame_text: TextSprite = null
    let trick_text: TextSprite = null
    trick_string = ""
    if (barrel_roll_count == 2) {
        trick_string = "2x "
    } else if (barrel_roll_count == 3) {
        trick_string = "3x "
    } else if (barrel_roll_count == 4) {
        trick_string = "4x "
    }
    if (barrel_roll_count >= 1) {
        trick_string = "" + trick_string + "BARREL ROLL "
        if (flip_count >= 1) {
            trick_string = "" + trick_string + "+ "
        }
    }
    if (flip_count >= 1) {
        trick_string = "" + trick_string + "FLIP " + 360 * flip_count
    }
    trick_text.setText(trick_string)
    trick_text.setPosition(80, 100)
    if (sloppy) {
        lame_text.setText("- SLOPPY")
    } else {
        lame_text.setText("")
    }
    lame_text.setPosition(80, 110)
    if (touched_space) {
        trick_text_line_2.setText("+ TOUCHED SPACE")
        trick_text.y += -5
        lame_text.y += 5
        trick_text_line_2.setPosition(80, 105)
    } else {
        trick_text_line_2.setText("")
    }
}
function moveTowardsAngle (degrees: number) {
    if (Math.abs(direction - degrees) < 180) {
        if (direction < degrees) {
            direction += 5
        } else if (direction > degrees) {
            direction += -5
        }
    } else {
        if (direction < degrees) {
            direction += -5
        } else if (direction > degrees) {
            direction += 5
        }
    }
    if (direction < 0) {
        direction += 360
    }
    if (direction > 360) {
        direction += -360
    }
    spriteutils.setVelocityAtAngle(dolphinBody, spriteutils.degreesToRadians(direction), currentSpeed)
    currentSpeed += 1 + acellerationBoost / 5
}
game.onUpdate(function () {
    dolphin.setPosition(dolphinBody.x, dolphinBody.y)
    if (areWeUnderTheSea && game.runtime() > controlLockEndTime) {
        if (controller.up.isPressed()) {
            if (controller.left.isPressed()) {
                moveTowardsAngle(225)
            } else if (controller.right.isPressed()) {
                moveTowardsAngle(315)
            } else {
                moveTowardsAngle(270)
            }
        } else if (controller.down.isPressed()) {
            if (controller.left.isPressed()) {
                moveTowardsAngle(135)
            } else if (controller.right.isPressed()) {
                moveTowardsAngle(45)
            } else {
                moveTowardsAngle(90)
            }
        } else if (controller.left.isPressed()) {
            moveTowardsAngle(180)
        } else if (controller.right.isPressed()) {
            moveTowardsAngle(0)
        } else {
            currentSpeed = 90
        }
    } else {
        currentSpeed = 90
        direction = Math.round(Math.map(Math.atan2(dolphinBody.vy, dolphinBody.vx), -3.14, 3.14, -180, 180))
        if (direction < 0) {
            direction += 360
        }
    }
    if (!(doingATrick)) {
        dolphin.setImage(dolphin_image[Math.round(Math.map((direction + 15) % 360, 0, 360, 0, 7))])
    }
})
game.onUpdate(function () {
    let altimeter: TextSprite = null
    if (!(areWeUnderTheSea)) {
        altimeter.setText("" + Math.floor((648 - dolphin.y) / 16) + "." + Math.trunc((648 - dolphin.y) / 1.6) % 10 + "m")
        altimeter.left = 2
        altimeter.top = 2
    } else {
        altimeter.setText("")
    }
})
game.onUpdateInterval(5000, function () {
    bird = sprites.create(img`
        . . . . . . . . f f f f . . . . 
        . . . . . . . . f f f f f . . . 
        . . . . . . . f f f 1 f f . . . 
        . . . . 1 1 f f 1 1 1 1 f f . . 
        . . . 1 1 1 f f 1 1 1 1 f f . . 
        . . 1 f 1 1 f f f 1 1 f f . 1 1 
        4 1 1 f 1 1 1 f f f f f 1 1 1 1 
        4 1 1 1 1 1 1 1 1 f f f 1 . . . 
        4 4 d 1 1 1 1 1 1 1 1 1 1 . . . 
        . . d d 1 1 1 1 1 1 1 1 1 . . . 
        . . . d d d 1 1 1 1 1 1 1 1 . . 
        . . . . . . . d 1 1 1 1 1 1 1 . 
        . . . . . . . . d d 1 1 4 1 1 4 
        . . . . . . . . . d 1 1 1 4 4 . 
        . . . . . . . . . . . . . . 4 4 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Bird)
    animation.runImageAnimation(
    bird,
    [img`
        . . . . . . . . f f f f . . . . 
        . . . . . . . . f f f f f . . . 
        . . . . . . . f f f 1 f f . . . 
        . . . . 1 1 f f 1 1 1 1 f f . . 
        . . . 1 1 1 f f 1 1 1 1 f f . . 
        . . 1 f 1 1 f f f 1 1 f f . 1 1 
        4 1 1 f 1 1 1 f f f f f 1 1 1 1 
        4 1 1 1 1 1 1 1 1 f f f 1 . . . 
        4 4 d 1 1 1 1 1 1 1 1 1 1 . . . 
        . . d d 1 1 1 1 1 1 1 1 1 . . . 
        . . . d d d 1 1 1 1 1 1 1 1 . . 
        . . . . . . . d 1 1 1 1 1 1 1 . 
        . . . . . . . . d d 1 1 4 1 1 4 
        . . . . . . . . . d 1 1 1 4 4 . 
        . . . . . . . . . . . . . . 4 4 
        . . . . . . . . . . . . . . . . 
        `,img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . 1 1 1 1 . . . . . . . . 
        . . . 1 1 1 1 1 1 1 . . . . . . 
        . . 1 f 1 1 1 1 1 1 1 1 . . 1 1 
        4 1 1 f 1 1 1 f 1 1 1 1 1 1 1 1 
        4 1 1 1 1 1 1 f f f 1 1 1 . . . 
        4 4 d 1 1 1 1 f f f f 1 1 . . . 
        . . d d 1 1 1 f f f f 1 1 . . . 
        . . . d d d 1 f f f f 1 1 1 . . 
        . . . . . . f f f f f 1 1 1 1 . 
        . . . . . . f f f f f 1 4 1 1 4 
        . . . . . . f f f f 1 1 1 4 4 . 
        . . . . . . f . . . . . . . 4 4 
        . . . . . . . . . . . . . . . . 
        `],
    500,
    true
    )
    tiles.placeOnRandomTile(bird, assets.tile`tile3`)
    bird.right = 864
    bird.vx = -70
    bird.setFlag(SpriteFlag.DestroyOnWall, true)
})
game.onUpdateInterval(1000, function () {
    if (sprites.allOfKind(SpriteKind.Food).length < 20) {
        createEdibleFish()
    }
})
