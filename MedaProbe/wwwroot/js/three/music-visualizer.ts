

namespace app.media {

    export interface IVisualizerOptions extends ICamcorderOptions  {

    }

    export class MusicVisualizer extends CamcorderBase {

        protected _simplexNoise: simplexNoiseProxy.SimplexNoise;

        protected _fileItem: HTMLDivElement;
        protected _file: HTMLInputElement;
        protected _audio: HTMLAudioElement;
        protected _closeFile: HTMLButtonElement;


        protected _initialized: boolean;
        protected _scene: THREE.Scene;
        protected _camera: THREE.PerspectiveCamera;
        protected _renderer: THREE.Renderer;

        protected _ball: THREE.Mesh;

        protected _analyzer: AnalyserNode;
        protected _soundDataArray: Uint8Array;


        constructor(element: Element, options: IVisualizerOptions) {
            super(element, options);
        }

        protected setupComponent() {
            super.setupComponent();

            this._simplexNoise = new window.SimplexNoise();

            this._fileItem = this._element.querySelector(".music-file .file-item");
            this._file = this._element.querySelector(".music-file input[type=file]");
            this._audio = this._element.querySelector(".music-file audio");
            this._closeFile = this._element.querySelector(".music-file button.item-remove");

            this._btnPlay.onclick = () => { this.startPlaying() };
            this._btnPause.onclick = () => { this.pausePlaying(); };

            this._file.addEventListener("change", ev => { this.changeMusicFile(ev) });
            this._closeFile.addEventListener("click", ev => { this.closeMusicFile() });

            this._btnPlay.classList.add('d-none');

            console.log("MusicVisualizer.setupComponent");

        }

 
        protected changeMusicFile(ev: Event) {
            const upload = <HTMLInputElement>ev.target;
            if (!upload.files.length) return;

            if (!this._audio) return;
            const file = (<HTMLInputElement>ev.target).files[0];

            this._audio.src = URL.createObjectURL(file);
            this._audio.load();

            this._fileItem.classList.remove("d-none");
            this._btnPlay.classList.remove('d-none');

        }

        protected closeMusicFile() {
            if (!this._audio) return;

            this._audio.pause();
            this._audio.src = null;

            this._btnPlay.classList.add('d-none');
            this._btnPause.classList.add('d-none');
            this._btnScreenshot.classList.add('d-none');

            this._fileItem.classList.add("d-none");
        }

        protected startPlaying() {

            if (!this._initialized) {

                this.initializeScene();

                this.initializeSoundAnalyzer();

                // remove invite text
                this._player.querySelector(".startup-text")?.remove();
            }

      
            if (this._audio && this._audio.src) {
                this._audio.play()
                this.setControlState(true)

                // Start render scene
                this.startSceneRendering();
            }

        }

        protected pausePlaying() {

            if (this._audio && this._audio.src) {
                this._audio.pause()
                this.setControlState(false)
            }
        }

        protected setControlState(streamStarted: boolean) {

            if (streamStarted) {
                this._btnPlay.classList.add('d-none');
                this._btnPause.classList.remove('d-none');
             } else {
                this._btnPlay.classList.remove('d-none');
                this._btnPause.classList.add('d-none');
            }

            if (this._initialized)
                this._btnScreenshot.classList.remove('d-none');
            else
                this._btnScreenshot.classList.add('d-none');

        }

        protected initializeSoundAnalyzer() {

            const context = new AudioContext();
            const src = context.createMediaElementSource(this._audio);
            const analyzer = context.createAnalyser();

            src.connect(analyzer);

            analyzer.connect(context.destination);
            analyzer.fftSize = 512;

            const bufferedLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferedLength);

            this._analyzer = analyzer;
            this._soundDataArray = dataArray;

        }

        protected initializeScene() {

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, this._canvasVideo.width / this._canvasVideo.height, 0.1, 1000);

            camera.position.set(0, 0, 100);
            camera.lookAt(scene.position);
            scene.add(camera);

            const renderer = new THREE.WebGLRenderer({ canvas: this._canvasVideo, alpha: true, antialias: true });
            renderer.setSize(this._canvasVideo.width, this._canvasVideo.height);

            const group = new THREE.Group();

            const planeGeom = new THREE.PlaneGeometry(800, 800, 20, 20);
            const planeMater = new THREE.MeshLambertMaterial({
                color: 0x6904ce,
                side: THREE.DoubleSide,
                wireframe: true,

            });

            // add first plane
            const plane1 = new THREE.Mesh(planeGeom, planeMater);
            plane1.rotation.x = -0.5 * Math.PI;
            plane1.position.set(0, 30, 0);
            group.add(plane1);

            // add second plane
            const plane2 = new THREE.Mesh(planeGeom, planeMater);
            plane2.rotation.x = -0.5 * Math.PI;
            plane2.position.set(0, -30, 0);
            group.add(plane2);

