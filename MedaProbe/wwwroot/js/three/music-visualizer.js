var app;
(function (app) {
    var media;
    (function (media) {
        class MusicVisualizer extends media.CamcorderBase {
            constructor(element, options) {
                super(element, options);
            }
            setupComponent() {
                super.setupComponent();
                this._simplexNoise = new window.SimplexNoise();
                this._fileItem = this._element.querySelector(".music-file .file-item");
                this._file = this._element.querySelector(".music-file input[type=file]");
                this._audio = this._element.querySelector(".music-file audio");
                this._closeFile = this._element.querySelector(".music-file button.item-remove");
                this._btnPlay.onclick = () => { this.startPlaying(); };
                this._btnPause.onclick = () => { this.pausePlaying(); };
                this._file.addEventListener("change", ev => { this.changeMusicFile(ev); });
                this._closeFile.addEventListener("click", ev => { this.closeMusicFile(); });
                this._btnPlay.classList.add('d-none');
                console.log("MusicVisualizer.setupComponent");
            }
            changeMusicFile(ev) {
                const upload = ev.target;
                if (!upload.files.length)
                    return;
                if (!this._audio)
                    return;
                const file = ev.target.files[0];
                this._audio.src = URL.createObjectURL(file);
                this._audio.load();
                this._fileItem.classList.remove("d-none");
                this._btnPlay.classList.remove('d-none');
                this._btnPause.classList.add('d-none');
                this._btnScreenshot.classList.add('d-none');
                this.clearScene();
            }
            closeMusicFile() {
                if (!this._audio)
                    return;
                this._audio.pause();
                this._audio.src = null;
                this._btnPlay.classList.add('d-none');
                this._btnPause.classList.add('d-none');
                this._btnScreenshot.classList.add('d-none');
                this._fileItem.classList.add("d-none");
                this.clearScene();
            }
            startPlaying() {
                var _a;
                if (!this._initialized) {
                    this.initializeScene();
                    this.initializeSoundAnalyzer();
                    // remove invite text
                    (_a = this._player.querySelector(".startup-text")) === null || _a === void 0 ? void 0 : _a.remove();
                }
                if (this._audio && this._audio.src) {
                    this._audio.play();
                    this.setControlState(true);
                    // add group into scene
                    this._scene.add(this._group);
                    // Start render scene
                    this.startSceneRendering();
                }
            }
            pausePlaying() {
                if (this._audio && this._audio.src) {
                    this._audio.pause();
                    this.setControlState(false);
                }
            }
            setControlState(streamStarted) {
                if (streamStarted) {
                    this._btnPlay.classList.add('d-none');
                    this._btnPause.classList.remove('d-none');
                }
                else {
                    this._btnPlay.classList.remove('d-none');
                    this._btnPause.classList.add('d-none');
                }
                if (this._initialized)
                    this._btnScreenshot.classList.remove('d-none');
                else
                    this._btnScreenshot.classList.add('d-none');
            }
            initializeSoundAnalyzer() {
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
            initializeScene() {
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(45, this._canvasVideo.width / this._canvasVideo.height, 0.1, 1000);
                scene.background = new THREE.Color(0x252d91);
                camera.position.set(0, 0, 100);
                camera.lookAt(scene.position);
                scene.add(camera);
                const renderer = new THREE.WebGLRenderer({ canvas: this._canvasVideo, alpha: true, antialias: true });
                renderer.setSize(this._canvasVideo.width, this._canvasVideo.height);
                const group = new THREE.Group();
                const planeBase = new THREE.PlaneGeometry(500, 500, 40, 40);
                const planeGeom = new THREE.PlaneGeometry(500, 500, 40, 40);
                const planeMater = new THREE.MeshLambertMaterial({
                    color: 0x6904ce,
                    side: THREE.DoubleSide,
                    wireframe: true,
                });
                // add first base plane
                const baseplane1 = new THREE.Mesh(planeBase, planeMater);
                baseplane1.rotation.x = -0.5 * Math.PI;
                baseplane1.position.set(0, 30, 0);
                // add first plane
                const plane1 = new THREE.Mesh(planeGeom, planeMater);
                plane1.rotation.x = -0.5 * Math.PI;
                plane1.position.set(0, 30, 0);
                group.add(plane1);
                // add second base plane
                const baseplane2 = new THREE.Mesh(planeBase, planeMater);
                baseplane2.rotation.x = -0.5 * Math.PI;
                baseplane2.position.set(0, -30, 0);
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
                spotLight.lookAt(ball.position);
                spotLight.castShadow = true;
                scene.add(spotLight);
                // save instance members
                this._scene = scene;
                this._camera = camera;
                this._group = group;
                this._renderer = renderer;
                this._ball = ball;
                this._basePlane1 = baseplane1;
                this._basePlane2 = baseplane2;
                this._plane1 = plane1;
                this._plane2 = plane2;
                this._initialized = true;
            }
            startSceneRendering() {
                const self = this;
                function renderScene() {
                    if (self._audio.paused)
                        return;
                    self.makeSceneDistortions();
                    self._ball.rotation.y += 0.0005;
                    self._renderer.render(self._scene, self._camera);
                    requestAnimationFrame(renderScene);
                }
                ;
                renderScene();
            }
            resizePlayer() {
                super.resizePlayer();
                if (this._initialized) {
                    // resize renderer
                    this._camera.aspect = this._canvasVideo.width / this._canvasVideo.height;
                    this._camera.updateProjectionMatrix();
                    this._renderer.setSize(this._canvasVideo.width, this._canvasVideo.height);
                }
            }
            clearScene() {
                this._scene.remove(this._group);
                this._renderer.render(this._scene, this._camera);
            }
            makeSceneDistortions() {
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
                if (!this._timeoutId) {
                    this._timeoutId = setTimeout(() => {
                        this.makeRoughGround(this._plane1, this._basePlane1, this.modulate(upperAvgFr, 0, 1, 0.5, 4));
                        this.makeRoughGround(this._plane2, this._basePlane2, this.modulate(lowerAvgFr, 0, 1, 0.5, 4));
                        this._timeoutId = 0;
                    }, 50);
                }
                // this modulates the sphere's shape.
                this.makeRoughBall(this._ball, this.modulate(Math.pow(lowerMaxFr, 0.5), 0, 1, 0, 8), this.modulate(upperAvgFr, 0, 1, 0, 4));
            }
            makeRoughBall(mesh, bassFr, treFr) {
                const ballGeom = mesh.geometry;
                const offset = ballGeom.parameters.radius;
                const time = window.performance.now();
                const amp = 0.7;
                const positions = mesh.geometry.attributes["position"].array;
                const count = positions.length / 3;
                const meshPositions = new Float32Array(positions.length); // 3 vertices per point
                for (let i = 0; i < count; i++) {
                    let vert = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                    vert.normalize();
                    const distance = (offset + bassFr) + this._simplexNoise.noise3D(vert.x + time * 0.00007, vert.y + time * 0.00008, vert.z + time * 0.00009) * amp * treFr;
                    vert.multiplyScalar(distance);
                    meshPositions[i * 3] = vert.x;
                    meshPositions[i * 3 + 1] = vert.y;
                    meshPositions[i * 3 + 2] = vert.z;
                }
                mesh.geometry.setAttribute('position', new THREE.BufferAttribute(meshPositions, 3));
                mesh.geometry.attributes.position.needsUpdate = true;
                mesh.geometry.computeBoundingBox();
                mesh.geometry.computeBoundingSphere();
                mesh.geometry.computeVertexNormals();
            }
            makeRoughGround(mesh, baseMesh, rgFr) {
                const planeGeom = mesh.geometry;
                const time = window.performance.now();
                const amp = 0.7;
                const positions = baseMesh.geometry.attributes["position"].array;
                const count = positions.length / 3;
                const meshPositions = new Float32Array(positions.length); // 3 vertices per point
                for (let i = 0; i < count; i++) {
                    let vert = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                    if (Math.round(Math.random()) > 0) {
                        const distance = this._simplexNoise.noise3D(time * 0.00007, time * 0.00008, time * 0.00009) * amp * rgFr;
                        vert.x += distance * Math.random();
                        vert.y += distance * Math.random();
                        vert.z += distance;
                    }
                    meshPositions[i * 3] = vert.x;
                    meshPositions[i * 3 + 1] = vert.y;
                    meshPositions[i * 3 + 2] = vert.z;
                }
                mesh.geometry.setAttribute('position', new THREE.BufferAttribute(meshPositions, 3));
                mesh.geometry.attributes.position.needsUpdate = true;
                mesh.geometry.computeBoundingBox();
                mesh.geometry.computeBoundingSphere();
                mesh.geometry.computeVertexNormals();
            }
            max(arr) {
                return arr.reduce((x, y) => Math.max(x, y));
            }
            avg(arr) {
                const total = arr.reduce((sum, x) => sum + x);
                return total / arr.length;
            }
            fractionate(value, minval, maxval) {
                return (value - minval) / (maxval - minval);
            }
            modulate(value, minval, maxval, minout, maxout) {
                const fr = this.fractionate(value, minval, maxval);
                const dx = maxout - minout;
                return minout + (fr * dx);
            }
            displayProbe() {
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
                }
                ;
                animate();
            }
        }
        media.MusicVisualizer = MusicVisualizer;
    })(media = app.media || (app.media = {}));
})(app || (app = {}));
//# sourceMappingURL=music-visualizer.js.map