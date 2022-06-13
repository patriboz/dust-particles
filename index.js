import * as THREE from 'three';
import metaversefile from 'metaversefile';

import {
    Bezier, ColorOverLife, ColorRange,
    ConeEmitter,DonutEmitter, ConstantColor, ConstantValue, FrameOverLife,
    IntervalValue,
    PiecewiseBezier, PointEmitter, RandomColor,
    RenderMode, RotationOverLife,
    SizeOverLife, ParticleSystem, ParticleEmitter, BatchedParticleRenderer, ApplyForce
} from "./three.quarks.esm.js";

const {useApp, usePhysics, useCleanup, useFrame, useActivate, useLoaders} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1');	





class ParticleDemo {

    batchRenderer = null;
    groups = [];
    totalTime = 0;
    refreshIndex = 0;
    texture = null;
    isPlaying = true;

    render(delta) {

        this.groups.forEach(group =>
            group.traverse(object => {
                if (object instanceof ParticleEmitter) {
                    object.system.update(delta);
                }
            })
        );

        this.totalTime += delta;
        if (this.totalTime > 1) {
            this.totalTime = 0;
            this.refreshIndex = 0;
        }

        if (this.batchRenderer)
            this.batchRenderer.update();
    }

    rgbToVec(rgb) {
        return new THREE.Vector4(rgb.x / 255, rgb.y / 255, rgb.z / 255, 0.2);
    }

    initMuzzleEffect(index) {
        const group = new THREE.Group();
		
		const scaleFactor = 10;

        const flash = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: true,
            startLife: new IntervalValue(2.0, 50.0),
            startSpeed: new IntervalValue(0.1, 0.35),
            startSize: new IntervalValue(scaleFactor, scaleFactor),
            startColor: new ConstantColor(this.rgbToVec(new THREE.Vector3(84, 84, 84))),
            worldSpace: false,
            maxParticle: 5,
            //emissionOverTime: new ConstantValue(10),
            emissionOverTime: new IntervalValue(0.0,20.0),
            shape: new ConeEmitter({radius:3*scaleFactor,arc:6.283,thickness:1,angle:0.8}),
            texture: this.texture,
            blending: THREE.AdditiveBlending,
            renderMode: RenderMode.BillBoard,
            renderOrder: 2,
        });
        //flash.addBehavior(new ColorOverLife(new ColorRange(new THREE.Vector4(0.0, 0.0, 0.0, 1), new THREE.Vector4(0.0, 0.0, 0.0, 0))));
        flash.addBehavior(new ColorOverLife(new ColorRange(this.rgbToVec(new THREE.Vector3(84, 84, 84)), this.rgbToVec(new THREE.Vector3(166, 86, 0)))));
        flash.addBehavior(new ApplyForce(new Vector3(1, 0, 0), new ConstantValue(3)));
        //flash.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0.5), 0]])));
        flash.emitter.name = 'flash';
	    flash.emitter.rotation.set(1.5707963267948966, 0, 0);
	    //flash.emitter.position.set(10,0,0);
        //flash.emitter.system.endEmit();
        //flash.emitter.system.restart();
        group.add(flash.emitter);

        group.visible = false;
		//group.scale.set(0.01,0.01,0.01);
        this.scene.add(group);
        this.groups.push(group);
        group.updateMatrixWorld();
		
		
		
		
		
    }

    loadingFinished()
    {
        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        for (let i = 0; i < 100; i++) {
            this.initMuzzleEffect(i);
        }
    }

    initScene(tmpScene) {
        this.scene = tmpScene;

        this.texture = new THREE.TextureLoader().load(baseUrl + "textures/dust.png", (texture) => {
            this.texture.name = baseUrl+"textures/smoke.png";
            this.loadingFinished();
        })   
        return this.scene;
    }
	
	setPosition(pos)
	{
		if (this.batchRenderer)
		{
			this.batchRenderer.position.copy(pos);
            this.batchRenderer.updateMatrixWorld();
		}
	}
	
}






















































export default () => {
	
  const app = useApp();
  const itemPos = new THREE.Vector3(app.position.x,app.position.y,app.position.z);

  const localPlayer = metaversefile.useLocalPlayer();

  var demo = new ParticleDemo();
  demo.initScene(app);

  //console.log(itemPos);

  //demo.setPosition(new THREE.Vector3(0,0,0));

  demo.setPosition(itemPos);

	// activateCb = () => {
	// 	demo.changeVisible();
	// };

	// useActivate(() => {
	// 	activateCb && activateCb();
	// });
	
  /*document.addEventListener('keydown', function(event) {
    if (event.code == 'KeyI') {
      //console.log(localPlayer);
      console.log(localPlayer.position);
    }
  });*/

	useCleanup(() => {
	});

  const startTime = Date.now();
  let lastTimestamp = startTime;

  useFrame(({timestamp}) => {

    const now = Date.now();
    const timeDiff = (now - lastTimestamp) / 1000.0;
    lastTimestamp = now;

    if (localPlayer) {
      //demo.setPosition(new THREE.Vector3(localPlayer.position.x - itemPos.x * 2, localPlayer.position.y - (itemPos.y * 2) - 1.4, localPlayer.position.z - itemPos.z * 2));
      demo.render(timeDiff);
    }
  });

  return app;
};
