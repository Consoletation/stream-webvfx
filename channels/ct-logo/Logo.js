import * as THREE from 'three';
import Pumper from 'pumper';

// Big logo code
class Logo {
    constructor(text, splitPoint, typeFace, color) {
        this.fulltext = text;
        this.splitPoint = splitPoint;
        this.text = [
            this.fulltext.slice(0, this.splitPoint),
            this.fulltext.slice(this.splitPoint, this.fulltext.length)
        ];
        this.font = [
            '600 160px ' + typeFace,
            '300 160px ' + typeFace
        ];
        this.color = color;
        this.sections = [
            {
                text: this.text[0],
                font: this.font[0],
                bands: {}
            },
            {
                text: this.text[1],
                font: this.font[1],
                bands: {}
            }
        ];
        this.bands = {};
    }

    createBands() {
        this.bands.low = Pumper.createBands(80, 220, this.fulltext.length, 0.3, 0.39, 1.5);
        this.bands.mid = Pumper.createBands(1000, 2800, this.fulltext.length, 0.5, 0.77, 1.1);
        this.bands.high = Pumper.createBands(2440, 10400, this.fulltext.length, 0.6, 0.9, 1.5);

        this.sections[0].bands.low = this.bands.low.slice(0, this.splitPoint);
        this.sections[1].bands.low = this.bands.low.slice(this.splitPoint, this.fulltext.length);
        this.sections[0].bands.mid = this.bands.mid.slice(0, this.splitPoint);
        this.sections[1].bands.mid = this.bands.mid.slice(this.splitPoint, this.fulltext.length);
        this.sections[0].bands.high = this.bands.high.slice(0, this.splitPoint);
        this.sections[1].bands.high = this.bands.high.slice(this.splitPoint, this.fulltext.length);
    }

