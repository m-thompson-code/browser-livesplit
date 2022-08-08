import EventEmitter from 'events';

export enum LivesplitAction {
    START = 'START',
    RESET = 'RESET',
    END = 'END',
    SPLIT = 'SPLIT',
}

export enum LivesplitEvent {
    LABELS = 'labels-changed',
    CURRENT_AT = 'current-at-changed',
    START_AT = 'state-at-changed',
    END_AT = 'end-at-changed',
    STATE = 'livesplit-state-changed',
    ACTION = 'livesplit-action',
}

export interface LivesplitState {
    currentAt: number;
    startAt: number;
    endAt: number;
    segments: Segments[];
}

export interface Segments {
    label: string;
    splitAt: number;
    deltaFromStartAt: number;
    deltaFromSplitAt: number;
    completed: boolean;
}

export class Livesplit {
    private readonly eventEmitter = new EventEmitter();
    private intervalRef?: number;

    private currentAt: number = 0;
    private startAt: number = 0;
    private endAt: number = 0;
    
    private segments: Segments[] = [];

    state = this.getState();

    constructor(private labels: string[] = []) {
        this.setLabels(labels);
    }

    initFromState(state: LivesplitState): void {
        this.setLabels(state.segments.map(segment => segment.label));

        this.segments = state.segments.filter(segment => segment.completed);

        this.setEndAt(state.endAt, true);
        this.setStartAt(state.startAt, true);
        this.setCurrentAt(state.currentAt, true);

        if (this.startAt && !this.endAt) {
            this.resumeInterval();
        }

        this.updateState();

        this.eventEmitter.emit(LivesplitEvent.STATE);
    }

    onAction(callback: (action: LivesplitAction, state: LivesplitState) => void) {
        this.eventEmitter.on(LivesplitEvent.ACTION, (action: LivesplitAction) => {
            callback(action, this.state);
        });
    }

    onLabelsChanged(callback: (state: LivesplitState) => void) {
        this.eventEmitter.on(LivesplitEvent.LABELS, () => {
            callback(this.state);
        });
    }

    onCurrentAtChanged(callback: (state: LivesplitState) => void) {
        this.eventEmitter.on(LivesplitEvent.CURRENT_AT, () => {
            callback(this.state);
        });
    }

    onStartAtChanged(callback: (state: LivesplitState) => void) {
        this.eventEmitter.on(LivesplitEvent.START_AT, () => {
            callback(this.state);
        });
    }

    onEndAtChanged(callback: (state: LivesplitState) => void) {
        this.eventEmitter.on(LivesplitEvent.END_AT, () => {
            callback(this.state);
        });
    }

    onStateChanged(callback: (state: LivesplitState) => void) {
        this.eventEmitter.on(LivesplitEvent.STATE, () => {
            callback(this.state);
        });
    }

    setLabels(labels: string[]): void {
        this.labels = labels;

        if (this.startAt) {
            this.reset();
        }

        this.eventEmitter.emit(LivesplitEvent.LABELS);
    }

    protected setCurrentAt(currentAt = Date.now(), skip?: boolean): void {
        this.currentAt = currentAt;

        this.updateState();
        
        this.eventEmitter.emit(LivesplitEvent.CURRENT_AT);

        if (!skip) {
            this.eventEmitter.emit(LivesplitEvent.STATE);
        }
    }

    protected setStartAt(startAt: number, skip?: boolean): void {
        this.startAt = startAt;

        this.setCurrentAt(startAt, true);

        this.updateState();

        this.eventEmitter.emit(LivesplitEvent.START_AT);

        if (!skip) {
            this.eventEmitter.emit(LivesplitEvent.STATE);
        }
    }

    protected setEndAt(endAt: number, skip?: boolean): void {
        this.endAt = endAt;

        this.setCurrentAt(endAt, true);

        this.updateState();

        this.eventEmitter.emit(LivesplitEvent.END_AT);

        if (!skip) {
            this.eventEmitter.emit(LivesplitEvent.STATE);
        }
    }

    start(): void {
        this.clear(true);

        if (!this.labels.length) {
            return;
        }

        this.setStartAt(Date.now(), true);
        this.setEndAt(0, true);

        this.updateState();
        this.eventEmitter.emit(LivesplitEvent.STATE);

        this.resumeInterval();

        this.eventEmitter.emit(LivesplitEvent.ACTION, LivesplitAction.START);
    }

    reset(): void {
        this.clear(true);

        this.setStartAt(0, true);
        this.setEndAt(0, true);

        this.updateState();
        this.eventEmitter.emit(LivesplitEvent.STATE);

        this.pauseInterval();

        this.eventEmitter.emit(LivesplitEvent.ACTION, LivesplitAction.RESET);
    }

    resumeInterval(): void {
        if (!this.startAt) {
            return this.start();
        }

        window.clearInterval(this.intervalRef);

        this.intervalRef = window.setInterval(() => {
            this.setCurrentAt(Date.now());
        }, 1000 / 30);
    }

    pauseInterval(): void {
        clearInterval(this.intervalRef);
    }

    clear(skip?: boolean): void {
        this.segments = [];

        this.updateState();

        if (!skip) {
            this.eventEmitter.emit(LivesplitEvent.STATE);
        }
    }

    split(): void {
        if (!this.startAt) {
            return;
        }

        this.setCurrentAt(Date.now());

        if (this.segments.length < this.labels.length) {
            const i = this.segments.length;
            const previousSplitAt = this.segments[i - 1]?.splitAt ?? this.startAt;

            this.segments.push({
                label: this.labels[i],
                splitAt: this.currentAt,
                deltaFromSplitAt: this.currentAt - previousSplitAt,
                deltaFromStartAt: this.currentAt - this.startAt,
                completed: true,
            });

            this.updateState();
            this.eventEmitter.emit(LivesplitEvent.STATE);

            this.eventEmitter.emit(LivesplitEvent.ACTION, LivesplitAction.SPLIT);
        }

        if (this.segments.length === this.labels.length) {
            this.pauseInterval();

            if (!this.endAt) {
                this.setEndAt(this.currentAt);
            }

            this.eventEmitter.emit(LivesplitEvent.ACTION, LivesplitAction.END);
        }
    }

    next(): void {
        if (this.segments.length >= this.labels.length) {
            this.reset();
            return;
        }

        if (!this.startAt) {
            this.start();
            return;
        }

        this.split();
    }

    getState(): LivesplitState {
        const currentAt = this.endAt || this.currentAt;

        return {
            startAt: this.startAt,
            currentAt,
            endAt: this.endAt,
            segments: this.labels.map((label, i) => {
                const previousSplitAt = this.segments[i - 1]?.splitAt ?? 0;
                const splitAt = i === this.segments.length ? currentAt : 0;

                return this.segments[i] ? { ...this.segments[i] } : {
                    label,
                    deltaFromStartAt: splitAt ? splitAt - this.startAt : 0,
                    deltaFromSplitAt: splitAt && previousSplitAt ? splitAt - previousSplitAt : 0,
                    splitAt,
                    completed: false,
                }
            }),
        };
    }

    updateState(): void {
        this.state = this.getState();
    }
}