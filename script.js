const CODES_API_URL = `https://v6.exchangerate-api.com/v6/${config.apiKey}/codes`;
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${config.apiKey}/pair`;

const BASE_CURR = document.getElementById("base-currency");
const CONVERSION_CURR = document.getElementById("conversion-currency");
const SWAP = document.getElementById("swap");
const BASE_AMOUNT = document.getElementById("base-amount");
const CONVERTED_AMOUNT = document.getElementById("converted-amount");
const CONVERT = document.getElementById("convert");

SWAP.addEventListener("click", swapCurrencies);
CONVERT.addEventListener("click", convertAmount);
BASE_AMOUNT.addEventListener("keypress", (e) => {
  if (e.key === "Enter") convertAmount();
});

fetchCodes();

async function fetchCodes() {
  try {
    const response = await fetch(CODES_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error! status: ${response.status}`);
    }
    const data = await response.json();

    data.supported_codes.forEach(([code, name]) => {
      showCodes(code, name);
    });

    // default
    BASE_CURR.value = "USD";
    CONVERSION_CURR.value = "IDR";
  } catch (error) {
    CONVERTED_AMOUNT.innerHTML = `<p style="color: red;">Failed to load currencies: ${error.message}</p>`;
  }
}

function showCodes(code, name) {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = `(${code}) ${name}`;
  BASE_CURR.appendChild(option.cloneNode(true));
  CONVERSION_CURR.appendChild(option);
}

function swapCurrencies() {
  const temp = BASE_CURR.value;
  BASE_CURR.value = CONVERSION_CURR.value;
  CONVERSION_CURR.value = temp;
}

async function convertAmount() {
  const amount = parseFloat(BASE_AMOUNT.value);
  if (!amount || amount <= 0) {
    CONVERTED_AMOUNT.innerHTML = `<p style="color: orange;">Please enter a valid amount.</p>`;
    return;
  }

  try {
    SWAP.disabled = true;
    CONVERT.disabled = true;
    CONVERTED_AMOUNT.innerHTML = "Converting...";

    const response = await fetch(
      `${EXCHANGE_API_URL}/${BASE_CURR.value}/${CONVERSION_CURR.value}/${amount}`
    );
    if (!response.ok) {
      throw new Error(`HTTP Error! status: ${response.status}`);
    }
    const data = await response.json();

    CONVERTED_AMOUNT.innerHTML = `
      <p><strong>${amount} ${
      BASE_CURR.value
    } = ${data.conversion_result.toLocaleString()} ${
      CONVERSION_CURR.value
    }</strong></p>
      <p>Exchange Rate: 1 ${
        BASE_CURR.value
      } = ${data.conversion_rate.toLocaleString(undefined, {
      style: "currency",
      currency: CONVERSION_CURR.value,
    })}</p>
    `;
  } catch (error) {
    CONVERTED_AMOUNT.innerHTML = `<p style="color: red;">Conversion failed: ${error.message}</p>`;
  } finally {
    SWAP.disabled = false;
    CONVERT.disabled = false;
  }
}
