document.getElementById("setwidth").style.height = `${document.getElementById('card').offsetHeight}px`;
            

            document.getElementById("update").addEventListener( 'click', () => {
                if (document.getElementById("telegram").value !== "" || document.getElementById("avaUrl").value !== "" || document.getElementById("facebook").value !== "") {
                    
                    
                    let data = new FormData();
                    if (document.getElementById("telegram").value !== "") data.append('telegram', document.getElementById("telegram").value);
                    if (document.getElementById("avaUrl").value !== "") data.append('avaUrl', document.getElementById("avaUrl").files[0]);
                    if (document.getElementById("facebook").value !== "") data.append('facebook', document.getElementById("facebook").value);
                    
                    console.log(data);
                    fetch('/users/update', { 
                        method: 'POST',
                        body: data 
                    })
                    .then(response => response.json())
                    .then(success => {
                        document.getElementById("ava").src = success.avaUrl;
                        if (typeof success.telegram !== 'undefined' && success.telegram !== null && success.telegram !== "") {
                            let elem = document.getElementById('not_set1');
                            if (elem !== null ) elem.parentNode.removeChild(elem);
                            let parent = document.getElementById('telega');
                            parent.textContent = `Telegram name : ${success.telegram}`;
                        }
                        if (typeof success.facebook !== 'undefined' && success.facebook !== null && success.facebook !== "") {
                            let elem = document.getElementById('not_set2');
                            if (elem !== null ) elem.parentNode.removeChild(elem);
                            let parent = document.getElementById('facebookk');
                            parent.textContent = `Facebook name : ${success.facebook}`;
                        }
                    })
                    .catch(error => console.log(error));
                }
            
            }, false);