    createMeshs(scene) {
        this.sections.forEach(function(section) {
            let logoTextLayerContainer = new THREE.Object3D();
            scene.add(logoTextLayerContainer);

            let slices1 = [];
            let slices2 = [];
            let slices3 = [];
            let slices4 = [];
            let charArray = [];

            for (let i = 0; i < section.text.length; i++) {
                let bitmap = document.createElement('canvas');
                let g = bitmap.getContext('2d');
                bitmap.width = 1024;
                bitmap.height = 200;

                g.font = section.font;
                g.fillStyle = 'white';
                let currWidth = g.measureText(section.text.slice(0, i+1)).width;
                g.font = section.font;
                g.fillStyle = 'white';
                let prevWidth = g.measureText(section.text.slice(0, i)).width;

                bitmap.width = currWidth - prevWidth;

                // I'll never understand this
                if (section.text.charAt(i) == 'A') {
                    bitmap.width += 12.5;
                    currWidth -= 25;
                }
                if (section.text.charAt(i-1) == 'A') {
                    bitmap.width += 12.5;
                    prevWidth -= 25;
                }

                g.font = section.font;
                g.fillStyle = 'white';
                g.fillText(section.text.charAt(i), 0, 160);

                charArray.push({
                    bitmap: bitmap,
                    prevWidth: prevWidth,
                    currWidth: currWidth,
                });
            };
            for (let i = 0; i < charArray.length; i++) {
                let bitmap = charArray[i].bitmap;
                let prevWidth = charArray[i].prevWidth;
                let currWidth = charArray[i].currWidth;
                let texture = new THREE.Texture(bitmap);
                texture.needsUpdate = true;
                texture.minFilter = THREE.LinearFilter;

                let material = new THREE.MeshBasicMaterial({
                    map: texture,
                    color: this.color,
                    transparent: true,
                    opacity: 0.0,
                    side: THREE.DoubleSide,
                    polygonOffset: true,
                    polygonOffsetUnits: -1,
                    polygonOffsetFactor: 0
                });

                let posX = -charArray[charArray.length - 1].currWidth/2;
                posX -= charArray[0].bitmap.width/2;
                posX += prevWidth;
                posX += (currWidth-prevWidth)/2;
                let posY = 0;

                let logoTextLayerMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(bitmap.width, 200), material);
                logoTextLayerMesh.material.opacity = 0.6;
                logoTextLayerMesh.position.set(posX, posY, 0);
                logoTextLayerMesh.material.polygonOffsetFactor = -1;
                logoTextLayerContainer.add(logoTextLayerMesh);
                slices1.push(logoTextLayerMesh);

                let logoTextLayerMesh2 = logoTextLayerMesh.clone();
                logoTextLayerMesh2.material = material.clone();
                logoTextLayerMesh2.position.set(posX, posY, 0);
                logoTextLayerMesh2.material.polygonOffsetFactor = -2;
                logoTextLayerMesh2.material.opacity = 0.05;
                logoTextLayerContainer.add(logoTextLayerMesh2);
                slices2.push(logoTextLayerMesh2);

                let logoTextLayerMesh3 = logoTextLayerMesh.clone();
                logoTextLayerMesh3.material = material.clone();
                logoTextLayerMesh3.position.set(posX, posY, 0);
                logoTextLayerMesh3.material.polygonOffsetFactor = -3;
                logoTextLayerMesh3.material.opacity = 0.05;
                logoTextLayerContainer.add(logoTextLayerMesh3);
                slices3.push(logoTextLayerMesh3);

                let logoTextLayerMesh4 = logoTextLayerMesh.clone();
                logoTextLayerMesh4.material = material.clone();
                logoTextLayerMesh4.position.set(posX, posY, 0);
                logoTextLayerMesh4.material.polygonOffsetFactor = -4;
                logoTextLayerMesh4.material.opacity = 0.1;
                logoTextLayerContainer.add(logoTextLayerMesh4);
                slices4.push(logoTextLayerMesh4);
            };

            section.mesh = {
                container: logoTextLayerContainer,
                width: charArray[charArray.length - 1].currWidth,
                slices: [slices1, slices2, slices3, slices4]
            };
        }.bind(this));
        // Position calculation
        let totalWidth = this.sections[0].mesh.width + this.sections[1].mesh.width;
        this.sections[0].mesh.container.position.x -= (totalWidth - this.sections[0].mesh.width)/2;
        this.sections[1].mesh.container.position.x += (totalWidth - this.sections[1].mesh.width)/2;
    }

    meshUpdate(config) {
        // Base position calculation
        let totalWidth = this.sections[0].mesh.width + this.sections[1].mesh.width;
        this.sections[0].mesh.container.position.x = -(totalWidth - this.sections[0].mesh.width)/2;
        this.sections[1].mesh.container.position.x = +(totalWidth - this.sections[1].mesh.width)/2;
        this.sections[0].mesh.container.position.y = 0;
        this.sections[1].mesh.container.position.y = 0;
        // Offset from animConfig
        this.sections[0].mesh.container.position.x += config.positions.logo[0].x;
        this.sections[0].mesh.container.position.y += config.positions.logo[0].y;
        this.sections[1].mesh.container.position.x += config.positions.logo[1].x;
        this.sections[1].mesh.container.position.y += config.positions.logo[1].y;

        // Letter position and animation
        this.sections.forEach(function(section) {
            for (let letter = 0; letter < section.text.length; letter++) {
                // Band volumes
                let lowVolume = section.bands.low[letter].volume;
                let midVolume = section.bands.mid[letter].volume;
                let highVolume = section.bands.high[letter].volume;

                // Per slice
                for (let slice = 0; slice < section.mesh.slices.length; slice++) {
                    // Base positions
                    section.mesh.slices[slice][letter].position.y = config.positions.letters.y[slice];
                    section.mesh.slices[slice][letter].position.z = config.positions.letters.z[slice];
                    // high work
                    section.mesh.slices[slice][letter].position.y += highVolume * config.multipliers.letters.high.y[slice];
                    section.mesh.slices[slice][letter].position.z += highVolume * config.multipliers.letters.high.z[slice];
                    // mid work
                    section.mesh.slices[slice][letter].position.y += midVolume * config.multipliers.letters.mid.y[slice];
                    section.mesh.slices[slice][letter].position.z += midVolume * config.multipliers.letters.mid.z[slice];
                    //low work
                    section.mesh.slices[slice][letter].position.y += lowVolume * config.multipliers.letters.low.y[slice];
                    section.mesh.slices[slice][letter].position.z += lowVolume * config.multipliers.letters.low.z[slice];
                    //global work
                    section.mesh.slices[slice][letter].position.y += Pumper.volume * config.multipliers.letters.global.y[slice];
                    section.mesh.slices[slice][letter].position.z += Pumper.volume * config.multipliers.letters.global.z[slice];
                }
            }
        });
    };
};

export default Logo;
