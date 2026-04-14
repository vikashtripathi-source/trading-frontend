'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RegisterRequest } from '@/types'
import { apiService } from '@/services/api'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// Step 1: Basic Information Schema
const basicInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 18
  }, 'You must be at least 18 years old'),
})

// Step 2: Address Information Schema
const addressInfoSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters').max(100),
  city: z.string().min(2, 'City must be at least 2 characters').max(50),
  state: z.string().min(2, 'State must be at least 2 characters').max(50),
  zipCode: z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid ZIP code'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(50),
})

// Step 3: Security Settings Schema
const securitySchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Combined schema for form validation
const registerSchema = z.intersection(
  basicInfoSchema,
  z.intersection(addressInfoSchema, securitySchema)
)

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
  } = methods

  const password = watch('password', '')

  // Calculate password strength
  React.useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    setPasswordStrength(strength)
  }, [password])

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Weak'
      case 2:
        return 'Fair'
      case 3:
        return 'Good'
      case 4:
        return 'Strong'
      case 5:
      case 6:
        return 'Very Strong'
      default:
        return 'Weak'
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'bg-danger-500'
      case 2:
        return 'bg-warning-500'
      case 3:
        return 'bg-yellow-500'
      case 4:
        return 'bg-success-500'
      case 5:
      case 6:
        return 'bg-success-600'
      default:
        return 'bg-danger-500'
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: string[] = []
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth']
        break
      case 2:
        fieldsToValidate = ['street', 'city', 'state', 'zipCode', 'country']
        break
      case 3:
        fieldsToValidate = ['password', 'confirmPassword', 'acceptTerms']
        break
    }

    const isStepValid = await trigger(fieldsToValidate as any)
    if (isStepValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    
    try {
      const response = await apiService.register(data)
      toast.success('Registration successful! Please check your email for verification.')
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Personal Information'
      case 2:
        return 'Address Details'
      case 3:
        return 'Security Settings'
      default:
        return 'Registration'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Tell us about yourself'
      case 2:
        return 'Where should we send your documents?'
      case 3:
        return 'Create a secure password for your account'
      default:
        return 'Complete your registration'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and App Name */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            TradePro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your professional trading account
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                    step <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={cn(
                      'flex-1 h-1 mx-4',
                      step < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getStepTitle()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {getStepDescription()}
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="p-8">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      placeholder="Enter your first name"
                      {...register('firstName')}
                      error={errors.firstName?.message}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Enter your last name"
                      {...register('lastName')}
                      error={errors.lastName?.message}
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth')}
                    error={errors.dateOfBirth?.message}
                  />
                </div>
              )}

              {/* Step 2: Address Information */}
              {currentStep === 2 && (
                <div className="space-y-6 fade-in">
                  <Input
                    label="Street Address"
                    placeholder="123 Main Street"
                    {...register('street')}
                    error={errors.street?.message}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="City"
                      placeholder="New York"
                      {...register('city')}
                      error={errors.city?.message}
                    />
                    <Input
                      label="State"
                      placeholder="NY"
                      {...register('state')}
                      error={errors.state?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="ZIP Code"
                      placeholder="10001"
                      {...register('zipCode')}
                      error={errors.zipCode?.message}
                    />
                    <Input
                      label="Country"
                      placeholder="United States"
                      {...register('country')}
                      error={errors.country?.message}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Security Settings */}
              {currentStep === 3 && (
                <div className="space-y-6 fade-in">
                  <div>
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Create a strong password"
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Password Strength
                          </span>
                          <span className="text-sm font-medium">
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn('h-2 rounded-full transition-all duration-300', getPasswordStrengthColor())}
                            style={{ width: `${(passwordStrength / 6) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                  />
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Password Requirements:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li className="flex items-center">
                        <svg className={cn('w-4 h-4 mr-2', password.length >= 8 ? 'text-success-500' : 'text-gray-400')} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        At least 8 characters
                      </li>
                      <li className="flex items-center">
                        <svg className={cn('w-4 h-4 mr-2', /[a-z]/.test(password) ? 'text-success-500' : 'text-gray-400')} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        One lowercase letter
                      </li>
                      <li className="flex items-center">
                        <svg className={cn('w-4 h-4 mr-2', /[A-Z]/.test(password) ? 'text-success-500' : 'text-gray-400')} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        One uppercase letter
                      </li>
                      <li className="flex items-center">
                        <svg className={cn('w-4 h-4 mr-2', /[0-9]/.test(password) ? 'text-success-500' : 'text-gray-400')} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        One number
                      </li>
                      <li className="flex items-center">
                        <svg className={cn('w-4 h-4 mr-2', /[^a-zA-Z0-9]/.test(password) ? 'text-success-500' : 'text-gray-400')} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        One special character
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      I accept the{' '}
                      <Link href="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-danger-600">{errors.acceptTerms.message}</p>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 1 ? () => router.push('/auth/login') : previousStep}
                  disabled={isLoading}
                >
                  {currentStep === 1 ? 'Back to Login' : 'Previous'}
                </Button>
                <Button
                  type={currentStep === 3 ? 'submit' : 'button'}
                  onClick={currentStep !== 3 ? nextStep : undefined}
                  loading={isLoading && currentStep === 3}
                  disabled={isLoading || (currentStep !== 3 && !isValid)}
                >
                  {currentStep === 3 ? (isLoading ? 'Creating Account...' : 'Create Account') : 'Next'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 TradePro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
