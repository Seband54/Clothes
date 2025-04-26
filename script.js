let modelo;

async function cargarModelo() {
  modelo = await tf.loadLayersModel('modelo/model.json');
  console.log("✅ Modelo cargado correctamente");
}

async function predecirImagen(imagenHTML) {
  const tensor = tf.browser.fromPixels(imagenHTML, 1)
    .resizeNearestNeighbor([28, 28])
    .toFloat()
    .div(255.0)
    .expandDims();

  const prediccion = modelo.predict(tensor);
  const valores = await prediccion.data();
  const indice = valores.indexOf(Math.max(...valores));

  const etiquetas = [
    "Camiseta", "Pantalón", "Suéter", "Vestido", "Abrigo",
    "Sandalia", "Camisa", "Zapatilla", "Bolso", "Bota"
  ];

  const prenda = etiquetas[indice];
  const confianza = (valores[indice] * 100).toFixed(2);

  document.getElementById("resultado").innerText = `🔎 Prenda detectada: ${prenda} (${confianza}% confianza)`;
}

function procesarImagen(event) {
  const archivo = event.target.files[0];
  const lector = new FileReader();

  lector.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.getElementById("previewCanvas");
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 28, 28); // Redimensiona a 28x28
      predecirImagen(canvas);
    };
    img.src = e.target.result;
  };
  lector.readAsDataURL(archivo);
}

// Cargar el modelo al iniciar la página
window.onload = cargarModelo;
