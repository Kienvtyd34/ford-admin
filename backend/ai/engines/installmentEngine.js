export const installmentEngine = (price, percent = 0.2, months = 84) => {

  const downPayment = price * percent;
  const loan = price - downPayment;
  const monthly = loan / months;

  return {
    downPayment,
    loan,
    monthly
  };
};