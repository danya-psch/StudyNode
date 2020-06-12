
    let description = document.getElementById( 'description' );
    description.style.height = window.innerHeight * 0.6 + "px"
    ///
    
    ///

    const courseId = "<%=courseId%>";
    const courseName = "<%=courseName%>";


    function CreateGraph(items, root, user, teacher) {

        document.getElementById( 'creator' ).value = teacher;
        console.log(document.getElementById( 'creator' ).value);

        console.log(items, "!", root, "!", user, "!", teacher);

        let nodeInMove = false;

        let curNodeId;

        const MAXLENGTH = 20;

        let curId = 0;

        let camera, scene, renderer;

        const cameraSpeed = 5;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let canvas = document.getElementById('canvas' );
        
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        //nodes
        let mynodes = items;
        let _root = root;
        //

        //dataOfGraph
        let nodes = [];
        let connections = [];
        //

        //renderer
        renderer = new THREE.WebGLRenderer({canvas: canvas, antialias : true});
        //
        
        //scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xeeeeee );
        //

        //light
        let lights = [];
        lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 0 ].position.set( 0, 200, 0 );
        lights[ 1 ].position.set( 100, 200, 100 );
        lights[ 2 ].position.set( - 100, - 200, - 100 );
        scene.add( lights[ 0 ] );
        scene.add( lights[ 1 ] );
        scene.add( lights[ 2 ] );
        //

        //camera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        camera.position.set(0, 0, 400);
        //

        //controls
        let controls = new THREE.OrbitControls( camera );
        controls.minPolarAngle = Math.PI/3;
        controls.maxPolarAngle = Math.PI/3;
        controls.target.set( 0, -125, 0 );
        controls.update();
        //

        //shpere 
        let geometryNode = new THREE.SphereGeometry(10, 16, 16);
        let materialNode = new THREE.MeshLambertMaterial( { color: 0x0000ff } )
        //

        //create root
        let __root = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 16), new THREE.MeshLambertMaterial( { color: 0x222222 } ));
        scene.add(__root);
        __root.userData.id = _root._id;
        __root.userData.childs = _root.childs;
        __root.userData.parents = _root.parents;
        __root.userData.task = _root.task;
        __root.userData.root = true;
        __root.position.set(_root.position.x, _root.position.y, _root.position.z);
        nodes.push(__root);
        //
        
        //creating nodes
        for (let i = 0; i < mynodes.length; i++) {
            let mynode = mynodes[i];
            let node = new THREE.Mesh(geometryNode, new THREE.MeshLambertMaterial( { color: 0x555555 } ));
            scene.add(node);
            node.userData.id = mynode._id;
            node.userData.childs = mynode.childs;
            node.userData.parents = mynode.parents;
            node.userData.task = mynode.task;
            node.position.set(mynode.position.x, mynode.position.y, mynode.position.z);
            nodes.push(node);
        }

        //connection
        let materialConnection = new THREE.MeshBasicMaterial( {color: 0x111111} );
        //

        //creating connections
        mynodes.push(_root);
        for (let i = 0; i < mynodes.length; i++) {
            let current = mynodes[i];
            for (let j = 0; j < current.childs.length; j++) {
                const target = mynodes.find(node => {
                    if (node._id === current.childs[j]) return node;
                });
                const curNode = nodes.find(node => {
                    if (node.userData.id === current._id) return node;
                });
                const targetNode = nodes.find(node => {
                    if (node.userData.id === target._id) return node;
                });
                createConnection(curNode, targetNode);
            }
        }

        function createConnection(curNode, targetNode) {
            const len = curNode.position.distanceTo(targetNode.position) - 28;
            let geometryForCurConnection = new THREE.ConeBufferGeometry(2, len, 4); 
            geometryForCurConnection.rotateX( Math.PI / 2 );

            let connection = {
                target : targetNode.userData.id,
                father : curNode.userData.id,
                cone : new THREE.Mesh(geometryForCurConnection, materialConnection),
                position : new Rx.BehaviorSubject({
                    x : targetNode.position.x,
                    y : targetNode.position.y,
                    z : targetNode.position.z
                }),
                length : new Rx.BehaviorSubject(targetNode.position.distanceTo(curNode.position) - 28)
            }
            scene.add(connection.cone);
            
            connection.position.subscribe(val => {
                connection.cone.position.set((val.x + curNode.position.x) / 2, (val.y + curNode.position.y) / 2, (val.z + curNode.position.z) / 2)
            });

            connection.length.subscribe(val => connection.cone.scale.z = val / len);

            connection.cone.lookAt(targetNode.position);
            connections.push(connection);
        }
        //

        //
        let mouse = new THREE.Vector2(), INTERSECTED, INTERSECTED2;
        let raycaster = new THREE.Raycaster();
        //

        //dragControls
        let dragControls = new THREE.DragControls( nodes, camera, renderer.domElement );
        dragControls.addEventListener( 'dragstart', function () {
            controls.enabled = false;
        });
        dragControls.addEventListener( 'dragend', function () {
            controls.enabled = true;
        });
        //

        //addEventListener
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'keydown', onDocumentKeyDown, false);

        window.addEventListener( 'resize', onWindowResize, false );
        window.addEventListener( 'dblclick', onDoubleClick, false);
        window.addEventListener( 'mousedown', onMouseDown, false);
        window.addEventListener( 'mouseup', onMouseUp, false);

        document.getElementById( 'exit' ).addEventListener( 'click', () => {
            window.location.replace("/courses");
        }, false);

        document.getElementById( 'saveTask' ).addEventListener( 'click', function(event) {
            
            nodes.find(node => {
                if (node.userData.id === curNodeId) {
                    node.userData.task.name = document.getElementById( 'name' ).value;
                    node.userData.task.balls = document.getElementById( 'balls' ).value;
                    node.userData.task.description = document.getElementById( 'description' ).value;
                    console.log(node.userData.task._id);
                    fetch(`/tasks/update/${node.userData.task._id}`, {
                        method: 'POST',
                        headers: {
                            'Accept' : 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name : node.userData.task.name,
                            balls : node.userData.task.balls,
                            description : node.userData.task.description,
                            creator: teacher
                        })
                    });
                }
            })
            curNodeId = 0;
            

            modal.style.display = "none";
            controls.enabled = true;
        }, false);

        document.getElementsByClassName("close")[0].addEventListener( 'click', function(event) {
            modal.style.display = "none";
            controls.enabled = true;
        }, false);

        

        // document.getElementById( 'delete' ).addEventListener( 'click', () => {
        //     console.log("!");
        //     fetch(`/courses/delete/${courseId}`, {
        //         method: 'POST'
        //     });
        // }, false);

        animate();
            

        function removeObjFromScene(id) {
            scene.remove(scene.getObjectByName(id));
        }

        function animate() {
            requestAnimationFrame( animate );
            render();
        }

        function updateServerGraph() {
            let transferNodes = [];
            let root_;
            for (let node of nodes) {
                if (node.userData.root !== true) {
                    transferNodes.push({
                        position : node.position,
                        childs : node.userData.childs,
                        parents : node.userData.parents,
                        _id : node.userData.id,
                        task : node.userData.task._id
                    });
                } else {
                    root_ = node;
                }
            }
            fetch('/courses/update', {
                method: 'POST',
                headers: {
                    'Accept' : 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nodes : transferNodes,
                    creator: teacher,
                    root: {
                        position : root_.position,
                        childs : root_.userData.childs,
                        parents : root_.userData.parents,
                        _id : root_.userData.id,
                        task : root_.userData.task._id
                    }
                })
            });
        }

        function onMouseUp( event ) {
            if (nodeInMove === true) updateServerGraph()
            nodeInMove = false;
        }

        function onMouseDown( event ) {
            raycaster.setFromCamera( mouse, camera );
            let intersects = raycaster.intersectObjects( nodes );
            if ( intersects.length > 0 ) {
                if ( INTERSECTED != intersects[ 0 ].object ) {
                    if (event.ctrlKey) {
                        if ( INTERSECTED ) {
                            if ($.inArray(intersects[ 0 ].object.userData.id, INTERSECTED.userData.childs) === -1 &&
                                $.inArray(intersects[ 0 ].object.userData.id, INTERSECTED.userData.parents) === -1 &&
                                $.inArray(INTERSECTED.userData.id, intersects[ 0 ].object.userData.childs) === -1 &&
                                $.inArray(INTERSECTED.userData.id, intersects[ 0 ].object.userData.parents) === -1
                            ) {
                                INTERSECTED.userData.childs.push(intersects[ 0 ].object.userData.id);
                                intersects[ 0 ].object.userData.parents.push(INTERSECTED.userData.id);
                                createConnection(INTERSECTED, intersects[ 0 ].object);
                                updateServerGraph();
                            } else {
                                let index = INTERSECTED.userData.childs.indexOf(intersects[ 0 ].object.userData.id);
                                if (index > -1) INTERSECTED.userData.childs.splice(index, 1);
                                index = INTERSECTED.userData.parents.indexOf(intersects[ 0 ].object.userData.id);
                                if (index > -1) INTERSECTED.userData.parents.splice(index, 1);

                                index = intersects[ 0 ].object.userData.childs.indexOf(INTERSECTED.userData.id);
                                if (index > -1) intersects[ 0 ].object.userData.childs.splice(index, 1);
                                index = intersects[ 0 ].object.userData.parents.indexOf(INTERSECTED.userData.id);
                                if (index > -1) intersects[ 0 ].object.userData.parents.splice(index, 1);
                                let connection = connections.find(connection => {
                                    if ((connection.target === INTERSECTED.userData.id && connection.father === intersects[ 0 ].object.userData.id) ||
                                        (connection.target === intersects[ 0 ].object.userData.id && connection.father === INTERSECTED.userData.id))
                                        scene.remove(scene.getObjectById(connection.cone.id));
                                });
                                updateServerGraph();
                                    
                            }
                            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                            INTERSECTED = null;
                        } else {
                            INTERSECTED = intersects[ 0 ].object;
                            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                            INTERSECTED.material.emissive.setHex( 0x777777 );
                        }
                    } else if (event.shiftKey && intersects[ 0 ].object.userData.root !== true) {
                        //id of node for delete
                        let id = intersects[ 0 ].object.userData.id;
                        //

                        //delete conections
                        let connToDeleted = [];
                        for (let connection of connections) {
                            if (connection.target === id || connection.father === id) {
                                scene.remove(scene.getObjectById(connection.cone.id));
                                connToDeleted.push(connection);
                            }
                        }

                        for (let connection of connToDeleted) {
                            connections.splice(connections.indexOf(connection), 1);
                        }
                        //

                        //delete node from childs and parents
                        for (let node of nodes) {
                            node.userData.childs.splice(node.userData.childs.indexOf(id), 1);
                            node.userData.parents.splice(node.userData.parents.indexOf(id), 1);
                        }
                        //

                        //delete node from nodes
                        let position;
                        nodes.find(node => {
                            if (node.userData.id === id) {
                                scene.remove(scene.getObjectById(node.id));
                                position = nodes.indexOf(node);
                            }
                        });
                        nodes.splice(position, 1);
                        //

                        //delete node from db
                        let root_ = nodes.find(node => {
                            if (node.userData.root !== 'undefined') return node;
                        });

                        fetch(`/courses/deleteNode/${courseId}`, {
                            method: 'POST',
                            headers: {
                                'Accept' : 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id : id,
                                root: {
                                    position : root_.position,
                                    childs : root_.userData.childs,
                                    parents : root_.userData.parents,
                                    _id : root_.userData.id,
                                    task : root_.userData.task._id
                                },
                                creator : teacher
                            })
                        });
                        //

                        updateServerGraph();

                        if (typeof INTERSECTED !== 'undefined' ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                        INTERSECTED = null;
                    } else {
                        nodeInMove = true;
                    }
                } else {
                    nodeInMove = true;
                }
            } else {
                if (event.altKey && nodes.length <= MAXLENGTH) {
                    //get position of mouse
                    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                    vector.unproject( camera );
                    var dir = vector.sub( camera.position ).normalize();
                    var distance = - camera.position.z / dir.z;
                    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
                    //

                    //create node and set position
                    let node = new THREE.Mesh(geometryNode, new THREE.MeshLambertMaterial( { color: 0x555555 } ));
                    scene.add(node);
                    if (pos.x > camera.position.x + 400) pos.x = camera.position.x + 400;
                    else if (pos.x < camera.position.x - 400) pos.x = camera.position.x - 400;
                    if (pos.y > __root.y) pos.y = __root.y;
                    else if (pos.y < camera.position.y - 400) pos.y = camera.position.y - 400;
                    node.position.set( pos.x, pos.y, pos.z );
                    //

                    //insert node on server and set parameters
                    let root_ = nodes.find(node => {
                        if (node.userData.root !== 'undefined') return node;
                    });

                    fetch(`/courses/insertNode/${courseId}`, {
                        method: 'POST',
                        headers: {
                            'Accept' : 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            position: pos,
                            root: {
                                position : root.position,
                                childs : root_.userData.childs,
                                parents : root_.userData.parents,
                                _id : root_.userData.id,
                                task : root_.userData.task._id
                            },
                            creator : teacher
                        })
                    }).then(x => x.json())
                    .then(newnode => {
                        node.userData.id = newnode._id;
                        node.userData.childs = [];
                        node.userData.parents = [];
                        node.userData.task = newnode.task;
                    });
                    nodes.push(node);
                    //
                }
                if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED = null;
            }

        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }

        function onDocumentMouseMove( event ) {
            event.preventDefault();
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        }

        function render() {
            for ( let i = 0; i < connections.length; i ++ ) {
                const targetNode = nodes.find(node => {
                    if (node.userData.id === connections[i].target) return node;
                });
                const curNode = nodes.find(node => {
                    if (node.userData.id === connections[i].father) return node;
                });

                connections[i].position.next({ x : targetNode.position.x, y : targetNode.position.y, z : targetNode.position.z});
                connections[i].length.next(curNode.position.clone().distanceTo(targetNode.position) - 28);
                connections[i].cone.lookAt(targetNode.position);
            }

            renderer.render( scene, camera );
        }

        function onDoubleClick(event) {
            raycaster.setFromCamera( mouse, camera );
            let intersects = raycaster.intersectObjects( nodes );
            if ( intersects.length > 0 ) {

                controls.enabled = false;

                document.getElementById( 'name' ).value = intersects[0].object.userData.task.name;
                document.getElementById( 'balls' ).value = intersects[0].object.userData.task.balls;
                
                document.getElementById( 'description' ).value = intersects[0].object.userData.task.description;
                curNodeId = intersects[0].object.userData.id;
                // fetch("/templates/items.ejs").then(x => x.text())
                // .then(templateStr => {
                //     const dataObject = {task: intersects[ 0 ].object.userData.task};
                //     const renderedHtmlStr = ejs.render(templateStr, dataObject);
                //     const table = document.getElementById("modal-content");
                //     table.textContent = renderedHtmlStr;
                // })

                modal.style.display = "block";

                // fetch('/auth/addNode', {
                //     method: 'POST',
                //     headers: {
                //         'Accept' : 'application/json',
                //         'Content-Type' : 'application/json'
                //     },
                //     body: JSON.stringify({
                //         courseId: courseId,
                //         node:  intersects[ 0 ].object.userData.id
                //     })
                // });
            }
        };

        function onDocumentKeyDown(event) {
            switch ( event.keyCode ) {
                case 87: {
                    if (camera.position.y < 100) {
                        camera.position.y += cameraSpeed;
                        controls.target.y += cameraSpeed;
                    }

                    break;
                }
                case 83: {
                    camera.position.y -= cameraSpeed;
                    controls.target.y -= cameraSpeed;
                    break;
                }
            }
        };
    }

    window.onload = function() {
        fetch(`graph/${courseId}`).then(x => x.json())
            .then((response) => CreateGraph(response.nodes, response.root, response.user, response.teacher))
            .catch((error) => console.log(error));
        fetch('/auth/addCourse', {
            method: 'POST',
            headers: {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                courseId: courseId
            })
        });
    }

    const modal = document.getElementById('exampleModalLong');


    document.getElementsByClassName("close").onclick = function() {
        modal.style.display = "none";
        controls.enabled = true;
    }
