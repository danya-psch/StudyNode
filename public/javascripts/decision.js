function onClickFunc(max, node, name, course, user, decision) {
    if (document.getElementById(`balls${decision}`).value !== "") {
        console.log(document.getElementById(`balls${decision}`).value);
        console.log(max);
        if (document.getElementById(`balls${decision}`).value >= 0 && Number(document.getElementById(`balls${decision}`).value) <= Number(max)) {
            console.log(name);
            fetch('/users/addNode', {
                method: 'POST',
                headers: {
                    'Accept' : 'application/json',
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    node: node,
                    nodeName: name,
                    courseId: course,
                    user: user,
                    decision: decision,
                    balls: document.getElementById(`balls${decision}`).value
                })
            });
            let elem = document.getElementById(`balls${decision}`).parentNode.parentNode;
            elem.parentNode.removeChild(elem);
        }
    }
} 