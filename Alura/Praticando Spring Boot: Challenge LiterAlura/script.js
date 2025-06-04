// Mapeamento de códigos de moeda para bandeiras
const currencyFlags = {
    BRL: 'flags/br.svg',
    USD: 'flags/us.svg',
    EUR: 'flags/eu.svg',
    GBP: 'flags/gb.svg',
    JPY: 'flags/jp.svg',
    CAD: 'flags/ca.svg'
};

// Mapeamento de símbolos de moeda
const currencySymbols = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$'
};

// Elementos do DOM
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-currencies');
const resultDiv = document.getElementById('result');
const rateInfoDiv = document.getElementById('rate-info');
const lastUpdateDiv = document.getElementById('last-update');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');
const toCurrencyCode = document.getElementById('to-currency-code');

// Taxas de câmbio (inicialmente vazio, será preenchido pela API)
let exchangeRates = {};
let lastUpdate = '';

// Inicialização
async function init() {
    // Carrega as taxas de câmbio
    await fetchExchangeRates('USD');
    
    // Atualiza as bandeiras iniciais
    updateFlag('from-currency', fromFlag);
    updateFlag('to-currency', toFlag);
    
    // Event listeners
    convertBtn.addEventListener('click', convertCurrency);
    swapBtn.addEventListener('click', swapCurrencies);
    amountInput.addEventListener('input', convertCurrency);
    fromCurrencySelect.addEventListener('change', () => {
        updateFlag('from-currency', fromFlag);
        convertCurrency();
    });
    toCurrencySelect.addEventListener('change', () => {
        updateFlag('to-currency', toFlag);
        updateCurrencySymbol();
        convertCurrency();
    });
    
    // Conversão inicial
    convertCurrency();
    updateCurrencySymbol();
}

// Atualiza a bandeira baseada na seleção de moeda
function updateFlag(selectId, flagElement) {
    const select = document.getElementById(selectId);
    const currencyCode = select.value;
    flagElement.src = currencyFlags[currencyCode];
    flagElement.alt = currencyCode;
}

// Atualiza o símbolo da moeda de destino
function updateCurrencySymbol() {
    const currencyCode = toCurrencySelect.value;
    toCurrencyCode.textContent = currencyCode;
}

// Busca as taxas de câmbio da API
async function fetchExchangeRates(baseCurrency) {
    try {
        // Fallback com taxas fixas se não tiver chave de API
        if (!API_KEY || API_KEY === 'https://v6.exchangerate-api.com/v6/8c0c33162421f5cfd3d91203/latest/') {
            exchangeRates = getFallbackRates();
            lastUpdate = new Date().toLocaleString('pt-BR');
            updateLastUpdateDisplay();
            return;
        }
        
        const response = await fetch(`${API_URL}${baseCurrency}`);
        const data = await response.json();
        
        if (data.result === 'success') {
            exchangeRates = data.conversion_rates;
            lastUpdate = new Date(data.time_last_update_utc).toLocaleString('pt-BR');
            updateLastUpdateDisplay();
        } else {
            console.error('Erro ao buscar taxas:', data);
            exchangeRates = getFallbackRates();
            lastUpdate = new Date().toLocaleString('pt-BR') + ' (offline)';
            updateLastUpdateDisplay();
        }
    } catch (error) {
        console.error('Erro ao buscar taxas:', error);
        exchangeRates = getFallbackRates();
        lastUpdate = new Date().toLocaleString('pt-BR') + ' (offline)';
        updateLastUpdateDisplay();
    }
}

// Taxas de câmbio fixas para fallback (valores aproximados)
function getFallbackRates() {
    return {
        BRL: 5.0,   // 1 USD = 5 BRL
        USD: 1.0,
        EUR: 0.85,  // 1 USD = 0.85 EUR
        GBP: 0.73,  // 1 USD = 0.73 GBP
        JPY: 110.0, // 1 USD = 110 JPY
        CAD: 1.25   // 1 USD = 1.25 CAD
    };
}

// Atualiza o display da última atualização
function updateLastUpdateDisplay() {
    lastUpdateDiv.textContent = `Atualizado: ${lastUpdate}`;
}

// Conversão de moeda
function convertCurrency() {
    const amount = parseFloat(amountInput.value) || 0;
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    // Calcula o valor convertido
    let convertedAmount;
    
    if (fromCurrency === 'USD') {
        convertedAmount = amount * exchangeRates[toCurrency];
    } else if (toCurrency === 'USD') {
        convertedAmount = amount / exchangeRates[fromCurrency];
    } else {
        const amountInUSD = amount / exchangeRates[fromCurrency];
        convertedAmount = amountInUSD * exchangeRates[toCurrency];
    }
    
    // Formata o resultado
    resultDiv.textContent = convertedAmount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Calcula e exibe a taxa de câmbio
    updateRateInfo(fromCurrency, toCurrency);
}

// Atualiza a informação da taxa de câmbio
function updateRateInfo(fromCurrency, toCurrency) {
    let rate;
    
    if (fromCurrency === 'USD') {
        rate = exchangeRates[toCurrency];
    } else if (toCurrency === 'USD') {
        rate = 1 / exchangeRates[fromCurrency];
    } else {
        const usdToFrom = 1 / exchangeRates[fromCurrency];
        const usdToTo = exchangeRates[toCurrency];
        rate = usdToTo / usdToFrom;
    }
    
    rateInfoDiv.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
}

// Troca as moedas selecionadas
function swapCurrencies() {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    
    updateFlag('from-currency', fromFlag);
    updateFlag('to-currency', toFlag);
    updateCurrencySymbol();
    convertCurrency();
}

// Inicializa o aplicativo
init();