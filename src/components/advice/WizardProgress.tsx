'use client'

import React from 'react'

interface WizardProgressProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

interface StepItem {
  id: number
  label: string
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Location' },
  { id: 2, label: 'Field Details' },
  { id: 3, label: 'Satellite Data' },
  { id: 4, label: 'Results' },
]

export default function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  return (
    <nav aria-label="Wizard Progress" className="w-full py-4">
      <ol className="flex items-center justify-between w-full">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep
          const isClickable = Boolean(onStepClick && step.id <= currentStep)

          return (
            <li
              key={step.id}
              className={`flex-1 flex items-center ${
                index !== STEPS.length - 1 ? 'pr-2' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.id)
                  }
                }}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                className={`group flex items-center gap-2 min-h-[44px] text-left transition-colors focus:outline-none ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`w-11 h-11 min-h-[44px] min-w-[44px] rounded-[6px] flex items-center justify-center text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-deepGreen text-offWhite border border-deepGreen'
                      : isActive
                      ? 'bg-deepGreen text-offWhite border border-deepGreen'
                      : 'bg-offWhite border border-border text-ink opacity-50'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    isActive
                      ? 'text-deepGreen font-semibold'
                      : isCompleted
                      ? 'text-ink'
                      : 'text-ink opacity-50'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {index !== STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`flex-1 mx-2 border-t transition-colors ${
                    step.id < currentStep ? 'border-deepGreen' : 'border-border'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
