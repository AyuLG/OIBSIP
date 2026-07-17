const display = document.getElementById('display');
const expression = document.getElementById('expression');
const buttons = document.querySelectorAll('.btn');

let displayValue = '0';
let expressionValue = '';
let currentNumber = '';
let numbers = [];
let operators = [];
let hasResult = false;
let isNewNumber = true;

function updateDisplay() {
    if (displayValue === '' || displayValue === '0') {
        display.textContent = '0';
        display.classList.remove('small', 'error');
    } else {
        display.textContent = displayValue;
        display.classList.remove('error');
        if (displayValue.length > 12) {
            display.classList.add('small');
        } else {
            display.classList.remove('small');
        }
    }
}

function updateExpression() {
    if (expressionValue) {
        expression.textContent = expressionValue;
    } else {
        expression.textContent = '';
    }
}

function buildExpression() {
    if (numbers.length === 0) {
        expressionValue = displayValue;
        return;
    }
    
    let expr = '';
    for (let i = 0; i < numbers.length; i++) {
        expr += numbers[i];
        if (i < operators.length) {
            expr += ' ' + operators[i] + ' ';
        }
    }
    if (currentNumber && !isNewNumber) {
        if (numbers.length > 0 && operators.length > 0) {
            expr += ' ' + currentNumber;
        } else if (numbers.length === 0) {
            expr = currentNumber;
        }
    }
    expressionValue = expr;
    updateExpression();
}

function inputNumber(value) {
    if (hasResult) {
        resetCalculator();
        hasResult = false;
    }
    if (isNewNumber) {
        currentNumber = '';
        isNewNumber = false;
    }
    if (value === '.' && currentNumber.includes('.')) {
        return;
    }
    if (currentNumber.replace('-', '').replace('.', '').length >= 15) {
        return;
    }
    if (currentNumber === '0' && value !== '.') {
        currentNumber = value;
    } else {
        currentNumber += value;
    }
    displayValue = currentNumber;
    updateDisplay();
    buildExpression();
}

function inputOperator(value) {
    if (hasResult) {
        hasResult = false;
        if (displayValue !== '0') {
         
            numbers = [displayValue];
            operators = [value];  
            currentNumber = '';
            isNewNumber = true;
            displayValue = '';
            buildExpression();
            updateDisplay();
            return;
        }
    }

    if (currentNumber !== '' && !isNewNumber) {
        numbers.push(currentNumber);
        operators.push(value);
        currentNumber = '';
        isNewNumber = true;
        displayValue = '';
    } else if (numbers.length > 0 && currentNumber === '') {
      
        operators[operators.length - 1] = value;
    } else {
        if (displayValue !== '' && displayValue !== '0') {
            numbers.push(displayValue);
            operators.push(value);
            displayValue = '';
            currentNumber = '';
            isNewNumber = true;
        }
    }
    buildExpression();
    updateDisplay();
}

function calculate() {
    if (currentNumber !== '' && !isNewNumber) {
        numbers.push(currentNumber);
        currentNumber = '';
        isNewNumber = true;
    }

    if (numbers.length === 0 || operators.length === 0) {
        return;
    }
    if (numbers.length !== operators.length + 1) {
        return;
    }

    const numArray = numbers.map(n => parseFloat(n));
    
    // Check for division by zero
    for (let i = 0; i < operators.length; i++) {
        if (operators[i] === '÷' || operators[i] === '%') {
            if (numArray[i + 1] === 0) {
                display.textContent = 'Cannot divide by zero';
                display.classList.add('error');
                const errorMsg = display.textContent;
                resetCalculator();
                display.textContent = errorMsg;
                display.classList.add('error');
                return;
            }
        }
    }
    
    let resultArray = [...numArray];
    let opArray = [...operators];
    let i = 0;
    
    while (i < opArray.length) {
        if (opArray[i] === '×' || opArray[i] === '÷' || opArray[i] === '%') {
            let result;
            const left = resultArray[i];
            const right = resultArray[i + 1];
            
            switch (opArray[i]) {
                case '×': 
                    result = left * right; 
                    break;
                case '÷': 
                    result = left / right; 
                    break;
                case '%': 
                    result = left % right; 
                    break;
                default: 
                    result = right;
            }
            
            resultArray.splice(i, 2, result);
            opArray.splice(i, 1);
        } else {
            i++;
        }
    }
   
    let finalResult = resultArray[0];
    for (let i = 0; i < opArray.length; i++) {
        switch (opArray[i]) {
            case '+': 
                finalResult += resultArray[i + 1]; 
                break;
            case '−': 
                finalResult -= resultArray[i + 1]; 
                break;
            default: 
                break;
        }
    }

    const formattedResult = formatResult(finalResult);

    let fullExpression = '';
    for (let i = 0; i < numbers.length; i++) {
        fullExpression += numbers[i];
        if (i < operators.length) {
            fullExpression += ' ' + operators[i] + ' ';
        }
    }
    expressionValue = fullExpression + ' =';
    updateExpression();

    displayValue = formattedResult;
    updateDisplay();
    hasResult = true;

}

function formatResult(num) {
    if (Number.isInteger(num)) {
        return num.toString();
    }

    const rounded = Math.round(num * 10000000000) / 10000000000;
    let result = rounded.toString();

    if (result.replace('-', '').replace('.', '').length > 15) {
        result = rounded.toExponential(6);
    }

    return result;
}

function backspace() {
    if (hasResult) {
        resetCalculator();
        return;
    }

    if (currentNumber.length > 0 && !isNewNumber) {
        currentNumber = currentNumber.slice(0, -1);
        displayValue = currentNumber || '0';
        buildExpression();
        updateDisplay();
    } else if (operators.length > 0 && currentNumber === '') {
        operators.pop();
        if (numbers.length > 0) {
            currentNumber = numbers.pop();
            isNewNumber = false;
            displayValue = currentNumber;
            buildExpression();
            updateDisplay();
        }
    }
}

function resetCalculator() {
    displayValue = '0';
    expressionValue = '';
    currentNumber = '';
    numbers = [];
    operators = [];
    hasResult = false;
    isNewNumber = true;
    display.classList.remove('error', 'small');
    updateDisplay();
    updateExpression();
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        const value = button.dataset.value;

        if (button.classList.contains('number')) {
            inputNumber(value);
            return;
        }
        if (button.classList.contains('operator')) {
            if (value === 'C') {
                resetCalculator();
            } else if (value === '⌫') {
                backspace();
            } else if (value === '%') {
                if (currentNumber !== '' && !isNewNumber) {
                    const num = parseFloat(currentNumber);
                    if (!isNaN(num)) {
                        currentNumber = (num / 100).toString();
                        displayValue = currentNumber;
                        buildExpression();
                        updateDisplay();
                    }
                }
            } else {
                inputOperator(value);
            }
            return;
        }
        if (button.classList.contains('equals')) {
            if (numbers.length > 0 && operators.length > 0) {
                calculate();
            }
            return;
        }
    });
});

document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        inputNumber(key);
        return;
    }

    if (key === '.') {
        event.preventDefault();
        inputNumber('.');
        return;
    }

    const operatorMap = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
    };

    if (operatorMap[key]) {
        event.preventDefault();
        inputOperator(operatorMap[key]);
        return;
    }

    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        if (numbers.length > 0 && operators.length > 0) {
            calculate();
        }
        return;
    }

    if (key === 'Backspace') {
        event.preventDefault();
        backspace();
        return;
    }

    if (key === 'Escape' || key === 'Delete') {
        event.preventDefault();
        resetCalculator();
        return;
    }
});
