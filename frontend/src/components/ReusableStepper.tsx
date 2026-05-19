"use client";

import * as React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  StepConnector,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

/* ---------- Types ---------- */
type StepItem = {
  label: string;
  content: React.ReactNode;
  optional?: boolean;
  isValid?: boolean;
  onNext?: () => Promise<void> | void;
};

type ReusableStepperProps = {
  steps: StepItem[];
  onSubmit?: () => void;
};

/* ---------- Animated Connector ---------- */
const AnimatedConnector = styled(StepConnector)(() => ({
  "& .MuiStepConnector-line": {
    borderColor: "var(--border)",
    borderTopWidth: 2,
    transition: "border-color 0.4s ease-in-out",
  },
  "&.Mui-active .MuiStepConnector-line": {
    borderColor: "#16a34a",
  },
  "&.Mui-completed .MuiStepConnector-line": {
    borderColor: "#16a34a",
  },
}));

/* ---------- Component ---------- */
export function ReusableStepper({ steps, onSubmit }: ReusableStepperProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState<Set<number>>(new Set());

  const isStepOptional = (step: number) => steps[step]?.optional;
  const isStepSkipped = (step: number) =>
    skipped.has(step) && step < activeStep;

  /** ✅ BEST PRACTICE: derived completion */
  // const isStepCompleted = (step: number) =>
  //   step < activeStep && !isStepSkipped(step);

  const handleNext = async () => {
    // Execute onNext hook if provided
    if (steps[activeStep].onNext) {
      await steps[activeStep].onNext();
    }

    // ✅ If user clicks Next, this step is NOT skipped
    if (skipped.has(activeStep)) {
      setSkipped((prev) => {
        const copy = new Set(prev);
        copy.delete(activeStep);
        return copy;
      });
    }

    const nextStep = activeStep + 1;

    if (nextStep === steps.length) {
      onSubmit?.();
    } else {
      setActiveStep(nextStep);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) return;

    setSkipped((prev) => new Set(prev).add(activeStep));
    setActiveStep((prev) => prev + 1);
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} connector={<AnimatedConnector />}>
        {steps.map((step, index) => (
          <Step key={step.label} completed={index < activeStep}>
            <StepLabel
              optional={
                step.optional ? (
                  <Typography
                    variant="caption"
                    sx={{
                      color: isStepSkipped(index)
                        ? "var(--muted-foreground)"
                        : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {isStepSkipped(index) ? "Skipped" : "Optional"}
                  </Typography>
                ) : undefined
              }
              sx={{
                "& .MuiStepLabel-label": {
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  color: isStepSkipped(index)
                    ? "var(--muted-foreground)"     // skipped
                    : index === activeStep
                      ? "#ffffff"                   // active  → white
                      : index < activeStep
                        ? "var(--foreground)"       // completed
                        : "var(--muted-foreground)",// future steps
                },
                "& .MuiStepLabel-label.Mui-active": {
                  color: "#ffffff",
                  fontWeight: 700,
                },
              }}
              StepIconProps={{
                sx: {
                  // 🔢 Active step
                  "&.Mui-active": {
                    color: "#ffffff",
                    "& .MuiStepIcon-text": {
                      fill: "#000000",
                    },
                  },
                  // ✅ Completed step
                  "&.Mui-completed": {
                    color: isStepSkipped(index)
                      ? "var(--muted-foreground)"
                      : "#16a34a",
                  },
                  // ⚪ Default / future steps
                  "&.Mui-disabled": {
                    color: "var(--muted-foreground)",
                    opacity: 0.5,
                  },
                },
              }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Content */}
      <Box sx={{ mt: 4 }}>
        <div className="flex justify-center mt-14">
          <div className="w-full max-w-[900px] min-h-[60vh]">
            {steps[activeStep].content}
          </div>
        </div>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 3,
            justifyContent: "space-between",
          }}
        >
          <Button 
            disabled={activeStep === 0} 
            onClick={handleBack}
            sx={{
              color: "var(--foreground)",
              "&.Mui-disabled": {
                color: "var(--muted-foreground)",
                opacity: 0.5,
              }
            }}
          >
            Back
          </Button>

          <Box>
            {isStepOptional(activeStep) && (
              <Button 
                color="inherit" 
                onClick={handleSkip}
                sx={{ color: "var(--foreground)", mr: 1 }}
              >
                Skip
              </Button>
            )}

            <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={steps[activeStep].isValid === false}
                sx={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  "&:hover": {
                    backgroundColor: "var(--primary)",
                    opacity: 0.9,
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "var(--muted)",
                    color: "var(--muted-foreground)",
                    opacity: 0.5,
                  }
                }}
            >
              {isLastStep ? "Submit" : "Next"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
