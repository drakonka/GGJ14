ig.module(
    'game.entities.conveyor'
)
.requires(
    'impact.entity'
)

.defines(function(){

EntityConveyor = ig.Entity.extend({
    collides: ig.Entity.COLLIDES.NEVER,
    size: {x:60, y:770},

    onConveyorArr: [],

    factorySound: new ig.Sound( 'media/audio/factorysound.*', false ),

    zIndex: 50,
    animSheet: new ig.AnimationSheet( 'media/conveyorBelt.png', 60, 770 ),


    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.anims.idle = new ig.Animation( this.animSheet, 0.5, [0, 1, 2], false );
        this.currentAnim = this.anims.idle;
        ig.music.add( this.factorySound, 'factorySound' );
        this.factorySound.play();
    },
    
    update: function() {
        this.parent();
    },


    draw: function() {
        this.parent();
       
    }

});
});