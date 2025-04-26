let modelo;

async function cargarModelo() {
  modelo = await tf.loadLayersModel('model.json');
  console.log("Modelo cargado correctamente");
}

cargarModelo();
