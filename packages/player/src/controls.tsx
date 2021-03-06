import React from "react";

export { Controls, useTimeData };

type Step = {
  src: string;
  start: number;
  end: number;
};

type ControlsProps = {
  steps: Step[];
  stepIndex: number;
  videoTime: number;
  onChange: (payload: {
    stepIndex: number;
    videoTime: number;
  }) => void;
};

function Controls({
  steps,
  stepIndex,
  videoTime,
  onChange,
}: ControlsProps) {
  let cumulativeDuration = 0;
  const stepsWithDuration = steps.map((s) => {
    const duration = s.end - s.start;
    cumulativeDuration += duration;
    return {
      ...s,
      duration,
      globalStart: cumulativeDuration - duration,
      globalEnd: cumulativeDuration,
    };
  });

  const totalDuration = stepsWithDuration.reduce(
    (t, s) => s.duration + t,
    0
  );

  const stepTime = videoTime - stepsWithDuration[stepIndex].start;
  const value = stepsWithDuration[stepIndex].globalStart + stepTime;
  return (
    <input
      type="range"
      style={{ width: 300 }}
      max={totalDuration}
      step={0.01}
      value={value}
      onChange={(e) => {
        const value = +e.target.value;
        for (let i = 0; i < stepsWithDuration.length; i++) {
          if (value < stepsWithDuration[i].globalEnd) {
            const stepTime =
              value - stepsWithDuration[i].globalStart;
            onChange({
              stepIndex: i,
              videoTime: stepsWithDuration[i].start + stepTime,
            });
            return;
          }
        }
      }}
    />
  );
}

function useTimeData({
  steps,
  stepIndex,
  videoTime,
}: ControlsProps) {
  const [
    stepsWithDuration,
    totalSeconds,
    getStepAndTime,
  ] = React.useMemo(() => {
    let cumulativeDuration = 0;
    const stepsWithDuration = steps.map((s) => {
      const duration = s.end - s.start;
      cumulativeDuration += duration;
      return {
        ...s,
        duration,
        globalStart: cumulativeDuration - duration,
        globalEnd: cumulativeDuration,
      };
    });
    const totalSeconds = stepsWithDuration.reduce(
      (t, s) => s.duration + t,
      0
    );
    const getStepAndTime = (value: number) => {
      for (let i = 0; i < stepsWithDuration.length; i++) {
        if (value < stepsWithDuration[i].globalEnd) {
          const stepTime = value - stepsWithDuration[i].globalStart;
          return {
            stepIndex: i,
            videoTime: stepsWithDuration[i].start + stepTime,
          };
        }
      }
      throw new Error("Value out of range");
    };
    return [stepsWithDuration, totalSeconds, getStepAndTime];
  }, [steps]);

  const currentStep = stepsWithDuration[stepIndex];
  const stepTime = videoTime - currentStep.start;
  const currentSeconds = Math.min(
    currentStep.globalStart + stepTime,
    totalSeconds
  );
  return { currentSeconds, totalSeconds, getStepAndTime };
}
