import { randomBytes } from 'node:crypto'

/**
 * Generate a secure six-digit OTP
 * @returns A string of six digits
 */
export const generateSecureSixDigitOTP = () => {
	const buffer = randomBytes(3)
	const otp = buffer.readUIntBE(0, 3) % 1000000

	// Ensure it's 6 digits
	return otp.toString().padStart(6, '0')
}
