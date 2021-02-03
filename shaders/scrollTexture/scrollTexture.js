/**
 * Scrolltexture Shader
 * Fragment shader moves texture on emissive channel along x-axis.
 * @author Patrick Bozic <patrickbozic@protonmail.com>
 */

var ScrollTexture = pc.createScript('scrollTexture');

// Vertex shader asset
ScrollTexture.attributes.add('vs', {
  type: 'asset',
  assetType: 'shader',
  title: 'Vertex Shader'
});

// Fragment shader asset
ScrollTexture.attributes.add('fs', {
  type: 'asset',
  assetType: 'shader',
  title: 'Fragment Shader'
});

// Texture used on the emissive channel
ScrollTexture.attributes.add('emissiveMap', {
  type: 'asset',
  assetType: 'texture',
  title: 'Emissive Map'
});

// Texture used on the opacity channel
ScrollTexture.attributes.add('opacityMap', {
  type: 'asset',
  assetType: 'texture',
  title: 'Opacity Map'
});

// Start value. Range: 0 - 1
ScrollTexture.attributes.add('progressStart', {
  type: 'number',
  title: 'Start Progress Value',
  default: 0
});

// Stop value. Range: 0 - 1
ScrollTexture.attributes.add('progressStop', {
  type: 'number',
  title: 'Stop Progress Value',
  default: 1
});

// Speed
ScrollTexture.attributes.add('speed', {
  type: 'number',
  title: 'Speed',
  default: 1
});

// Scrolltexture will start once this event is fired on the app,
// like so: this.app.fire(eventStart)
ScrollTexture.attributes.add('eventStart', {
  type: 'string',
  title: 'Event Start'
});

// Stop event
ScrollTexture.attributes.add('eventStop', {
  type: 'string',
  title: 'Event Stop'
});





// initialize code called once per entity
ScrollTexture.prototype.initialize = function() {
  this.progressStart = pc.math.clamp(this.progressStart, 0, 1);
  this.progressStop = pc.math.clamp(this.progressStop, 0, 1);

  if(this.progressStart > this.progressStop) {
    throw new Error('Start value can\'t be bigger than stop value');
  }
  
  this.progress = this.progressStart;
    
  var app = this.app;
  var model = this.entity.model.model;
  var gd = app.graphicsDevice;

  var emissiveTexture = this.emissiveMap.resource;
  var opacityTexture = this.opacityMap.resource;

  var vertexShader = this.vs.resource;
  var fragmentShader = "precision " + gd.precision + " float;\n";
  fragmentShader = fragmentShader + this.fs.resource;

  // A shader definition used to create a new shader.
  var shaderDefinition = {
    attributes: {
      aPosition: pc.SEMANTIC_POSITION,
      aUv0: pc.SEMANTIC_TEXCOORD0
    },
    vshader: vertexShader,
    fshader: fragmentShader
  };

  // Create the shader from the definition
  this.shader = new pc.Shader(gd, shaderDefinition);

  // Create a new material and set the shader
  this.material = new pc.Material();
  this.material.alphaWrite = true;
  this.material.blendType = pc.BLEND_NORMAL;
  this.material.shader = this.shader;

  // Set the initial progress parameter
  this.material.setParameter('uProgress', this.progress);

  
  // Set textures
  this.material.setParameter('uEmissiveMap', emissiveTexture);
  this.material.setParameter('uOpacityMap', opacityTexture);


  // This will replace the material on the model with our new material
  // Please adjust mesh instance for correct reference
  model.meshInstances[0].material = this.material;
  
  this.app.on(this.eventStart, this.start, this);
  this.app.on(this.eventStop, this.stop, this);

  this.on('destroy', function() {
    this.app.off(this.eventStart, this.start, this);
    this.app.off(this.eventStop, this.stop, this);
  }, this);
};

ScrollTexture.prototype.start = function() {
  this.progress = this.progressStart;
  this.active = true;
};

ScrollTexture.prototype.pause = function() {
  this.active = false;
};

ScrollTexture.prototype.stop = function() {
  this.active = false;
  this.reset();
};

ScrollTexture.prototype.reset = function() {
  this.material.setParameter('uProgress', this.progressStart);
};

ScrollTexture.prototype.show = function() {
  this.entity.model.show();
};

ScrollTexture.prototype.hide = function() {
  this.entity.model.hide();
};

// update code called every frame
ScrollTexture.prototype.update = function(dt) {
  if(this.active) {
    if(this.progress > 1) {
      this.active = false;
      this.progress = this.progressStart;
    }
    this.material.setParameter('uProgress', this.progress);
    this.progress += (dt * this.speed);
  }
};
