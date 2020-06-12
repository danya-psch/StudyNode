Node = function () {

    let geometryRing = new THREE.TorusGeometry( 200, 40, 20, 1000 )
    let materialRing = new THREE.MeshBasicMaterial( { color: 0x111111, side: THREE.DoubleSide } );
    ///shpere
    let geometrySphere = new THREE.SphereGeometry(140, 22, 22);
    let materialSphere = new THREE.MeshBasicMaterial({color: 0x0000ff, vertexColors: THREE.FaceColors});
    for (let i = 0; i < geometrySphere.faces.length; i++) {
        geometrySphere.faces[i].color.setRGB(Math.random(), Math.random(), Math.random());
    }

	// let fireMaterial = new THREE.ShaderMaterial( {
    //     defines         : THREE.FireShader.defines,
    //     uniforms        : THREE.UniformsUtils.clone( THREE.FireShader.uniforms ),
    //     vertexShader    : THREE.FireShader.vertexShader,
    //     fragmentShader  : THREE.FireShader.fragmentShader,
	// 	transparent     : true,
	// 	depthWrite      : false,
    //     depthTest       : false
	// } );

    // initialize uniforms 

    let meshRing1 = new THREE.Mesh( geometryRing, materialRing );
    let meshSphere1 = new THREE.Mesh(geometrySphere, materialSphere);
};

Node.prototype = Object.create( THREE.Mesh.prototype );
Node.prototype.constructor = Node;