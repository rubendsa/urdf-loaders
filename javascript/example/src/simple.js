import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    Mesh,
    PlaneBufferGeometry,
    ShadowMaterial,
    DirectionalLight,
    PCFSoftShadowMap,
    sRGBEncoding,
    Color,
    AmbientLight,
    Box3,
    LoadingManager,
    MathUtils,
} from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from '../../src/URDFLoader.js';

let scene, camera, renderer, robot, controls;

init();
render();

function init() {

    scene = new Scene();
    scene.background = new Color(0x263238);

    camera = new PerspectiveCamera();
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    // renderer.outputEncoding = sRGBEncoding;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.setClearColor(0xffffff);
    renderer.setClearAlpha(0);
    document.body.appendChild(renderer.domElement);

    // const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // renderer.setClearColor(0xffffff);
    // renderer.setClearAlpha(0);
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.outputColorSpace = THREE.SRGBColorSpace;

    // const ambientLight = new AmbientLight(0xffffff, 0.2);
    // scene.add(ambientLight);

    // const directionalLight = new DirectionalLight(0xffffff, 1.0);
    // directionalLight.castShadow = true;
    // directionalLight.shadow.mapSize.setScalar(1024);
    // directionalLight.position.set(5, 30, 5);
    // scene.add(directionalLight);

    const ambientColor = new THREE.Color('#8ea0a8');
    const ambientLight = new THREE.HemisphereLight(ambientColor, '#000');
    ambientLight.groundColor.lerp(ambientLight.color, 0.5);
    ambientLight.intensity = 0.5;
    ambientLight.position.set(0, 1, 0);
    scene.add(ambientLight);    


    const dirLight = new DirectionalLight(0xffffff);
    dirLight.position.set(4, 10, 1);
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.normalBias = 0.001;
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(dirLight.target);


    const ground = new Mesh(new PlaneBufferGeometry(), new ShadowMaterial({ opacity: 0.25 }));
    ground.rotation.x = -Math.PI / 2;
    ground.scale.setScalar(30);
    ground.receiveShadow = true;
    scene.add(ground);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 4;
    controls.target.y = 1;
    controls.update();

    // Load robot
    const manager = new LoadingManager();
    // const loader = new URDFLoader(manager);
    // loader.load('../../../urdf/T12/urdf/T12_flipped.URDF', result => {

    //     robot = result;

    // });
    const loader = new URDFLoader(manager);
    loader.packages = {
        'franka_description': '../../../urdf/franka_description/'
    };
    loader.load('../../../urdf/franka_description/robots/franka_panda.urdf', result => {
        robot = result;
    });

    // wait until all the geometry has loaded to add the model to the scene
    manager.onLoad = () => {

        robot.rotation.x = -1 * Math.PI / 2;
        robot.traverse(c => {
            c.castShadow = true;
            c.receiveShadow = true;
        });
        // for (let i = 1; i <= 6; i++) {

        //     robot.joints[`HP${ i }`].setJointValue(MathUtils.degToRad(30));
        //     robot.joints[`KP${ i }`].setJointValue(MathUtils.degToRad(120));
        //     robot.joints[`AP${ i }`].setJointValue(MathUtils.degToRad(-60));

        // }
        robot.joints['panda_joint4'].setJointValue(-2);
        console.log(robot.joints)
        robot.updateMatrixWorld(true);

        const bb = new Box3();
        bb.setFromObject(robot);

        // robot.position.y -= bb.min.y;
        scene.add(robot);

    };

    onResize();
    window.addEventListener('resize', onResize);

}

function onResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function render() {

    requestAnimationFrame(render);
    renderer.render(scene, camera);

}
