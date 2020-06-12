
        function findFunc() {
            let input = document.getElementById("myInput");
            let filter = input.value.toUpperCase();
            getAllTasks(1, filter);
        }
        
        (function() {
            window.addEventListener('load', function() {
                getAllTasks(1, "");
            }, false);
        })();
        ////////////////////////////////
        function getAllTasks(curpage, text) {
            Promise.all([
                fetch("/templates/items.ejs").then(x => x.text()),
                fetch(`/api/v1/tasks?page=${curpage}&text=${text}`).then(x => x.json()),
            ])
                .then(([templateStr, Data]) => {
                    const dataObject = {tasks: Data.tasks};
                    const renderedHtmlStr = ejs.render(templateStr, dataObject);
                    ////////////////////
                    let pages = parseInt(Data.pages);
                    let page = parseInt(Data.page);
                    // console.log("page", page);
                    // console.log("pages", pages);
                    console.log(text, pages);
                    // if (text !== "" && pages === 0) {
                    //     document.getElementById('alert').setAttribute( 'class', 'alert alert-danger visible' );
                    // } else {
                    //     document.getElementById('alert').setAttribute( 'class', 'unvisible' );
                    // }
                    document.getElementById('curpage').innerHTML = `${page}`;
                    document.getElementById('allpages').innerHTML = `${pages}`;
                    const doc = document.getElementById("pagination");
                    length = doc.children.length;
                    for (let i = 1; i < length - 1; i++) {
                        doc.removeChild(doc.children[1]);
                    }
                    if (page === 1) {
                        doc.children[0].setAttribute( 'class', 'disabled page-item' );
                        doc.children[0].style.pointerEvents = 'none';
                        doc.children[0].disabled = true;
                    } else {
                        doc.children[0].setAttribute( 'class', 'page-item' );
                        doc.children[0].style.pointerEvents = 'auto';
                        doc.children[0].disabled = false;
                    }
                    if (page === pages || page > pages) {
                        doc.children[1].setAttribute( 'class', 'disabled page-item' );
                        doc.children[1].style.pointerEvents = 'none';
                        doc.children[1].disabled = true;
                    } else {
                        doc.children[1].setAttribute( 'class', 'page-item' );
                        doc.children[1].style.pointerEvents = 'auto';
                        doc.children[1].disabled = false;
                    }
                    if (pages > 0) doc.insertBefore(createChild(1, text, true, (page === 1) ? true : false), doc.children[doc.children.length - 1]);
                    if (pages > 1) doc.insertBefore(createChild(pages, text, true, (page === pages) ? true : false), doc.children[doc.children.length - 1]);
                    const start = (page - 2 > 1) ? page - 2 : 2;
                    const finish = (page + 2 < pages - 1) ? page + 2 : pages - 1;
                    for (let i = start; i <= finish ; i++) {
                        (i === page) ? doc.insertBefore(createChild(i, text, true, true), doc.children[doc.children.length - 2]) :
                        doc.insertBefore(createChild(i, text, true, false), doc.children[doc.children.length - 2]);
                    }

                    if (page < pages - 3) doc.insertBefore(createChild(". . .", text, false, false), doc.children[doc.children.length - 2]);
                    if (page > 4) doc.insertBefore(createChild(". . .", text, false, false), doc.children[2]);

                    /////////////////////////////////print tasks
                    // let table = document.getElementById("myTable");
                    // lengthT = table.children.length;
                    // for (let i = 0; i < lengthT; i++) {
                    //     table.removeChild(table.children[0]);
                    // }
                    // for (let task of Data.tasks) {
                    //     let child = document.createElement("tr");
                    //     child.innerHTML = `<th><font color = "white"><a href="tasks/${task._id}">${task.name}</a></font></th><th>${task.subject}</th><th>${task.balls}</th>`;
                    //     table.appendChild(child);
                    // }
                    ////////////////////
                    return renderedHtmlStr;
                })
                .then(htmlStr => {
                    const table = document.getElementById("myTable");
                    table.innerHTML = htmlStr;
                })
            .catch(err => console.error(err));
        }

        function createChild(data, text, href, active) {
            let child = document.createElement("li");
            const style = (active) ? "style = 'background-color : #343a40; color : #eee' id = 'active'" : "";
            (!href) ? child.setAttribute( 'class', 'page-item disabled' ) : child.setAttribute( 'class', 'page-item' );
            child.innerHTML = (!href) ? `<a class='page-link' onclick="getAllTasks(${data}, '${text}')">${data}</a>` : `<a class='page-link' ${style}  onclick="getAllTasks(${data}, '${text}')">${data}</a>`;
            return child;
        }
        