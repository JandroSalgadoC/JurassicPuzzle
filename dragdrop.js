
window.onload = iniciar;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function agregaEventos() {
    let radios = document.getElementsByTagName("input");
    for (let i = 0; i < radios.length; i++) {
        radios[i].addEventListener('click', iniciar, false);
    }
}

function devuelvePiezas() {
    let piezas = document.getElementsByName('dificultad');
    for (let i = 0; i < piezas.length; i++) {
        if (piezas[i].checked) {
            return piezas[i].value;
        }
    }
}

function play() {
    var audio = new Audio();
    audio.src = "src/JPVictory.mp3";
    audio.play();
}

function iniciar() {
    //Declaro los arrays que necesitaré para controlar las posiciones de las piezas:
    var tileData = new Array();
    var indexes = new Array();

    //Agrego los eventos de los botones de radio:
    agregaEventos();

    //Primero necesito crear en el DOM los canvas:
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    //Importo la imagen:
    var imageObj = new Image();
    imageObj.src = "src/JW.jpg";

    //Le doy al canvas las medidas de la imagen y lo coloco:
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;

    //Establezco las constantes del total de piezas y su raiz cuadrada:
    const TOTPIEZAS = devuelvePiezas();
    const PIEZAS = Math.sqrt(TOTPIEZAS);

    //Cuando la imagen se carga correctamente:
    imageObj.onload = function () {
        //Primero se dibuja completamente.
        ctx.drawImage(imageObj, 0, 0);

        //Después se calcula el ancho y alto de cada pieza en base al total de la foto:
        var anchPieza = imageObj.width / PIEZAS;
        var altPieza = imageObj.height / PIEZAS;


        //Bucle para recorrer la foto e ir extrayendo la información de cada pieza:
        for (let i = 0; i < PIEZAS; i++) {
            for (let j = 0; j < PIEZAS; j++) {
                // Store the image data of each tile in the array.
                tileData.push(ctx.getImageData(j * anchPieza, i * altPieza, anchPieza, altPieza));
            }
        }

        //Bucle para generar un array de indices y lo aleatorizo:
        for (let i = 0; i < tileData.length; i++) {
            indexes.push(i);
        }
        shuffle(indexes);

        //Bucle para pintar cada elemento en una celda aleatoriamente:
        var tabla = document.createElement("table");
        tabla.setAttribute("border", "2");
        tabla.setAttribute("cellpadding", 0);
        tabla.setAttribute("cellspacing", 0);
        var cont = null;
        for (let i = 0; i < PIEZAS; i++) {
            var r = document.createElement("tr");
            for (let j = 0; j < PIEZAS; j++) {
                cont = indexes.pop();
                var c = document.createElement("td");
                var canvasT = document.createElement("canvas");
                var ctxT = canvasT.getContext("2d");
                canvasT.width = anchPieza;
                canvasT.height = altPieza;
                ctxT.putImageData(tileData[cont], 0, 0);
                canvasT.setAttribute("id", cont);
                c.setAttribute("style", "padding: 0px;");
                //EVENTOS DRAG&DROP:
                canvasT.setAttribute("draggable", "true");
                canvasT.addEventListener('dragstart', function (e) {
                    e.dataTransfer.setData('ID', this.id);
                    e.dataTransfer.setDragImage(this, anchPieza / 3, altPieza / 3);
                }, false);

                c.appendChild(canvasT);
                r.appendChild(c);
                cont++;
            }
            tabla.appendChild(r);
        }
        //Se usa replaceChild para poder cambiar el número de piezas dinámicamente:
        document.getElementById("imgTabla").replaceChild(tabla, document.getElementById("imgTabla").firstChild);

        //Bucle para crear la tabla donde se coloca el puzzle:
        var tabla2 = document.createElement("table");
        tabla2.setAttribute("border", "2");
        tabla2.setAttribute("cellpadding", 0);
        tabla2.setAttribute("cellspacing", 0);
        var cont2 = 0;
        var contResueltas = TOTPIEZAS;
        for (let i = 0; i < PIEZAS; i++) {
            let r2 = document.createElement("tr");
            for (let j = 0; j < PIEZAS; j++) {
                let c2 = document.createElement("td");
                let canvasT2 = document.createElement("canvas");
                let ctxT2 = canvasT2.getContext("2d");
                canvasT2.width = anchPieza;
                canvasT2.height = altPieza;

                c2.setAttribute("id", cont2)
                c2.setAttribute("style", "padding: 0px;");
                //EVENTOS DRAG&DROP:
                c2.addEventListener('dragenter', function (e) {
                    e.preventDefault();
                }, false);
                c2.addEventListener('dragover', function (e) {
                    e.preventDefault();
                }, false);

                //EVENTO DROP: Controla que la pieza se coloca en su lugar correcto y
                //borra e inavilita la pieza en la tabla original:
                c2.addEventListener('drop', function (e) {
                    e.preventDefault();
                    if (this.id == e.dataTransfer.getData('ID')) {
                        ctxT2.putImageData(tileData[e.dataTransfer.getData('ID')], 0, 0);
                        document.getElementById(e.dataTransfer.getData('ID')).setAttribute("draggable", false);
                        document.getElementById(e.dataTransfer.getData('ID')).getContext("2d").clearRect(0, 0, anchPieza, altPieza);
                        contResueltas--;
                        if (contResueltas == 0) {
                            play();
                            alert("FELICIDADES HAS RESUELTO EL PUZZLE");
                        }
                    }
                }, false);

                c2.appendChild(canvasT2);
                r2.appendChild(c2);
                cont2++;
            }
            tabla2.appendChild(r2);
        }
        document.getElementById("puzzle").replaceChild(tabla2, document.getElementById("puzzle").firstChild);
    }
}