window.onload = function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let canvas = document.getElementById('canvas');

    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    let ball = {
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0
    };

    let gui = new dat.GUI();
    gui.add(ball, 'positionX').min(-5).max(5).step(0.1);
    gui.add(ball, 'positionY').min(-5).max(5).step(0.1);
    gui.add(ball, 'positionZ').min(-5).max(5).step(0.1);
    gui.add(ball, 'rotationX').min(-0.2).max(0.2).step(0.001);
    gui.add(ball, 'rotationY').min(-0.2).max(0.2).step(0.001);
    gui.add(ball, 'rotationZ').min(-0.2).max(0.2).step(0.001);

    let renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setClearColor(0x000000);

    let scene = new THREE.Scene();


    let camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    camera.position.set(0, 0, 1000);

    let controls = new THREE.OrbitControls( camera );
    controls.target.set( 0, 0, 0 );
    controls.update();

    let light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    let geometry = new THREE.SphereGeometry(200, 22, 22);
    let material = new THREE.MeshBasicMaterial({color: 0x0000ff, vertexColors: THREE.FaceColors});

    for (let i = 0; i < geometry.faces.length; i++) {
        geometry.faces[i].color.setRGB(Math.random(), Math.random(), Math.random());
    }

    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let geometry_2 = new THREE.SphereGeometry(400, 3, 3);
    let mesh_2 = new THREE.Mesh(geometry_2, material);
    // mesh_2.position(100,100,100);
    scene.add(mesh_2);

    function loop() {
        mesh.rotation.x += ball.rotationX;
        mesh.rotation.y += ball.rotationY;
        mesh.rotation.z += ball.rotationZ;
        mesh.position.x += ball.positionX;
        mesh.position.y += ball.positionY;
        mesh.position.z += ball.positionZ;
        mesh.lookAt(camera.position);
        renderer.render(scene, camera);
        requestAnimationFrame(function() {loop();});
    }

    loop();
}