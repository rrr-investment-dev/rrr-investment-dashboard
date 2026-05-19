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
import { toast } from "sonner";

// dyanamic steps
const steps = ["Basic Info", "Role", "Permissions", "Review"];

// ---- Animated Connector ----
const AnimatedConnector = styled(StepConnector)(() => ({
  "& .MuiStepConnector-line": {
    borderColor: "#e5e7eb",
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

export default function MuiStepperWithSkip() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState<Set<number>>(new Set());
  const [completed, setCompleted] = React.useState<Record<number, boolean>>({});

  const isStepOptional = (step: number) => step === 2;
  const isStepSkipped = (step: number) => skipped.has(step);
  const isStepCompleted = (step: number) => completed[step] === true;

  const handleNext = () => {
    // mark step completed ONLY when Next is clicked
    setCompleted((prev) => ({
      ...prev,
      [activeStep]: true,
    }));

    // if previously skipped but now completed, remove skip
    if (isStepSkipped(activeStep)) {
      setSkipped((prev) => {
        const copy = new Set(prev);
        copy.delete(activeStep);
        return copy;
      });
    }

    const nextStep = activeStep + 1;
    if (nextStep === steps.length) {
      toast.success("Form submitted successfully!");
      handleReset();
    } else {
      setActiveStep(nextStep);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a required step.");
    }

    setSkipped((prev) => new Set(prev).add(activeStep));
    setActiveStep((prev) => prev + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSkipped(new Set());
    setCompleted({});
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} connector={<AnimatedConnector />}>
        {steps.map((label, index) => (
          <Step key={label} completed={isStepCompleted(index)}>
            <StepLabel
              optional={
                isStepOptional(index) ? (
                  <Typography variant="caption">
                    {isStepSkipped(index) ? "Skipped" : "Optional"}
                  </Typography>
                ) : undefined
              }
              StepIconProps={{
                sx: {
                  "&.Mui-active": { color: "#111827" },
                  "&.Mui-completed": { color: "#16a34a" },
                  "&.Mui-disabled": { color: "#e5e7eb" },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ mt: 4 }}>
        <>
          <Typography sx={{ mb: 2 }}>
            Step {activeStep + 1} Content
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>

            {isStepOptional(activeStep) && !isStepCompleted(activeStep) && (
              <Button color="inherit" onClick={handleSkip}>
                Skip
              </Button>
            )}

            <Button variant="contained" onClick={handleNext}>
              {isLastStep ? "Submit" : "Next"}
            </Button>
          </Box>
        </>
      </Box>
    </Box>
  );
}
