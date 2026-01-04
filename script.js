const API_KEY = "472e21ee80f63b71f7aade2a";

const CODES_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`;
const EXCHANGE_RATE_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair`;

const CONVERTED_PRICE = document.getElementById('converted-price');
const SWAP_BUTTON = document.getElementById('swap-currency');
const CONVERT_BUTTON = document.getElementById('convert');

const CURR1 = document.getElementById('base-currency');
const CURR2 = document.getElementById('conversion-currency');
const BASE_PRICE = document.getElementById('base-price');

SWAP_BUTTON.addEventListener('click', swapCurrencies);
CONVERT_BUTTON.addEventListener('click', convertCurrency);

fetch_codes();

async function fetch_codes() {
  try {
    const response = await fetch(CODES_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.result !== 'success') {
      throw new Error(data.error_type || 'API error');
    }
    for (const code of data.supported_codes) {
      CURR1.appendChild(showCurrency(code));
      CURR2.appendChild(showCurrency(code));
    }
    // Set default selections
    CURR1.value = 'USD';
    CURR2.value = 'EUR';
  } catch (error) {
    CONVERTED_PRICE.innerHTML = `<p style="color: red;">Error loading currencies: ${error.message}</p>`;
  }
}

function showCurrency(code) {
  const option = document.createElement('option');
  option.value = code[0];
  option.innerHTML = `(${code[0]}) ${code[1]}`;
  return option;
}

function swapCurrencies() {
  const temp = CURR1.value;
  CURR1.value = CURR2.value;
  CURR2.value = temp;
}

async function convertCurrency() {
  const baseAmount = parseFloat(BASE_PRICE.value);
  if (!baseAmount || baseAmount <= 0) {
    CONVERTED_PRICE.innerHTML = '<p style="color: orange;">Please enter a valid amount.</p>';
    return;
  }

  const baseCurr = CURR1.value;
  const targetCurr = CURR2.value;

  if (!baseCurr || !targetCurr) {
    CONVERTED_PRICE.innerHTML = '<p style="color: orange;">Please select both currencies.</p>';
    return;
  }

  try {
    SWAP_BUTTON.disabled = true;
    CONVERT_BUTTON.disabled = true;
    CONVERTED_PRICE.innerHTML = 'Converting...';

    const url = `${EXCHANGE_RATE_API_URL}/${baseCurr}/${targetCurr}/${baseAmount}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error(data.error_type || 'Conversion failed');
    }

    const result = data.conversion_result.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    CONVERTED_PRICE.innerHTML = `
      <p><strong>${baseAmount.toLocaleString()} ${baseCurr}</strong> = <strong>${result} ${targetCurr}</strong></p>
      <small>Rate: 1 ${baseCurr} = ${data.conversion_rate.toLocaleString(undefined, {style: 'currency', currency: targetCurr, minimumFractionDigits: 4})}</small>
    `;
  } catch (error) {
    CONVERTED_PRICE.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  } finally {
    SWAP_BUTTON.disabled = false;
    CONVERT_BUTTON.disabled = false;
  }
}