// utils/validarCedula.js
// Valida cédula ecuatoriana (10 dígitos) siguiendo las reglas establecidas por el Registro Civil.
// Devuelve true si es válida, false en caso contrario.

function validarCedula(cedula) {
  if (!cedula || typeof cedula !== 'string') return false;

  // 1. Debe tener exactamente 10 dígitos numéricos
  if (!/^\d{10}$/.test(cedula)) return false;

  // 2. Los dos primeros dígitos representan la región (01-24)
  const digitoRegion = parseInt(cedula.substring(0, 2), 10);
  if (digitoRegion < 1 || digitoRegion > 24) return false;

  // 3. Último dígito (verificador)
  const ultimoDigito = parseInt(cedula.substring(9, 10), 10);

  // 4. Sumar pares (posiciones 2,4,6,8)
  const pares = [1, 3, 5, 7].reduce((acc, idx) => acc + parseInt(cedula[idx], 10), 0);

  // 5. Procesar impares (posiciones 1,3,5,7,9)
  const impares = [0, 2, 4, 6, 8].reduce((acc, idx) => {
    let num = parseInt(cedula[idx], 10) * 2;
    if (num > 9) num -= 9;
    return acc + num;
  }, 0);

  // 6. Suma total
  const sumaTotal = pares + impares;

  // 7. Obtener siguiente decena
  const siguienteDecena = Math.ceil(sumaTotal / 10) * 10;

  // 8. Dígito validador
  let digitoValidador = siguienteDecena - sumaTotal;
  if (digitoValidador === 10) digitoValidador = 0;

  // 9. Comparar
  return digitoValidador === ultimoDigito;
}

module.exports = validarCedula;