            // add ball
            const ballGeom = new THREE.IcosahedronGeometry(10, 4);
            const ballMater = new THREE.MeshLambertMaterial({
                color: 0xff00ee,
                wireframe: true,
            });

            const ball = new THREE.Mesh(ballGeom, ballMater);
            ball.position.set(0, 0, 0);
            group.add(ball);

            // add ambient light
            const ambientLight = new THREE.AmbientLight();
            scene.add(ambientLight);

            // add spot light
            const spotLight = new THREE.SpotLight(0xffffff);
            spotLight.intensity = 0.9;
            spotLight.position.set(-10, 20, 40);
            //spotLight.lookAt(null);
            spotLight.castShadow = true;
            scene.add(spotLight);

            scene.add(group);

            // save instance members
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;

            this._ball = ball;

            this._initialized = true;
             
        }

        protected startSceneRendering() {
            const self = this;

            function renderScene() {
                requestAnimationFrame(renderScene);

                //self.makeRoughBall(self._ball, 0, 0);

                self.makeSceneDistortions();

                self._renderer.render(self._scene, self._camera);
            };

            renderScene();
        }


         protected resizePlayer() {
            super.resizePlayer();

            if (this._initialized) {
                // resize renderer
                this._camera.aspect = this._canvasVideo.width / this._canvasVideo.height;
                this._camera.updateProjectionMatrix();
                this._renderer.setSize(this._canvasVideo.width, this._canvasVideo.height);
            }

        }

        protected makeSceneDistortions() {

            // get sound data
            this._analyzer.getByteTimeDomainData(this._soundDataArray);

            // slice the array into two halves
            const lowerHalfArray = Array.from(this._soundDataArray.slice(0, (this._soundDataArray.length / 2) - 1));
            const upperHalfArray = Array.from(this._soundDataArray.slice((this._soundDataArray.length / 2) - 1, this._soundDataArray.length - 1));

            // do some basic reductions/normalisations
            const lowerMax = this.max(lowerHalfArray);
            const lowerAvg = this.avg(lowerHalfArray);
            const upperAvg = this.avg(upperHalfArray);

            const lowerMaxFr = lowerMax / lowerHalfArray.length;
            const lowerAvgFr = lowerAvg / lowerHalfArray.length;
            const upperAvgFr = upperAvg / upperHalfArray.length;

            /* use the reduced values to modulate the 3d objects */
            // these are the planar meshes above and below the sphere

        }

        protected makeRoughBall(mesh: THREE.Mesh, bassFr: number, treFr : number) {
            const ballGeom = <THREE.IcosahedronGeometry>mesh.geometry;

            const offset = ballGeom.parameters.radius;
            const time = window.performance.now();
            const amp = 7;

            const positions = mesh.geometry.attributes["position"].array;
            const count = positions.length / 3;

            for (let i = 0; i < count; i++) {
                let vert = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

                vert.normalize();
                const distance = (offset + bassFr) + this._simplexNoise.noise3D(
                    vert.x + time * 0.00007,
                    vert.y + time * 0.00008,
                    vert.z + time * 0.00009
                ) * amp * treFr;
                vert.multiplyScalar(distance);

                //positions[i * 3] = vert.x;

            }

            //mesh.geometry.setAttribute("position", new THREE.BufferAttribute())

            //this._simplexNoise.noise3D()

            //const vec = new THREE.Vector3(0, 0, 0);

            //vec.multiplyScalar(40);

            //geometry.com

            //mesh.geometry.vertices.forEach(function (vertex, i) {

            //    var offset = mesh.geometry.parameters.radius;
            //    var time = window.performance.now();
            //    vertex.normalize();
            //    var distance = (offset + bassFr) + noise.noise3D(
            //        vertex.x + time * 0.00007,
            //        vertex.y + time * 0.00008,
            //        vertex.z + time * 0.00009
            //    ) * amp * treFr;
            //    vertex.multiplyScalar(distance);
            //});

            //mesh.geometry.verticesNeedUpdate = true;
            //mesh.geometry.normalsNeedUpdate = true;
            //mesh.geometry.computeVertexNormals();
            //mesh.geometry.computeFaceNormals();

            //geometry.


        }

        protected max(arr: number[]): number {
            return arr.reduce((x, y) => Math.max(x, y));
        }

        protected avg(arr: number[]): number {
            const total = arr.reduce((sum, x) => sum + x);
            return total / arr.length;
        }

        protected fractionate(value: number, minval: number, maxval: number): number {
            return (value - minval) / (maxval - minval);
        }

        protected modulate(value: number, minval: number, maxval: number, minout: number, maxout: number): number {
            const fr = this.fractionate(value, minval, maxval);
            const dx = maxout - minout;
            return minout + (fr * dx);
        }


        public displayProbe() {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            this._element.appendChild(renderer.domElement);

            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);

            camera.position.z = 5;

            function animate() {
                requestAnimationFrame(animate);

                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;

                renderer.render(scene, camera);
            };

            animate();

        }

    }

}