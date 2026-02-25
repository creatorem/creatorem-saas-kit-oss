'use client';

import { Icon } from '@kit/ui/icon';
import { Label } from '@kit/ui/label';
import * as React from 'react';
import { TimePickerInput } from './time-picker-input';

interface TimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    disabled?: boolean;
}

export function TimePicker({ date, setDate, disabled }: TimePickerProps) {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const secondRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-end gap-2">
            <div className="grid gap-1 text-center">
                <Label htmlFor="hours" className="text-xs">
                    Hours
                </Label>
                <TimePickerInput
                    picker="hours"
                    date={date}
                    setDate={setDate}
                    ref={hourRef}
                    onRightFocus={() => minuteRef.current?.focus()}
                    disabled={disabled}
                />
            </div>
            <div className="grid gap-1 text-center">
                <Label htmlFor="minutes" className="text-xs">
                    Minutes
                </Label>
                <TimePickerInput
                    picker="minutes"
                    date={date}
                    setDate={setDate}
                    ref={minuteRef}
                    onLeftFocus={() => hourRef.current?.focus()}
                    onRightFocus={() => secondRef.current?.focus()}
                    disabled={disabled}
                />
            </div>
            <div className="grid gap-1 text-center">
                <Label htmlFor="seconds" className="text-xs">
                    Seconds
                </Label>
                <TimePickerInput
                    picker="seconds"
                    date={date}
                    setDate={setDate}
                    ref={secondRef}
                    onLeftFocus={() => minuteRef.current?.focus()}
                    disabled={disabled}
                />
            </div>
            <div className="flex h-10 items-center">
                <Icon name="Clock" className="ml-2 h-4 w-4" />
            </div>
        </div>
    );
}
