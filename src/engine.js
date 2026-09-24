// Ported from scientific_calculator.c — same operations, same validation
// rules, same error messages, same %.4g / %.6g number formatting.

export const MAX_HISTORY = 8;

/** Mimics C's printf("%.Ng") formatting. */
export function fmtG(value, precision = 6) {
  if (!Number.isFinite(value)) {
    if (Number.isNaN(value)) return 'nan';
    return value > 0 ? 'inf' : '-inf';
  }
  if (value === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  let out;
  if (exp < -4 || exp >= precision) {
    out = value.toExponential(precision - 1);
    // strip trailing zeros in mantissa, C-style exponent (e+05)
    let [mant, ex] = out.split('e');
    if (mant.includes('.')) mant = mant.replace(/\.?0+$/, '');
    const sign = ex[0] === '-' ? '-' : '+';
    const digits = ex.replace(/^[+-]/, '').padStart(2, '0');
    out = `${mant}e${sign}${digits}`;
  } else {
    out = value.toPrecision(precision);
    if (out.includes('.')) out = out.replace(/\.?0+$/, '');
  }
  return out;
}

const g4 = (v) => fmtG(v, 4);
const DEG = Math.PI / 180;

/**
 * Each operation mirrors one `case` of the C switch statement.
 * inputs: [{ key, label, type: 'number' | 'integer' }]
 * run(values) -> { expr, result } | { error }
 */
export const OPERATIONS = [
  {
    id: 1, name: 'Addition', symbol: '+', group: 'Basic',
    inputs: [{ key: 'a', label: 'Enter first number' }, { key: 'b', label: 'Enter second number' }],
    run: ({ a, b }) => ({ expr: `${g4(a)} + ${g4(b)}`, result: a + b }),
  },
  {
    id: 2, name: 'Subtraction', symbol: '−', group: 'Basic',
    inputs: [{ key: 'a', label: 'Enter first number' }, { key: 'b', label: 'Enter second number' }],
    run: ({ a, b }) => ({ expr: `${g4(a)} - ${g4(b)}`, result: a - b }),
  },
  {
    id: 3, name: 'Multiplication', symbol: '×', group: 'Basic',
    inputs: [{ key: 'a', label: 'Enter first number' }, { key: 'b', label: 'Enter second number' }],
    run: ({ a, b }) => ({ expr: `${g4(a)} * ${g4(b)}`, result: a * b }),
  },
  {
    id: 4, name: 'Division', symbol: '÷', group: 'Basic',
    inputs: [{ key: 'a', label: 'Enter numerator' }, { key: 'b', label: 'Enter denominator' }],
    run: ({ a, b }) => {
      if (b === 0) return { error: 'Division by zero is undefined.' };
      return { expr: `${g4(a)} / ${g4(b)}`, result: a / b };
    },
  },
  {
    id: 5, name: 'Modulus', symbol: 'mod', group: 'Basic',
    inputs: [
      { key: 'a', label: 'Enter first integer', type: 'integer' },
      { key: 'b', label: 'Enter second integer', type: 'integer' },
    ],
    run: ({ a, b }) => {
      if (b === 0) return { error: 'Modulus by zero is undefined.' };
      // C's % truncates toward zero — same as JS
      return { expr: `${a} mod ${b}`, result: a % b };
    },
  },
  {
    id: 6, name: 'Power', symbol: 'xʸ', group: 'Powers & Roots',
    inputs: [{ key: 'a', label: 'Enter base' }, { key: 'b', label: 'Enter exponent' }],
    run: ({ a, b }) => ({ expr: `${g4(a)} ^ ${g4(b)}`, result: Math.pow(a, b) }),
  },
  {
    id: 7, name: 'Square Root', symbol: '√', group: 'Powers & Roots',
    inputs: [{ key: 'a', label: 'Enter number' }],
    run: ({ a }) => {
      if (a < 0) return { error: 'Cannot take square root of a negative number.' };
      return { expr: `sqrt(${g4(a)})`, result: Math.sqrt(a) };
    },
  },
  {
    id: 8, name: 'Cube Root', symbol: '∛', group: 'Powers & Roots',
    inputs: [{ key: 'a', label: 'Enter number' }],
    run: ({ a }) => ({ expr: `cbrt(${g4(a)})`, result: Math.cbrt(a) }),
  },
  {
    id: 9, name: 'Nth Root', symbol: 'ⁿ√', group: 'Powers & Roots',
    inputs: [{ key: 'a', label: 'Enter number' }, { key: 'b', label: 'Enter root (n)' }],
    run: ({ a, b }) => {
      if (b === 0) return { error: 'Root degree cannot be zero.' };
      if (a < 0 && b % 2 === 0) return { error: 'Even root of a negative number is not real.' };
      const result = a < 0 ? -Math.pow(-a, 1 / b) : Math.pow(a, 1 / b);
      return { expr: `${g4(b)}-th root of ${g4(a)}`, result };
    },
  },
  {
    id: 10, name: 'Sine', symbol: 'sin', group: 'Trigonometry',
    inputs: [{ key: 'a', label: 'Enter angle in degrees' }],
    run: ({ a }) => ({ expr: `sin(${g4(a)} deg)`, result: Math.sin(a * DEG) }),
  },
  {
    id: 11, name: 'Cosine', symbol: 'cos', group: 'Trigonometry',
    inputs: [{ key: 'a', label: 'Enter angle in degrees' }],
    run: ({ a }) => ({ expr: `cos(${g4(a)} deg)`, result: Math.cos(a * DEG) }),
  },
  {
    id: 12, name: 'Tangent', symbol: 'tan', group: 'Trigonometry',
    inputs: [{ key: 'a', label: 'Enter angle in degrees' }],
    run: ({ a }) => {
      if (Math.abs(Math.cos(a * DEG)) < 1e-12) return { error: 'Tangent is undefined at this angle.' };
      return { expr: `tan(${g4(a)} deg)`, result: Math.tan(a * DEG) };
    },
  },
  {
    id: 13, name: 'Log base 10', symbol: 'log', group: 'Logarithms',
    inputs: [{ key: 'a', label: 'Enter number' }],
    run: ({ a }) => {
      if (a <= 0) return { error: 'Logarithm undefined for non-positive numbers.' };
      return { expr: `log10(${g4(a)})`, result: Math.log10(a) };
    },
  },
  {
    id: 14, name: 'Natural Log', symbol: 'ln', group: 'Logarithms',
    inputs: [{ key: 'a', label: 'Enter number' }],
    run: ({ a }) => {
      if (a <= 0) return { error: 'Natural log undefined for non-positive numbers.' };
      return { expr: `ln(${g4(a)})`, result: Math.log(a) };
    },
  },
  {
    id: 15, name: 'Exponential', symbol: 'eˣ', group: 'Logarithms',
    inputs: [{ key: 'a', label: 'Enter exponent (x for e^x)' }],
    run: ({ a }) => ({ expr: `e^${g4(a)}`, result: Math.exp(a) }),
  },
  {
    id: 16, name: 'Factorial', symbol: 'n!', group: 'Special',
    inputs: [{ key: 'a', label: 'Enter a non-negative integer', type: 'integer' }],
    run: ({ a }) => {
      if (a < 0) return { error: 'Factorial undefined for negative numbers.' };
      if (a > 170) return { error: 'Number too large, result would overflow.' };
      let f = 1;
      for (let i = 2; i <= a; i++) f *= i;
      return { expr: `${a}!`, result: f };
    },
  },
  {
    id: 17, name: 'Percentage', symbol: '%', group: 'Special',
    inputs: [{ key: 'a', label: 'Enter value (x)' }, { key: 'b', label: 'Enter percent (y in x% of)' }],
    run: ({ a, b }) => ({ expr: `${g4(a)}% of ${g4(b)}`, result: (a / 100) * b }),
  },
];

export const GROUPS = ['Basic', 'Powers & Roots', 'Trigonometry', 'Logarithms', 'Special'];

/** Equivalent of get_double / get_int input validation. */
export function parseInput(raw, type = 'number') {
  const s = String(raw).trim();
  if (s === '') return { error: type === 'integer' ? 'Invalid integer, try again' : 'Invalid number, try again' };
  if (type === 'integer') {
    if (!/^[+-]?\d+$/.test(s)) return { error: 'Invalid integer, try again' };
    return { value: parseInt(s, 10) };
  }
  const v = Number(s);
  if (!Number.isFinite(v)) return { error: 'Invalid number, try again' };
  return { value: v };
}
