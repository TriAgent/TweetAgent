import BigNumber from "bignumber.js";
import { isNil } from "lodash";
import numbro from "numbro";

interface Options {
  output?: "percent" | "currency" | "number";
  decimal?: number;
  threshold?: {
    min?: number;
    max?: number;
  };
  thousandSeparated?: boolean;
  fallback?: string;
  averageMinLength?: number;
}

const MAX_CONVERT_DECIMAL = 10;

const isNumeric = (obj: any) => {
  return !Number.isNaN(parseFloat(obj)) && Number.isFinite(Number(obj));
};

export const formatNumber = (value: BigNumber | number | string, options: Options = {}) => {
  const {
    decimal = 4,
    thousandSeparated = true,
    threshold = { max: 1e16 }, // 1e16 = 10,000T
    output = "number",
    fallback = "-",
    averageMinLength = 6,
  } = options;

  if (value === undefined || value === null)
    return fallback;

  const notNumberOrBigNumber = !BigNumber.isBigNumber(value) && !isNumeric(value);
  const notFiniteBigNumber = BigNumber.isBigNumber(value) && !value.isFinite();
  if (notNumberOrBigNumber || notFiniteBigNumber) {
    return fallback;
  }

  const target = BigNumber.isBigNumber(value) ? value : new BigNumber(value);

  const numbroFormatter = (digit: BigNumber) => {
    const defaultRoundingFunction = digit.gte(0) ? Math.floor : Math.ceil;
    const roundingFunction =
      output === "percent" ? Math.round : defaultRoundingFunction;

    const averageOpt =
      output === "percent" ||
      target.toFixed().split(".")[0].length >= averageMinLength;
    const lowPrecisionOpt = averageOpt ? { lowPrecision: false } : {};

    return numbro(
      digit.decimalPlaces(MAX_CONVERT_DECIMAL, BigNumber.ROUND_DOWN).toFixed()
    )
      .format({
        ...lowPrecisionOpt,
        thousandSeparated,
        mantissa: decimal,
        trimMantissa: true,
        roundingFunction,
        average: averageOpt,
        output,
      })
      .toUpperCase();
  };

  if (threshold && !target.isZero()) {
    const { min, max } = threshold;
    if (!isNil(min) && target.lt(min)) {
      return `<${numbroFormatter(new BigNumber(min))}`;
    }
    if (!isNil(max) && target.gt(max)) {
      return `>${numbroFormatter(new BigNumber(max))}`;
    }
  }
  return numbroFormatter(target);
};

export const formatUSD = (value: BigNumber | number | string, decimals = 2) => formatNumber(value, { output: "currency", decimal: decimals });