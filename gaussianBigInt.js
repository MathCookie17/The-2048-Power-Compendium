/**
 * Instances of this class represent Gaussian integers, i.e. complex numbers of the form a + bi, where a and b are bigints.
 * Since these are bigints, not floats, some common complex number operations (magnitude and phase, for instance) are not implemented
 * because there is no way to keep them within the realm of integers
 * (though norm, which is just the square of magnitude, is included).
 */
class GaussianBigInt {
    // Components
    /**
     * The real part of the Gaussian integer.
     */
    real;
    /**
     * The imaginary part of the Gaussian integer.
     */
    imaginary;
    /**
     * The real part of the Gaussian integer.
     */
    get Re() {
        return this.real;
    }
    set Re(Re) {
        this.real = Re;
    }
    /**
     * The imaginary part of the Gaussian integer.
     */
    get Im() {
        return this.imaginary;
    }
    set Im(Im) {
        this.imaginary = Im;
    }
    // Constructors
    constructor(value, second) {
        if (value !== undefined && second !== undefined) {
            if (typeof value == "number" || typeof value == "bigint")
                this.fromPair(value, second);
            else
                throw new Error("Gaussian bigint constructor called with two arguments and the first was not a bigint or number");
        }
        else if (typeof value == "bigint" || typeof value == "number")
            this.fromBigInt(value);
        else if (typeof value == "string")
            this.fromString(value);
        else if (Array.isArray(value))
            this.fromArrayPair(value);
        else if (value instanceof GaussianBigInt)
            this.fromGaussianBigInt(value);
        else {
            this.real = 0n;
            this.imaginary = 0n;
        }
    }
    // Conversions
    fromBigInt(input) {
        this.real = BigInt(input);
        this.imaginary = 0n;
        return this;
    }
    static fromBigInt(input) {
        return new GaussianBigInt().fromBigInt(input);
    }
    fromArrayPair(input) {
        this.real = BigInt(input[0]);
        this.imaginary = BigInt(input[1]);
        return this;
    }
    static fromArrayPair(input) {
        return new GaussianBigInt().fromArrayPair(input);
    }
    fromPair(real, imaginary) {
        this.real = BigInt(real);
        this.imaginary = BigInt(imaginary);
        return this;
    }
    static fromPair(real, imaginary) {
        return new GaussianBigInt().fromPair(real, imaginary);
    }
    fromString(input) {
        while (input[0] == " ")
            input = input.slice(1);
        while (input[input.length - 1] == " ")
            input = input.slice(0, input.length - 1);
        let plusSplit = input.split("+");
        if (plusSplit.length == 1) {
            let negativeFirst = false;
            if (input[0] == "-") {
                negativeFirst = true;
                input = input.slice(1);
            }
            let result1;
            try { // Just a real number
                result1 = BigInt(input);
                this.real = result1;
                this.imaginary = 0n;
                if (negativeFirst)
                    this.real *= -1n;
                return this;
            }
            catch { }
            if (input[input.length - 1] == "i" || input[input.length - 1] == "j") { // Just an imaginary number
                input = input.slice(0, input.length - 1);
                while (input[0] == " ")
                    input = input.slice(1);
                while (input[input.length - 1] == " ")
                    input = input.slice(0, input.length - 1);
                if (input.length == 0) {
                    this.real = 0n;
                    this.imaginary = 1n;
                    if (negativeFirst)
                        this.imaginary *= -1n;
                    return this;
                }
                try {
                    result1 = BigInt(input);
                    this.real = 0n;
                    this.imaginary = result1;
                    if (negativeFirst)
                        this.imaginary *= -1n;
                    return this;
                }
                catch { }
                let minusSplit = input.split("-");
                if (minusSplit.length == 2) { // a + bi is handled in the plusSplit length 2 case, so now we need to handle a - bi
                    try {
                        this.real = BigInt(minusSplit[0]);
                        let imString = minusSplit[1];
                        while (imString[0] == " ")
                            imString = imString.slice(1);
                        while (imString[imString.length - 1] == " ")
                            imString = imString.slice(0, imString.length - 1);
                        if (imString.length == 0)
                            this.imaginary = 1n;
                        else
                            this.imaginary = BigInt(imString);
                        if (negativeFirst)
                            this.real *= -1n;
                        this.imaginary *= -1n;
                        return this;
                    }
                    catch {
                        throw new Error("Cannot convert string to gaussian bigint");
                    }
                }
                else
                    throw new Error("Cannot convert string to gaussian bigint");
            }
            else
                throw new Error("Cannot convert string to gaussian bigint");
        }
        else if (plusSplit.length == 2) {
            this.real = BigInt(plusSplit[0]);
            let imString = plusSplit[1];
            while (imString[0] == " ")
                imString = imString.slice(1);
            while (imString[imString.length - 1] == " ")
                imString = imString.slice(0, imString.length - 1);
            if (imString[imString.length - 1] == "i" || imString[imString.length - 1] == "j") {
                imString = imString.slice(0, imString.length - 1);
                let imaginaryNegative = false;
                if (imString[0] == "-") {
                    imString = imString.slice(1);
                    imaginaryNegative = true;
                }
                while (imString[0] == " ")
                    imString = imString.slice(1);
                while (imString[imString.length - 1] == " ")
                    imString = imString.slice(0, imString.length - 1);
                if (imString.length == 0)
                    this.imaginary = 1n;
                else
                    this.imaginary = BigInt(imString);
                if (imaginaryNegative)
                    this.imaginary *= -1n;
                return this;
            }
            else
                throw new Error("Cannot convert string to gaussian bigint");
        }
        else
            throw new Error("Cannot convert string to gaussian bigint");
    }
    static fromString(input) {
        return new GaussianBigInt().fromString(input);
    }
    fromGaussianBigInt(input) {
        this.real = input.real;
        this.imaginary = input.imaginary;
        return this;
    }
    static fromGaussianBigInt(input) {
        return new GaussianBigInt().fromGaussianBigInt(input);
    }
    toString() {
        if (this.imaginary == 0n)
            return String(this.real);
        else if (this.real == 0n)
            return String(this.imaginary) + "i";
        else if (this.imaginary < 0n)
            return String(this.real) + "-" + String(GaussianBigInt.#absB(this.imaginary)) + "i";
        else
            return String(this.real) + "+" + String(this.imaginary) + "i";
    }
    static toString(value) {
        return value.toString();
    }
    valueOf() {
        if (this.imaginary == 0n)
            return this.real;
        else
            return this;
    }
    static valueOf(value) {
        return value.valueOf();
    }
    toArrayPair() {
        return [this.real, this.imaginary];
    }
    static toArrayPair(value) {
        return value.toArrayPair();
    }
    // Equality (> and < don't make sense since the complex numbers are not ordered, but = and != work)
    /**
     * Returns true if the two Gaussian integers are equal, false otherwise.
     */
    eq(other) {
        other = new GaussianBigInt(other);
        return (this.real == other.real && this.imaginary == other.imaginary);
    }
    /**
     * Returns true if the two Gaussian integers are equal, false otherwise.
     */
    static eq(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.eq(other);
    }
    /**
     * Returns true if the two Gaussian integers are equal, false otherwise.
     */
    equals(other) {
        other = new GaussianBigInt(other);
        return this.eq(other);
    }
    /**
     * Returns true if the two Gaussian integers are equal, false otherwise.
     */
    static equals(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.eq(other);
    }
    /**
     * Returns false if the two Gaussian integers are equal, true otherwise.
     */
    neq(other) {
        other = new GaussianBigInt(other);
        return !(this.eq(other));
    }
    /**
     * Returns false if the two Gaussian integers are equal, true otherwise.
     */
    static neq(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.neq(other);
    }
    /**
     * Returns false if the two Gaussian integers are equal, true otherwise.
     */
    notEquals(other) {
        other = new GaussianBigInt(other);
        return this.neq(other);
    }
    /**
     * Returns false if the two Gaussian integers are equal, true otherwise.
     */
    static notEquals(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.neq(other);
    }
    // Unary operations
    /**
     * Returns the negative of a Gaussian integer (negates both the real and imaginary parts).
     */
    neg() {
        return new GaussianBigInt(-this.real, -this.imaginary);
    }
    /**
     * Returns the negative of a Gaussian integer (negates both the real and imaginary parts).
     */
    static neg(value) {
        value = new GaussianBigInt(value);
        return value.neg();
    }
    /**
     * Returns the negative of a Gaussian integer (negates both the real and imaginary parts).
     */
    negative() {
        return this.neg();
    }
    /**
     * Returns the negative of a Gaussian integer (negates both the real and imaginary parts).
     */
    static negative(value) {
        value = new GaussianBigInt(value);
        return value.neg();
    }
    /**
     * Returns the negative of a Gaussian integer (negates both the real and imaginary parts).
     */
    negate() {
        return this.neg();
    }
    /**
     * Returns the negative of a Gaussian integer (negates both the real and imaginary parts).
     */
    static negate(value) {
        value = new GaussianBigInt(value);
        return value.neg();
    }
    /**
     * Multiplies a Gaussian integer by i, i.e. rotates it 90 degrees.
     */
    muli() {
        return new GaussianBigInt(-this.imaginary, this.real);
    }
    /**
     *  Multiplies a Gaussian integer by i, i.e. rotates it 90 degrees.
     */
    static muli(value) {
        value = new GaussianBigInt(value);
        return value.muli();
    }
    /**
     * Multiplies a Gaussian integer by i, i.e. rotates it 90 degrees.
     */
    rot90() {
        return this.muli();
    }
    /**
     *  Multiplies a Gaussian integer by i, i.e. rotates it 90 degrees.
     */
    static rot90(value) {
        value = new GaussianBigInt(value);
        return value.muli();
    }
    /**
     * Multiplies a Gaussian integer by -i, i.e. rotates it 270 degrees.
     */
    mulnegi() {
        return new GaussianBigInt(this.imaginary, -this.real);
    }
    /**
     * Multiplies a Gaussian integer by -i, i.e. rotates it 270 degrees.
     */
    static mulnegi(value) {
        value = new GaussianBigInt(value);
        return value.mulnegi();
    }
    /**
     * Multiplies a Gaussian integer by -i, i.e. rotates it 270 degrees.
     */
    rot270() {
        return this.mulnegi();
    }
    /**
     * Multiplies a Gaussian integer by -i, i.e. rotates it 270 degrees.
     */
    static rot270(value) {
        value = new GaussianBigInt(value);
        return value.mulnegi();
    }
    /**
     * Returns the complex conjugate of a Gaussian integer (the complex conjugate of a + bi is a - bi).
     */
    conj() {
        return new GaussianBigInt(this.real, -this.imaginary);
    }
    /**
     * Returns the complex conjugate of a Gaussian integer (the complex conjugate of a + bi is a - bi).
     */
    static conj(value) {
        value = new GaussianBigInt(value);
        return value.conj();
    }
    /**
     * Returns the complex conjugate of a Gaussian integer (the complex conjugate of a + bi is a - bi).
     */
    conjugate() {
        return this.conj();
    }
    /**
     * Returns the complex conjugate of a Gaussian integer (the complex conjugate of a + bi is a - bi).
     */
    static conjugate(value) {
        value = new GaussianBigInt(value);
        return value.conj();
    }
    /**
     * Returns the norm of a Gaussian integer (The norm of a + bi is a^2 + b^2). This function returns a bigint.
     */
    norm() {
        return this.real ** 2n + this.imaginary ** 2n;
    }
    /**
     * Returns the norm of a Gaussian integer (The norm of a + bi is a^2 + b^2). This function returns a bigint.
     */
    static norm(value) {
        value = new GaussianBigInt(value);
        return value.norm();
    }
    /**
     * Returns the norm of a Gaussian integer (The norm of a + bi is a^2 + b^2). This function returns a GaussianBigInt.
     */
    normG() {
        return new GaussianBigInt(this.norm());
    }
    /**
     * Returns the norm of a Gaussian integer (The norm of a + bi is a^2 + b^2). This function returns a GaussianBigInt.
     */
    static normG(value) {
        value = new GaussianBigInt(value);
        return value.normG();
    }
    /**
     * Returns i^(power). The power must be a bigint, because complex powers of i would not be gaussian integers.
     */
    static ipow(power) {
        power = BigInt(power);
        let mod4 = GaussianBigInt.#modB(power, 4n);
        if (mod4 == 0n)
            return new GaussianBigInt(1n, 0n);
        else if (mod4 == 1n)
            return new GaussianBigInt(0n, 1n);
        if (mod4 == 2n)
            return new GaussianBigInt(-1n, 0n);
        else if (mod4 == 3n)
            return new GaussianBigInt(0n, -1n);
        else
            return new GaussianBigInt(1n, 0n); // This shouldn't happen
    }
    /**
     * What quadrant is this Gaussian integer in?
     * Quadrant 0 is (+, +), quadrant 1 is (-, +), quadrant 2 is (-, -), quadrant 3 is (+, -). Numbers on one of the axes are put in the quadrant that's counterclockwise before them, so 1 is in quadrant 0 and i is in quadrant 1. An input of 0 returns -1.
     */
    quadrant() {
        if (this.real > 0n && this.imaginary >= 0n)
            return 0n;
        if (this.real <= 0n && this.imaginary > 0n)
            return 1n;
        if (this.real < 0n && this.imaginary <= 0n)
            return 2n;
        if (this.real >= 0n && this.imaginary < 0n)
            return 3n;
        return -1n;
    }
    /**
     * What quadrant is this Gaussian integer in?
     * Quadrant 0 is (+, +), quadrant 1 is (-, +), quadrant 2 is (-, -), quadrant 3 is (+, -). Numbers on one of the axes are put in the quadrant that's counterclockwise before them, so 1 is in quadrant 0 and i is in quadrant 1. An input of 0 returns -1.
     */
    static quadrant(value) {
        value = new GaussianBigInt(value);
        return value.quadrant();
    }
    /**
     * What unit do we have to multiply by to rotate this gaussian integer into the first quadrant?
     */
    firstQuadrantUnit() {
        if (this.eq(GaussianBigInt.zero))
            return new GaussianBigInt(0n, 0n);
        return GaussianBigInt.ipow(4n - this.quadrant());
    }
    /**
     * What unit do we have to multiply by to rotate this gaussian integer into the first quadrant?
     */
    static firstQuadrantUnit(value) {
        value = new GaussianBigInt(value);
        return value.firstQuadrantUnit();
    }
    /**
     * Multiplies the gaussian integer in question by some power of i to put it into the first quadrant.
    */
    toFirstQuadrant() {
        return this.mul(this.firstQuadrantUnit());
    }
    /**
     * Multiplies the gaussian integer in question by some power of i to put it into the first quadrant.
    */
    static toFirstQuadrant(value) {
        value = new GaussianBigInt(value);
        return value.toFirstQuadrant();
    }
    // Arithmetic
    /**
     * Addition of two Gaussian integers.
     */
    add(other) {
        other = new GaussianBigInt(other);
        return new GaussianBigInt(this.real + other.real, this.imaginary + other.imaginary);
    }
    /**
     * Addition of two Gaussian integers.
     */
    static add(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.add(other);
    }
    /**
     * Addition of two Gaussian integers.
     */
    plus(other) {
        other = new GaussianBigInt(other);
        return this.add(other);
    }
    /**
     * Addition of two Gaussian integers.
     */
    static plus(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.add(other);
    }
    /**
     * Subtraction of two Gaussian integers.
     */
    sub(other) {
        other = new GaussianBigInt(other);
        return new GaussianBigInt(this.real - other.real, this.imaginary - other.imaginary);
    }
    /**
     * Subtraction of two Gaussian integers.
     */
    static sub(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.sub(other);
    }
    /**
     * Subtraction of two Gaussian integers.
     */
    subtract(other) {
        other = new GaussianBigInt(other);
        return this.sub(other);
    }
    /**
     * Subtraction of two Gaussian integers.
     */
    static subtract(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.sub(other);
    }
    /**
     * Subtraction of two Gaussian integers.
     */
    minus(other) {
        other = new GaussianBigInt(other);
        return this.sub(other);
    }
    /**
     * Subtraction of two Gaussian integers.
     */
    static minus(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.sub(other);
    }
    /**
     * Multiplication of two Gaussian integers.
     */
    mul(other) {
        other = new GaussianBigInt(other);
        return new GaussianBigInt(this.real * other.real - this.imaginary * other.imaginary, this.real * other.imaginary + this.imaginary * other.real);
    }
    /**
     * Multiplication of two Gaussian integers.
     */
    static mul(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.mul(other);
    }
    /**
     * Multiplication of two Gaussian integers.
     */
    multiply(other) {
        other = new GaussianBigInt(other);
        return this.sub(other);
    }
    /**
     * Multiplication of two Gaussian integers.
     */
    static multiply(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.sub(other);
    }
    /**
     * Multiplication of two Gaussian integers.
     */
    times(other) {
        other = new GaussianBigInt(other);
        return this.sub(other);
    }
    /**
     * Multiplication of two Gaussian integers.
     */
    static times(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.sub(other);
    }
    /**
     * Division of two Gaussian integers (rounds in the same way that bigint division does)
     */
    div(other) {
        other = new GaussianBigInt(other);
        let denominator = other.norm();
        let numerator = this.mul(other.conj());
        return new GaussianBigInt(numerator.real / denominator, numerator.imaginary / denominator);
    }
    /**
     * Division of two Gaussian integers (rounds in the same way that bigint division does)
     */
    static div(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.div(other);
    }
    /**
     * Division of two Gaussian integers (rounds in the same way that bigint division does)
     */
    divide(other) {
        other = new GaussianBigInt(other);
        return this.divide(other);
    }
    /**
     * Division of two Gaussian integers (rounds in the same way that bigint division does)
     */
    static divide(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.divide(other);
    }
    /**
     * Modulo, a.k.a. remainder: what is the remainder of a / b?
     */
    mod(other) {
        other = new GaussianBigInt(other);
        let result = this.sub(this.div(other).mul(other));
        while (result.plus(other).norm() < result.norm()) {
            result = result.plus(other);
        }
        while (result.sub(other).norm() < result.norm()) {
            result = result.sub(other);
        }
        while (result.plus(other.muli()).norm() < result.norm()) {
            result = result.plus(other.muli());
        }
        while (result.sub(other.muli()).norm() < result.norm()) {
            result = result.sub(other.muli());
        }
        return result;
    }
    /**
     * Modulo, a.k.a. remainder: what is the remainder of a / b?
     */
    static mod(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.mod(other);
    }
    /**
     * Modulo, a.k.a. remainder: what is the remainder of a / b?
     */
    modulo(other) {
        other = new GaussianBigInt(other);
        return this.mod(other);
    }
    /**
     * Modulo, a.k.a. remainder: what is the remainder of a / b?
     */
    static modulo(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.mod(other);
    }
    /**
     * Division of two Gaussian integers (rounds in the way that minimizes the remainder)
     */
    divM(other) {
        other = new GaussianBigInt(other);
        return this.sub(this.mod(other)).div(other);
    }
    /**
     * Division of two Gaussian integers (rounds in the way that minimizes the remainder)
     */
    static divM(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.divM(other);
    }
    /**
     * Division of two Gaussian integers (rounds in the way that minimizes the remainder)
     */
    divideM(other) {
        other = new GaussianBigInt(other);
        return this.divM(other);
    }
    /**
     * Division of two Gaussian integers (rounds in the way that minimizes the remainder)
     */
    static divideM(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.divM(other);
    }
    /**
     * Exponentiation. The exponent must be a nonnegative bigint, because negative and complex exponents do not stay within the integers.
     */
    pow(exponent) {
        exponent = BigInt(exponent);
        if (exponent < 0n)
            throw new RangeError("Gaussian bigint negative exponent");
        let result = new GaussianBigInt(1n, 0n);
        let base = new GaussianBigInt(this);
        // Exponentiation by squaring
        while (exponent > 0n) {
            if (exponent % 2n == 0n) {
                exponent /= 2n;
                base = base.mul(base);
            }
            else {
                exponent -= 1n;
                result = result.mul(base);
            }
        }
        return result;
    }
    /**
     * Exponentiation. The exponent must be a nonnegative bigint, because negative and complex exponents do not stay within the integers.
     */
    static pow(base, exponent) {
        base = new GaussianBigInt(base);
        exponent = BigInt(exponent);
        return base.pow(exponent);
    }
    /**
     * Finds the greatest common divisor of two Gaussian integers. (To avoid ambiguity, the result returned is always in the first quadrant.)
     */
    gcd(other) {
        other = new GaussianBigInt(other);
        if (other.norm() > this.norm())
            return other.gcd(this);
        if (other.eq(GaussianBigInt.zero))
            return new GaussianBigInt(this).toFirstQuadrant();
        return other.gcd(this.mod(other));
    }
    /**
     * Finds the greatest common divisor of two Gaussian integers. (To avoid ambiguity, the result returned is always in the first quadrant.)
     */
    static gcd(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.gcd(other);
    }
    /**
     * Finds the least common multiple of two Gaussian integers. (To avoid ambiguity, the result returned is always in the first quadrant.)
     */
    lcm(other) {
        other = new GaussianBigInt(other);
        return this.mul(other).div(this.gcd(other)).toFirstQuadrant();
    }
    /**
    * Finds the least common multiple of two Gaussian integers. (To avoid ambiguity, the result returned is always in the first quadrant.)
    */
    static lcm(value, other) {
        value = new GaussianBigInt(value);
        other = new GaussianBigInt(other);
        return value.lcm(other);
    }
    // Constants
    /** Represents 0. */
    static zero = new GaussianBigInt(0n, 0n);
    /** Represents 1. */
    static one = new GaussianBigInt(1n, 0n);
    /** Represents i. */
    static i = new GaussianBigInt(0n, 1n);
    /** Represents -1. */
    static negative_one = new GaussianBigInt(-1n, 0n);
    /** Represents -i. */
    static negative_i = new GaussianBigInt(0n, -1n);
    // Utility functions
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
        if (a >= 0 && b >= 0)
            return a % b;
        else if (a < 0 && b >= 0)
            return b - (GaussianBigInt.#absB(a) % b);
        else
            return -GaussianBigInt.#modB(-a, -b);
    }
}
