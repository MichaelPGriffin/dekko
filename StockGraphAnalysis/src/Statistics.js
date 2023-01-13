// RESUME AT using this function (refactoring) and implement statistics tests.
export const sum = (d = []) => d.reduce((a, c) => a + c);

export const average = (d = []) => {
  if (d.length === 0) {
    throw new Error('Invalid input. Can\'t divide by zero');
  }

  return sum(d) / d.length;
};

const deviations = (a = []) => {
  const avg = average(a);

  return a.map(x => (x - avg));
};

const squaredDeviations = data => deviations(data).map(d => d * d);

export const dotProduct = (x = [], y = []) => {
  if (x.length !== y.length) {
    throw new Error('Invalid input. Array lengths must match');
  }

  return sum(x.map((a, i) => a * y[i]));
};

export const correlation = (a = [], b = []) => {
  if (a.length !== b.length) {
    throw new Error('Invalid input. Array lengths must match');
  }

  const numerator = dotProduct(deviations(a), deviations(b));
  const sum = (x = []) => x.reduce((a, c) => a + c);

  const isConstant = data => deviations(data).every(d => d === 0);
  if ([a, b].every(isConstant)) {
    return 1;
  }

  if ([a, b].some(isConstant)) {
    return 0;
  }

  const denominator = Math.sqrt(
      sum(squaredDeviations(a)) * sum(squaredDeviations(b))
  );

  return numerator / denominator;
};
