/**
 * Instances of this class represent rational numbers, with arbitrary precision like bigints have.
 * The rational numbers are always in simplest form.
 * Thanks to division by zero, Infinity, -Infinity, and NaN also have variants here.
 */
class BigRational {
    // Components
    /**
     * The numerator of the rational number.
     */
    _numerator;
    /**
     * The denominator of the rational number. If this is 0, the number is non-finite.
     */
    _denominator;
    /**
     * The numerator of the rational number.
     */
    get numerator() {
        return this._numerator;
    }
    /**
     * The denominator of the rational number. If this is 0, the number is non-finite.
     */
    get denominator() {
        return this._denominator;
    }
    // Form of the number
    /**
     * Puts the rational number into simplest form.
     *
     * All methods of this class assume the input(s) are in simplest form and call simplify at the end to ensure their outputs are,
     * including the constructors. As such, although this method has been made public, you should never actually need to use it yourself.
     *
     * The denominator is always nonnegative in simplest form. The simplest forms of 0, Infinity, -Infinity, and NaN are 0/1, 1/0, -1/0, and 0/0 respectively.
     *
     * Note: This function mutates the BigRational it is called on.
     */
    simplify() {
        if (this._denominator == 0n)
            this._numerator = BigRational.#signB(this._numerator);
        else if (this._numerator == 0n)
            this._denominator = 1n;
        else {
            if (this._denominator < 0n) {
                this._numerator *= -1n;
                this._denominator *= -1n;
            }
            let gcd = BigRational.#absB(BigRational.#gcdB(this._numerator, this._denominator));
            this._numerator /= gcd;
            this._denominator /= gcd;
        }
        return this;
    }
    /**
     * Puts the rational number into simplest form.
     *
     * All methods of this class assume the input(s) are in simplest form and call simplify at the end to ensure their outputs are,
     * including the constructors. As such, although this method has been made public, you should never actually need to use it yourself.
     *
     * The simplest forms of 0, Infinity, -Infinity, and NaN are 0/1, 1/0, -1/0, and 0/0 respectively.
     *
     * Note: This function mutates the BigRational it is called on.
     */
    static simplify(value) {
        return new BigRational(value).simplify();
    }
    /**
     * Returns true if the rational number is finite, false if it is not.
     *
     * A BigRational is finite if and only if its denominator is not 0.
     */
    isFinite() {
        return (this._denominator != 0n);
    }
    /**
     * Returns true if the rational number is finite, false if it is not.
     *
     * A BigRational is finite if and only if its denominator is not 0.
     */
    static isFinite(value) {
        value = new BigRational(value);
        return (value._denominator != 0n);
    }
    /**
     * Returns true if and only if the BigRational represents NaN, i.e. 0/0.
     */
    isNaN() {
        return (this._numerator == 0n && this._denominator == 0n);
    }
    /**
     * Returns true if and only if the BigRational represents NaN, i.e. 0/0.
     */
    static isNaN(value) {
        value = new BigRational(value);
        return (value._numerator == 0n && value._denominator == 0n);
    }
    /**
     * Returns true if and only if the BigRational represents an integer.
     *
     * Infinity and -Infinity are considered integers, NaN is not.
     */
    isInteger() {
        if (this._denominator == 1n)
            return true;
        if (this._denominator == 0n && this._numerator != 0n)
            return true;
        return false;
    }
    /**
     * Returns true if and only if the BigRational represents an integer.
     *
     * Infinity and -Infinity are considered integers, NaN is not.
     */
    static isInteger(value) {
        value = new BigRational(value);
        if (value._denominator == 1n)
            return true;
        if (value._denominator == 0n && value._numerator != 0n)
            return true;
        return false;
    }
    // Constructors
    constructor(value, second) {
        if (value !== undefined && second !== undefined) {
            if (typeof value == "number" || typeof value == "bigint")
                this.fromPair(value, second);
            else
                throw new Error("BigRational constructor called with two arguments and the first was not a bigint or number");
        }
        else if (typeof value == "bigint")
            this.fromBigInt(value);
        else if (typeof value == "number")
            this.fromNumber(value);
        else if (typeof value == "string")
            this.fromString(value);
        else if (Array.isArray(value))
            this.fromArrayPair(value);
        else if (value instanceof BigRational)
            this.fromBigRational(value);
        else {
            this._numerator = 0n;
            this._denominator = 1n;
        }
    }
    // Conversions
    fromBigInt(input) {
        this._numerator = BigInt(input);
        this._denominator = 1n;
        return this;
    }
    static fromBigInt(input) {
        return new BigRational().fromBigInt(input);
    }
    fromArrayPair(input) {
        this._numerator = BigInt(input[0]);
        this._denominator = BigInt(input[1]);
        this.simplify();
        return this;
    }
    static fromArrayPair(input) {
        return new BigRational().fromArrayPair(input);
    }
    fromPair(numerator, denominator) {
        this._numerator = BigInt(numerator);
        this._denominator = BigInt(denominator);
        this.simplify();
        return this;
    }
    static fromPair(numerator, denominator) {
        return new BigRational().fromPair(numerator, denominator);
    }
    fromNumber(input) {
        let result = BigRational.fromNumber(input);
        this._numerator = result._numerator;
        this._denominator = result._denominator;
        this.simplify();
        return this;
    }
    static fromNumber(input) {
        if (input == Infinity)
            return new BigRational(1, 0);
        if (input == -Infinity)
            return new BigRational(-1, 0);
        if (Number.isNaN(input))
            return new BigRational(0, 0);
        return BigRational.fractionApproximation(input, 0).simplify();
    }
    fromString(input) {
        while (input[0] == " ")
            input = input.slice(1);
        while (input[input.length - 1] == " ")
            input = input.slice(0, input.length - 1);
        let divSplit = input.split("/");
        if (divSplit.length == 1) {
            input = divSplit[0];
            while (input[0] == " ")
                input = input.slice(1);
            while (input[input.length - 1] == " ")
                input = input.slice(0, input.length - 1);
            try { // Just an integer
                let result = BigInt(input);
                return this.fromBigInt(result);
            }
            catch { }
            try { // Float
                let result = Number(input);
                if (Number.isNaN(result))
                    throw new Error();
                return this.fromNumber(result);
            }
            catch { }
            if (input == "NaN")
                return this.fromPair(0, 0);
            else
                throw new Error("Cannot convert string to BigRational");
        }
        else if (divSplit.length == 2) {
            try {
                let input1 = BigInt(divSplit[0]);
                let input2 = BigInt(divSplit[1]);
                return this.fromPair(input1, input2);
            }
            catch {
                throw new Error("Cannot convert string to BigRational");
            }
        }
        else
            throw new Error("Cannot convert string to BigRational");
    }
    static fromString(input) {
        return new BigRational().fromString(input);
    }
    fromBigRational(input) {
        this._numerator = input._numerator;
        this._denominator = input._denominator;
        this.simplify(); // Shouldn't be needed, but better safe than sorry
        return this;
    }
    static fromBigRational(input) {
        return new BigRational().fromBigRational(input);
    }
    toString() {
        if (this._denominator == 0n) {
            if (this._numerator > 0n)
                return "Infinity";
            else if (this._numerator < 0n)
                return "-Infinity";
            else
                return "NaN";
        }
        else if (this._denominator == 1n)
            return String(this._numerator);
        else
            return String(this._numerator) + "/" + String(this._denominator);
    }
    static toString(value) {
        value = new BigRational(value);
        return value.toString();
    }
    toNumber() {
        return Number(this._numerator) / Number(this._denominator);
    }
    static toNumber(value) {
        value = new BigRational(value);
        return value.toNumber();
    }
    valueOf() {
        return this.toNumber();
    }
    static valueOf(value) {
        value = new BigRational(value);
        return value.toNumber();
    }
    toBigInt() {
        return this._numerator / this._denominator;
    }
    static toBigInt(value) {
        value = new BigRational(value);
        return value.toBigInt();
    }
    toArrayPair() {
        return [this._numerator, this._denominator];
    }
    static toArrayPair(value) {
        value = new BigRational(value);
        return value.toArrayPair();
    }
    // Comparisons
    /**
     * Returns true if the two rational numbers are equal, false otherwise.
     */
    eq(other) {
        other = new BigRational(other);
        if (this.isFinite() && other.isFinite()) {
            return (this._numerator * other._denominator == this._denominator * other._numerator);
        }
        else {
            return (this.isFinite() == other.isFinite() && this._numerator == other._numerator && this._numerator != 0n);
        }
    }
    /**
     * Returns true if the two rational numbers are equal, false otherwise.
     */
    static eq(value, other) {
        return new BigRational(value).eq(other);
    }
    /**
     * Returns true if the two rational numbers are equal, false otherwise.
     */
    equals(other) {
        return this.eq(other);
    }
    /**
     * Returns true if the two rational numbers are equal, false otherwise.
     */
    static equals(value, other) {
        return new BigRational(value).eq(other);
    }
    /**
     * Returns false if the two rational numbers are equal, true otherwise.
     */
    neq(other) {
        other = new BigRational(other);
        if (this.isNaN() || other.isNaN())
            return false;
        return !this.eq(other);
    }
    /**
     * Returns false if the two rational numbers are equal, true otherwise.
     */
    static neq(value, other) {
        return new BigRational(value).neq(other);
    }
    /**
     * Returns false if the two rational numbers are equal, true otherwise.
     */
    notEquals(other) {
        return this.neq(other);
    }
    /**
     * Returns false if the two rational numbers are equal, true otherwise.
     */
    static notEquals(value, other) {
        return new BigRational(value).neq(other);
    }
    /**
     * Returns true if and only if "this" is greater than "other".
     */
    gt(other) {
        other = new BigRational(other);
        if (this.isNaN() || other.isNaN())
            return false;
        if (this.eq(BigRational.positive_infinity) && other.eq(BigRational.negative_infinity))
            return true; // Special case needed here because both products evaluate to 0
        return (this._numerator * other._denominator > this._denominator * other._numerator);
    }
    /**
     * Returns true if and only if "value" is greater than "other".
     */
    static gt(value, other) {
        return new BigRational(value).gt(other);
    }
    /**
     * Returns true if and only if "this" is less than "other".
     */
    lt(other) {
        other = new BigRational(other);
        if (this.isNaN() || other.isNaN())
            return false;
        if (this.eq(BigRational.negative_infinity) && other.eq(BigRational.positive_infinity))
            return true; // Special case needed here because both products evaluate to 0
        return (this._numerator * other._denominator < this._denominator * other._numerator);
    }
    /**
     * Returns true if and only if "value" is less than "other".
     */
    static lt(value, other) {
        return new BigRational(value).lt(other);
    }
    /**
     * Returns true if and only if "this" is greater than or equal to "other".
     */
    gte(other) {
        return (this.eq(other) || this.gt(other)); // I know I could negate lt here but NaN throws a bit of a wrench in that
    }
    /**
     * Returns true if and only if "value" is greater than or equal to "other".
     */
    static gte(value, other) {
        return new BigRational(value).gte(other);
    }
    /**
     * Returns true if and only if "this" is less than or equal to "other".
     */
    lte(other) {
        return (this.eq(other) || this.lt(other)); // I know I could negate gt here but NaN throws a bit of a wrench in that
    }
    /**
     * Returns true if and only if "value" is less than or equal to "other".
     */
    static lte(value, other) {
        return new BigRational(value).lte(other);
    }
    /**
     * Returns the maximum out of the input rational numbers.
     */
    static max(...inputs) {
        let result = new BigRational(-1n, 0n);
        for (let i of inputs) {
            let bi = new BigRational(i);
            if (bi.isNaN())
                return new BigRational(0n, 0n);
            else if (bi.gt(result))
                result = bi;
        }
        return new BigRational(result);
    }
    /**
     * Returns the maximum out of the input rational numbers.
     */
    max(...inputs) {
        return BigRational.max(...[new BigRational(this)].concat(inputs.map(value => new BigRational(value))));
    }
    /**
     * Returns the minimum out of the input rational numbers.
     */
    static min(...inputs) {
        let result = new BigRational(1n, 0n);
        for (let i of inputs) {
            let bi = new BigRational(i);
            if (bi.isNaN())
                return new BigRational(0n, 0n);
            else if (bi.lt(result))
                result = bi;
        }
        return new BigRational(result);
    }
    /**
     * Returns the minimum out of the input rational numbers.
     */
    min(...inputs) {
        return BigRational.min(...[new BigRational(this)].concat(inputs.map(value => new BigRational(value))));
    }
    // Inverses
    /**
     * Returns the negative (i.e. the additive inverse) of a BigRational.
     */
    neg() {
        return new BigRational(-this._numerator, this._denominator);
    }
    /**
     * Returns the negative (i.e. the additive inverse) of a BigRational.
     */
    static neg(value) {
        return new BigRational(value).neg();
    }
    /**
     * Returns the negative (i.e. the additive inverse) of a BigRational.
     */
    negative() {
        return this.neg();
    }
    /**
     * Returns the negative (i.e. the additive inverse) of a BigRational.
     */
    static negative(value) {
        return new BigRational(value).neg();
    }
    /**
     * Returns the negative (i.e. the additive inverse) of a BigRational.
     */
    negate() {
        return this.neg();
    }
    /**
     * Returns the negative (i.e. the additive inverse) of a BigRational.
     */
    static negate(value) {
        return new BigRational(value).neg();
    }
    /**
     * Returns the reciprocal (multiplicative inverse) of a BigRational.
     */
    recip() {
        return new BigRational(this._denominator, this._numerator);
    }
    /**
     * Returns the reciprocal (multiplicative inverse) of a BigRational.
     */
    static recip(value) {
        return new BigRational(value).recip();
    }
    /**
     * Returns the reciprocal (multiplicative inverse) of a BigRational.
     */
    reciprocal() {
        return this.recip();
    }
    /**
     * Returns the reciprocal (multiplicative inverse) of a BigRational.
     */
    static reciprocal(value) {
        return new BigRational(value).recip();
    }
    // Unary operations
    /**
     * Returns the sign of a BigRational as a Number.
     */
    sign() {
        if (this.isNaN())
            return NaN;
        else
            return Math.sign(Number(this._numerator));
    }
    /**
     * Returns the sign of a BigRational as a Number.
     */
    static sign(value) {
        return new BigRational(value).sign();
    }
    /**
     * Returns the sign of a BigRational as a Number.
     */
    sgn() {
        return this.sign();
    }
    /**
     * Returns the sign of a BigRational as a Number.
     */
    static sgn(value) {
        return new BigRational(value).sign();
    }
    /**
     * Returns the absolute value of a BigRational.
     */
    abs() {
        let result = new BigRational(this);
        if (result._numerator < 0n)
            result._numerator *= -1n;
        result.simplify();
        return result;
    }
    /**
     * Returns the absolute value of a BigRational.
     */
    static abs(value) {
        return new BigRational(value).abs();
    }
    // Basic arithmetic
    /**
     * Addition of two rational numbers.
     */
    add(other) {
        other = new BigRational(other);
        // Normal rational addition
        if (this.isFinite() && other.isFinite())
            return new BigRational(this._numerator * other._denominator + other._numerator * this._denominator, this._denominator * other._denominator);
        // Return NaN if NaN is involved or Infinity + -Infinity
        if (this.isNaN() || other.isNaN() || (this.eq(BigRational.positive_infinity) && other.eq(BigRational.negative_infinity)) || (this.eq(BigRational.negative_infinity) && other.eq(BigRational.positive_infinity)))
            return new BigRational(0n, 0n);
        // Otherwise, either only one entry is nonfinite (so return that one) or they're the same (and Infinity + Infinity = Infinity)
        if (!other.isFinite())
            return new BigRational(other);
        else
            return new BigRational(this);
    }
    /**
     * Addition of two rational numbers.
     */
    static add(value, other) {
        return new BigRational(value).add(other);
    }
    /**
     * Addition of two rational numbers.
     */
    plus(other) {
        return this.add(other);
    }
    /**
     * Addition of two rational numbers.
     */
    static plus(value, other) {
        return new BigRational(value).add(other);
    }
    /**
     * Subtraction of two rational numbers.
     */
    sub(other) {
        return this.add(BigRational.neg(other));
    }
    /**
     * Subtraction of two rational numbers.
     */
    static sub(value, other) {
        return new BigRational(value).sub(other);
    }
    /**
     * Subtraction of two rational numbers.
     */
    subtract(other) {
        return this.sub(other);
    }
    /**
     * Subtraction of two rational numbers.
     */
    static subtract(value, other) {
        return new BigRational(value).sub(other);
    }
    /**
     * Subtraction of two rational numbers.
     */
    minus(other) {
        return this.sub(other);
    }
    /**
     * Subtraction of two rational numbers.
     */
    static minus(value, other) {
        return new BigRational(value).sub(other);
    }
    /**
     * Multiplication of two rational numbers.
     */
    mul(other) {
        other = new BigRational(other);
        // Non-finite numbers mess with addition but they actually fit into multiplication just fine
        return new BigRational(this._numerator * other._numerator, this._denominator * other._denominator);
    }
    /**
     * Multiplication of two rational numbers.
     */
    static mul(value, other) {
        return new BigRational(value).mul(other);
    }
    /**
     * Multiplication of two rational numbers.
     */
    multiply(other) {
        return this.mul(other);
    }
    /**
     * Multiplication of two rational numbers.
     */
    static multiply(value, other) {
        return new BigRational(value).mul(other);
    }
    /**
     * Multiplication of two rational numbers.
     */
    times(other) {
        return this.mul(other);
    }
    /**
     * Multiplication of two rational numbers.
     */
    static times(value, other) {
        return new BigRational(value).mul(other);
    }
    /**
     * Division of two rational numbers.
     */
    div(other) {
        other = new BigRational(other);
        // I could do this as multiplying by the reciprocal but I feel it's better to just do it directly
        return new BigRational(this._numerator * other._denominator, this._denominator * other._numerator);
    }
    /**
     * Division of two rational numbers.
     */
    static div(value, other) {
        return new BigRational(value).div(other);
    }
    /**
     * Division of two rational numbers.
     */
    divide(other) {
        return this.div(other);
    }
    /**
     * Division of two rational numbers.
     */
    static divide(value, other) {
        return new BigRational(value).div(other);
    }
    // Rounding
    /**
     * "Rounds" the rational number it's called on to the nearest multiple of "multiple" that's less than or equal to it.
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer below.
     */
    floor(multiple = BigRational.one) {
        multiple = new BigRational(multiple).abs(); // Multiples of -n are the same as multiples of n
        if (!this.isFinite() || multiple.isNaN())
            return new BigRational(0n, 0n);
        if (!multiple.isFinite()) {
            if (this.gte(0))
                return new BigRational(0n);
            else
                return new BigRational(-Infinity);
        }
        if (multiple.eq(0))
            return new BigRational(this);
        if (multiple.eq(BigRational.one)) {
            let result = this._numerator / this._denominator;
            if (result * this._denominator <= this._numerator)
                return new BigRational(result);
            else
                return new BigRational(result - 1n);
        }
        else
            return this.div(multiple).floor().mul(multiple);
    }
    /**
     * "Rounds" the rational number it's called on to the nearest multiple of "multiple" that's less than or equal to it.
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer below.
     */
    static floor(value, multiple = BigRational.one) {
        return new BigRational(value).floor(multiple);
    }
    /**
     * "Rounds" the rational number it's called on to the nearest multiple of "multiple" that's greater than or equal to it.
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer above.
     */
    ceil(multiple = BigRational.one) {
        multiple = new BigRational(multiple).abs(); // Multiples of -n are the same as multiples of n
        if (!this.isFinite() || multiple.isNaN())
            return new BigRational(0n, 0n);
        if (!multiple.isFinite()) {
            if (this.gte(0))
                return new BigRational(Infinity);
            else
                return new BigRational(0n);
        }
        if (multiple.eq(0))
            return new BigRational(this);
        if (multiple.eq(BigRational.one)) {
            let result = this._numerator / this._denominator;
            if (result * this._denominator >= this._numerator)
                return new BigRational(result);
            else
                return new BigRational(result + 1n);
        }
        else
            return this.div(multiple).floor().mul(multiple);
    }
    /**
     * "Rounds" the rational number it's called on to the nearest multiple of "multiple" that's greater than or equal to it.
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer above.
     */
    static ceil(value, multiple = BigRational.one) {
        return new BigRational(value).ceil(multiple);
    }
    /**
     * "Rounds" the rational number it's called on to the nearest multiple of "multiple" that's greater than or equal to it.
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer above.
     */
    ceiling(multiple = BigRational.one) {
        return this.ceil(multiple);
    }
    /**
     * "Rounds" the rational number it's called on to the nearest multiple of "multiple" that's greater than or equal to it.
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer above.
     */
    static ceiling(value, multiple = BigRational.one) {
        return new BigRational(value).ceiling(multiple);
    }
    /**
     * "Rounds" the rational number it's called on to the nearest multiple of "multiple" that's closer to 0 than it or equal to it.
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer closer to 0.
     * Acts like floor on positive numbers, but acts like ceiling on negative numbers.
     */
    trunc(multiple = BigRational.one) {
        if (this.gte(0))
            return this.floor(multiple);
        else
            return this.ceil(multiple);
    }
    /**
     * "Rounds" the rational number it's called on to the nearest multiple of "multiple" that's closer to 0 than it or equal to it.
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer closer to 0.
     * Acts like floor on positive numbers, but acts like ceiling on negative numbers.
     */
    static trunc(value, multiple = BigRational.one) {
        return new BigRational(value).trunc(multiple);
    }
    /**
     * Rounds the rational number it's called on to the nearest multiple of "multiple".
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer.
     */
    round(multiple = BigRational.one) {
        multiple = new BigRational(multiple).abs(); // Multiples of -n are the same as multiples of n
        if (!this.isFinite() || multiple.isNaN())
            return new BigRational(0n, 0n);
        if (!multiple.isFinite())
            return new BigRational(0n);
        let floor = this.floor(multiple);
        let ceiling = this.ceil(multiple);
        // Return whichever of the ceiling and floor are closer. If tied, use ceiling.
        if (ceiling.sub(this).lte(this.sub(floor)))
            return ceiling;
        else
            return floor;
    }
    /**
     * Rounds the rational number it's called on to the nearest multiple of "multiple".
     * "multiple" is 1 by default, meaning the rounding is to the nearest integer.
     */
    static round(value, multiple = BigRational.one) {
        return new BigRational(value).round(multiple);
    }
    // More arithmetic
    /**
     * Modulo, a.k.a. remainder: what is the remainder of a / b?
     */
    mod(other) {
        other = new BigRational(other);
        if (!this.isFinite() || other.isNaN())
            return new BigRational(NaN);
        if (!other.isFinite())
            return new BigRational(this);
        if (other.lt(0))
            return this.neg().mod(other.neg()).neg();
        return this.sub(this.floor(other));
    }
    /**
     * Modulo, a.k.a. remainder: what is the remainder of a / b?
     */
    static mod(value, other) {
        return new BigRational(value).mod(other);
    }
    /**
     * Modulo, a.k.a. remainder: what is the remainder of a / b?
     */
    modulo(other) {
        return this.mod(other);
    }
    /**
     * Modulo, a.k.a. remainder: what is the remainder of a / b?
     */
    static modulo(value, other) {
        return new BigRational(value).mod(other);
    }
    /**
     * Exponentiation. The exponent must be a bigint, because rational exponents are roots, which usually give irrational results.
     */
    pow(exponent) {
        exponent = BigInt(exponent);
        if (this.isNaN())
            return new BigRational(NaN);
        if (exponent == 0n)
            return new BigRational(1);
        else if (exponent < 0n) {
            exponent *= -1n;
            return new BigRational(this._denominator ** exponent, this._numerator ** exponent);
        }
        else
            return new BigRational(this._numerator ** exponent, this._denominator ** exponent);
    }
    /**
     * Exponentiation. The exponent must be a bigint, because rational exponents are roots, which usually give irrational results.
     */
    static pow(base, exponent) {
        exponent = BigInt(exponent);
        return new BigRational(base).pow(exponent);
    }
    /**
     * Finds the greatest common divisor of two rational numbers. (To avoid ambiguity, the result returned is always nonnegative.)
     */
    static gcd(a, b) {
        a = new BigRational(a);
        b = new BigRational(b);
        if (a.isNaN() || b.isNaN())
            return new BigRational(NaN);
        if (b.eq(0) || !b.isFinite())
            return new BigRational(a).abs();
        if (a.eq(0) || !a.isFinite())
            return new BigRational(b).abs();
        return BigRational.gcd(b, a.mod(b));
    }
    /**
     * Finds the greatest common divisor of two rational numbers. (To avoid ambiguity, the result returned is always nonnegative.)
     */
    gcd(other) {
        return BigRational.gcd(this, other);
    }
    /**
     * Finds the least common multiple of two rational numbers. (To avoid ambiguity, the result returned is always nonnegative.)
     */
    static lcm(a, b) {
        a = new BigRational(a);
        b = new BigRational(b);
        if (a.isNaN() || b.isNaN())
            return new BigRational(NaN);
        if (b.eq(0) || !a.isFinite())
            return new BigRational(a).abs();
        if (a.eq(0) || !b.isFinite())
            return new BigRational(b).abs();
        return BigRational.mul(a, b).div(BigRational.gcd(a, b)).abs();
    }
    /**
     * Finds the least common multiple of two rational numbers. (To avoid ambiguity, the result returned is always nonnegative.)
     */
    lcm(other) {
        return BigRational.lcm(this, other);
    }
    // Constants
    /** Represents 0. */
    static zero = new BigRational(0n, 1n);
    /** Represents 1. */
    static one = new BigRational(1n, 1n);
    /** Represents 2. */
    static two = new BigRational(2n, 1n);
    /** Represents 1/2. */
    static one_half = new BigRational(1n, 2n);
    /** Represents Infinity. */
    static positive_infinity = new BigRational(1n, 0n);
    /** Represents -Infinity. */
    static negative_infinity = new BigRational(-1n, 0n);
    /** Represents NaN. */
    static NaN = new BigRational(0n, 0n);
    // Utility functions
    /**
     * Uses continued fractions to approximate a floating point number as a rational number.
     * Taken from Eternal Notations.
     * @param value ( number ! ) The value to be approximated as a fraction.
     * @param precision ( number ! ) If this is positive, the approximation will be within 'precision' of the true value. If this is negative, the approximation will be within 'value'/abs('precision') of the true value. In other words, a positive precision is absolute, a negative precision is proportional. If precision is 0, it will be as exact as floating point numbers will allow.
     * @param maxIterations ( number ) The process will end after this many iterations even if the desired precision has not been reached. Default is Infinity.
     * @param maxDenominator ( number ) If the approximation's denominator is above this, the approximation ends there. Default is Infinity, which means there is no maximum denominator.
     * @param strictMaxDenominator ( boolean ) If this parameter is true, then rather than the approximation stopping at the first approximation after the maximum denominator is exceeded, it stops at the last approximation before the maximum denominator is exceeded. Default is false.
     * @param maxNumerator ( number ) If the approximation's numerator is above this, the approximation ends there. Default is Infinity, which means there is no maximum numerator.
     * @param strictMaxNumerator ( boolean ) If this parameter is true, then rather than the approximation stopping at the first approximation after the maximum numerator is exceeded, it stops at the last approximation before the maximum numerator is exceeded (unless the approximation is already a whole number, in which case this parameter does not apply). Default is false.
     */
    static fractionApproximation(value, precision, maxIterations = Infinity, maxDenominator = Infinity, strictMaxDenominator = false, maxNumerator = Infinity, strictMaxNumerator = false) {
        let continuedFraction = [];
        let whole = 0;
        let numerator = 0;
        let denominator = 1;
        let previous = [0, 0, 1];
        let approximation = 0;
        let negative = false;
        if (value < 0) {
            value *= -1;
            negative = true;
        }
        let currentValue = value;
        if (precision < 0)
            precision = Math.abs(value * precision);
        if (precision > 1)
            precision = 1;
        while (Math.abs(value - approximation) > precision && denominator <= maxDenominator && numerator <= maxNumerator && continuedFraction.length < maxIterations) {
            continuedFraction.push(Math.floor(currentValue));
            previous = [whole, numerator, denominator];
            numerator = continuedFraction[continuedFraction.length - 1];
            denominator = 1;
            for (let i = continuedFraction.length - 2; i >= 0; i--) {
                let temp = denominator;
                denominator = numerator;
                numerator = temp + denominator * continuedFraction[i];
            }
            approximation = whole + (numerator / denominator);
            currentValue = currentValue % 1;
            if (currentValue == 0)
                break;
            else
                currentValue = 1 / currentValue;
        }
        if ((denominator > maxDenominator && strictMaxDenominator) || (numerator > maxNumerator && strictMaxNumerator && continuedFraction.length > 1)) {
            continuedFraction.pop();
            [whole, numerator, denominator] = previous;
        }
        if (continuedFraction.length == 0) {
            return new BigRational(0n, 1n);
        }
        else {
            return new BigRational(numerator * (negative ? -1 : 1), denominator);
        }
    }
    /**
     * Absolute value function for bigints
     */
    static #absB(b) {
        if (b < 0n)
            return b * -1n;
        else
            return b;
    }
    /**
     * Floored modulo is the correct modulo mathematically, but JavaScript uses a different form. This function fixes that.
     */
    static #modB(a, b) {
        if (a >= 0n && b >= 0n)
            return a % b;
        else if (a < 0n && b >= 0n)
            return b - (BigRational.#absB(a) % b);
        else
            return -BigRational.#modB(-a, -b);
    }
    /**
     * Returns the sign of a bigint
     */
    static #signB(a) {
        if (a > 0n)
            return 1n;
        else if (a < 0n)
            return -1n;
        else
            return 0n;
    }
    /**
     * Greatest common denominator of two bigints
     */
    static #gcdB(a, b) {
        let temp;
        while (b != 0n) {
            temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
}
