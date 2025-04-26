let modelo;

async function cargarModelo() {
  modelo = await tf.loadLayersModel('modelo/model.json');
  console.log("Modelo cargado");
}

async function predecirImagen(imagenHTML) {
  // Convertir la imagen en tensor
  let tensor = tf.browser.fromPixels(imagenHTML, 1)
    .resizeNearestNeighbor([28, 28])
    .toFloat()
    .div(255.0)
    .expandDims();

  // Predecir
  const prediccion = modelo.predict(tensor);
  const valores = await prediccion.data();
  const indice = valores.indexOf(Math.max(...valores));

  const etiquetas = [
    "T-shirt/top", "Trouser", "Pullover", "Dress", "Coat",
    "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot"
  ];

  const resultado = etiquetas[indice];
  document.getElementById("resultado").innerText = `Prenda detectada: ${resultado}`;
}

// Ejecutar al cargar
window.onload = cargarModelo;

