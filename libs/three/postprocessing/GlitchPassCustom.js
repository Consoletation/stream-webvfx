import {
	DataTexture,
	FloatType,
	MathUtils,
	RGBFormat,
	ShaderMaterial,
	UniformsUtils
} from "three";
import { Pass, FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { DigitalGlitch } from "three/examples/jsm/shaders/DigitalGlitch.js";

class GlitchPass extends Pass {
	constructor(dt_size = 64) {
		super();

		if (DigitalGlitch === undefined) console.error("GlitchPass relies on DigitalGlitch");

		const shader = DigitalGlitch;
		this.uniforms = UniformsUtils.clone(shader.uniforms);

		this.uniforms["tDisp"].value = this.generateHeightmap(dt_size);

		this.material = new ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader
		});

		this.fsQuad = new FullScreenQuad(this.material);

		this.goWild = false;
		this.curF = 0;
		this.generateTrigger();
	}

	render(renderer, writeBuffer, readBuffer) {
		this.uniforms["tDiffuse"].value = readBuffer.texture;
		this.uniforms['seed'].value = Math.random();
		this.uniforms['byp'].value = 0;

		if (this.goWild) {
			this.uniforms['amount'].value = Math.random() / 80;
			this.uniforms['angle'].value = MathUtils.randFloat(-Math.PI, Math.PI);
			this.uniforms['seed_x'].value = MathUtils.randFloat(-1, 1);
			this.uniforms['seed_y'].value = MathUtils.randFloat(-1, 1);
			this.uniforms['distortion_x'].value = MathUtils.randFloat(0, 1);
			this.uniforms['distortion_y'].value = MathUtils.randFloat(0, 1);
			this.curF = 0;
			this.generateTrigger();
		} else {
			this.uniforms['byp'].value = 1;
		}

		this.curF++;

		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);
		} else {
			renderer.setRenderTarget(writeBuffer);
			if (this.clear) renderer.clear();
			this.fsQuad.render(renderer);
		}
	}

	generateTrigger() {
		this.randX = MathUtils.randInt(120, 240);
	}

	generateHeightmap(dt_size) {
		let data_arr = new Float32Array(dt_size * dt_size * 3);
		let length = dt_size * dt_size;

		for (let i = 0; i < length; i++) {
			let val = MathUtils.randFloat(0, 1);
			data_arr[i * 3 + 0] = val;
			data_arr[i * 3 + 1] = val;
			data_arr[i * 3 + 2] = val;
		}

		return new DataTexture(data_arr, dt_size, dt_size, RGBFormat, FloatType);
	}
}

export { GlitchPass }
