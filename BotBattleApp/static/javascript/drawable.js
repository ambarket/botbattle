//--------------------------Drawable Objects------------------------------------
var drawableObject = function(x, y, width, height) {
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
};

drawableObject.prototype.draw = function(context) {
  context.fillRect(this.x,this.y, this.width, this.height);
};

/** options
 *  {
 *      x: Number
 *      y: number
 *      width:
 *      height:
 *      borderWidth:
 *      fillStyle:
 *      strokeStyle:
 */
var drawableRectangle = function(options) {
  drawableObject.call(this, options.x, options.y, options.width, options.height);
  this.borderWidth = options.borderWidth || 1;
  this.fillStyle = options.fillStyle || '#FFFFFF';
  this.strokeStyle = options.strokeStyle || 'black';
};

drawableRectangle.prototype = Object.create(drawableObject.prototype);
drawableRectangle.prototype.constructor = drawableRectangle;
drawableRectangle.prototype.draw = function(context) {
  context.beginPath();
  context.rect(this.x * TEST_ARENA.scale, this.y * TEST_ARENA.scale, this.width * TEST_ARENA.scale, this.height * TEST_ARENA.scale);
  context.fillStyle = this.fillStyle;
  context.fill();
  context.lineWidth = this.borderWidth;
  context.strokeStyle = this.strokeStyle;
  context.stroke();
};

/**
 * options : {
 *  imageSrc,   //required
 *  sourceX, 
 *  sourceY, 
 *  sourceWidth, 
 *  sourceHeight, 
 *  x,          //required
 *  y,           //required
 *  width,      //required
 *  height,         //required
 *  loadedCallback
 * }
 */
var drawableImage = function(options) {
  if (!options.imageSrc || 
      !options.x && !(options.x === 0) ||
      !options.y && !(options.y === 0) ||
      !options.width && !(options.width === 0) ||
      !options.height && !(options.height === 0)) {
    console.log("Error in drawableImage constructor, missing required arguments, returning null now");
    return null;
  }
  
  drawableObject.call(this, options.x, options.y, options.width, options.height);

  this.sourceX = options.sourceX || options.x;
  if (options.sourceX === 0) {this.sourceX = 0}
  this.sourceY = options.sourceY || options.y;
  if (options.sourceY === 0) {this.sourceY = 0}
  this.sourceWidth = options.sourceWidth || options.width;
  if (options.sourceWidth === 0) {this.sourceWidth = 0}
  this.sourceHeight = options.sourceHeight || options.height;
  if (options.sourceHeight === 0) {this.sourceWidth = 0}
  if (options.visible !== false) {options.visible = true} // enforce default of true this way
  this.visible = options.visible;
  
  // Note image starts loading as soon as the src attribute is set
  this.img = new Image();
  this.img.onload = options.loadedCallback;
  this.img.src = options.imageSrc;
};

drawableImage.prototype = Object.create(drawableObject.prototype);
drawableImage.prototype.constructor = drawableImage;
drawableImage.prototype.draw = function(context) {
	if(this.visible){
	  context.drawImage(this.img, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, 
	      this.x * TEST_ARENA.scale, this.y * TEST_ARENA.scale, this.width * TEST_ARENA.scale,  this.height * TEST_ARENA.scale); 
	}
};

/**
 * options : {
 *  imageSrc,   //required
 *  sourceX, 
 *  sourceY, 
 *  sourceWidth, 
 *  sourceHeight, 
 *  x,          //required
 *  y,           //required
 *  width,      //required
 *  height,         //required
 *  indexStart, 
 *  ticksPerFrame, 
 *  numberOfFrames,
 *  loop, 
 *  visible, 
 *  loadedCallback
 * }
 */
var drawableSprite = function(options) {
  var self = this;
  if (!options.imageSrc || 
      !options.x && !(options.x === 0) ||
      !options.y && !(options.y === 0) ||
      !options.width && !(options.width === 0) ||
      !options.height && !(options.height === 0)) {
    console.log("Error in drawableSprite constructor, missing required arguments, returning null now");
    return null;
  }
  
  drawableImage.call(this, options);

  this.frameIndex = options.indexStart || 0;
  this.ticksPerFrame = options.ticksPerFrame || 1;
  this.numberOfFrames = options.numberOfFrames || 1;
  this.loop = options.loop || false;
  if (options.visible !== false) {options.visible = true} // enforce default of true this way
  this.visible = options.visible;

  this.done = false;
  this.tickCount = 0;
  this.update = function () {
        if(!self.done){
          self.tickCount += 1;  
          if (self.tickCount > self.ticksPerFrame) {
            self.tickCount = 0;
            if(self.frameIndex < self.numberOfFrames - 1){
              self.frameIndex += 1; 
            }
            else{
              if (!self.loop) {
                self.done = true;
              }
              self.frameIndex = 0;
            }
          }
        }
  }; 
}
drawableSprite.prototype = Object.create(drawableImage.prototype);
drawableSprite.prototype.constructor = drawableSprite;
drawableSprite.prototype.draw = function(context) {  // TODO According to the profiler this is 10% cpu
    if(this.visible){
      if(this.numberOfFrames > 1){
        this.update();
        context.drawImage(this.img, 
                          this.frameIndex * this.sourceWidth / this.numberOfFrames, // must use total image width not sprite width
                          this.sourceY, 
                          this.sourceWidth / this.numberOfFrames, // image width / frames
                          this.sourceHeight, 
                          this.x * TEST_ARENA.scale,   // destination positionx
                          this.y * TEST_ARENA.scale,   // destination positiony
                          this.width * TEST_ARENA.scale,    // width you want it to be in the end
                          this.height * TEST_ARENA.scale);  // height you want it to be in the end
    }
    else{  
        context.drawImage(this.img, 
                          this.sourceX, 
                          this.sourceY, 
                          this.sourceWidth, 
                          this.sourceHeight, 
                          this.x * TEST_ARENA.scale, 
                          this.y * TEST_ARENA.scale, 
                          this.width * TEST_ARENA.scale, 
                          this.height * TEST_ARENA.scale);
    }
  }
}

drawableSprite.prototype.scale = drawableObject.prototype.scale;
