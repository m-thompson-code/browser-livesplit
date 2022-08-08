import EventEmitter from "events";

export interface LivesplitRowState {
    label: string;
    deltaFromStartAt: number;
    deltaFromSplitAt: number;
}

export enum LivesplitRowEvent {
    LABEL = 'label-changed',
    DELTA_FROM_START_AT = 'delta-from-start-at-changed',
    DELTA_FROM_SPLIT_AT = 'delta-from-split-at-changed',
}

export class LivesplitRow {
    private readonly eventEmitter = new EventEmitter();

    state = this.getState();

    constructor(private label = "", private deltaFromStartAt = 0, private deltaFromSplitAt = 0) {
        this.setLabel(label);
        this.setDeltaFromStartAt(deltaFromStartAt);
        this.setDeltaFromSplitAt(deltaFromSplitAt);
    }

    setLabel(label: string) {
        const oldLabel = this.label;

        this.label = label;

        this.updateState();

        if (oldLabel !== label) {
            this.eventEmitter.emit(LivesplitRowEvent.LABEL, this.state);
        }
    }

    setDeltaFromStartAt(deltaFromStartAt: number) {
        const oldDelta = this.deltaFromStartAt;

        this.deltaFromStartAt = deltaFromStartAt;

        this.updateState();

        if (oldDelta !== deltaFromStartAt) {
            this.eventEmitter.emit(LivesplitRowEvent.DELTA_FROM_START_AT, this.state);
        }
    }

    setDeltaFromSplitAt(deltaFromSplitAt: number) {
        const oldDelta = this.deltaFromSplitAt;

        this.deltaFromSplitAt = deltaFromSplitAt;

        this.updateState();

        if (oldDelta !== deltaFromSplitAt) {
            this.eventEmitter.emit(LivesplitRowEvent.DELTA_FROM_SPLIT_AT, this.state);
        }
    }

    onLabelChanged(callback: (state: LivesplitRowState) => void) {
        this.eventEmitter.on(LivesplitRowEvent.LABEL, () => {
            callback(this.state);
        });
    }

    onDeltaFromStartAtChanged(callback: (state: LivesplitRowState) => void) {
        this.eventEmitter.on(LivesplitRowEvent.DELTA_FROM_START_AT, () => {
            callback(this.state);
        });
    }

    onDeltaFromSplitAtChanged(callback: (state: LivesplitRowState) => void) {
        this.eventEmitter.on(LivesplitRowEvent.DELTA_FROM_SPLIT_AT, () => {
            callback(this.state);
        });
    }

    getState(): LivesplitRowState {
        return {
            label: this.label,
            deltaFromStartAt: this.deltaFromStartAt,
            deltaFromSplitAt: this.deltaFromSplitAt,
        };
    }

    updateState(): void {
        this.state = this.getState();
    }
}
